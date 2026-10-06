const Document = require("../models/Document");
const Version = require("../models/Version");
const { validateASTNode } = require("../models/Document");

// Max versions to keep per document before pruning old auto-saves
const MAX_AUTO_VERSIONS = 50;

// Helper: get next version number for a document
const getNextVersionNumber = async (documentId) => {
  const latest = await Version.findOne({ document: documentId }).sort({
    versionNumber: -1,
  });
  return latest ? latest.versionNumber + 1 : 1;
};

// Helper: prune old auto-saved versions, keeping manual/conflict-resolved ones
const pruneOldVersions = async (documentId) => {
  const autoVersions = await Version.find({
    document: documentId,
    saveType: "auto",
  })
    .sort({ versionNumber: -1 })
    .select("_id versionNumber");

  if (autoVersions.length > MAX_AUTO_VERSIONS) {
    const toDelete = autoVersions
      .slice(MAX_AUTO_VERSIONS)
      .map((v) => v._id);
    await Version.deleteMany({ _id: { $in: toDelete } });
  }
};

// @desc    Create a new document
// @route   POST /api/documents
const createDocument = async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;

    // Validate AST nodes if provided
    if (content && Array.isArray(content)) {
      for (const node of content) {
        try {
          validateASTNode(node);
        } catch (validationErr) {
          return res.status(400).json({
            success: false,
            message: `Invalid AST structure: ${validationErr.message}`,
          });
        }
      }
    }

    const document = await Document.create({
      title,
      content: content || [],
      isPublic: isPublic || false,
    });

    // Save initial version
    await Version.create({
      document: document._id,
      versionNumber: 1,
      content: document.content,
      saveType: "manual",
      changeDescription: "Initial version",
      contentSize: JSON.stringify(document.content).length,
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all documents (with pagination)
// @route   GET /api/documents?page=1&limit=20&search=title
const getDocuments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search;

    // Build query
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }

    const [documents, total] = await Promise.all([
      Document.find(query)
        .select("-yjsState -content") // exclude heavy fields from list
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
const getDocumentById = async (req, res) => {
  try {
    // Validate ObjectId format before querying
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const document = await Document.findById(req.params.id).select("-yjsState");

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
const updateDocument = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    const { title, content, isPublic } = req.body;

    // Validate AST nodes if content is being updated
    if (content && Array.isArray(content)) {
      for (const node of content) {
        try {
          validateASTNode(node);
        } catch (validationErr) {
          return res.status(400).json({
            success: false,
            message: `Invalid AST structure: ${validationErr.message}`,
          });
        }
      }
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Save current state as a new version before updating
    const newVersionNumber = await getNextVersionNumber(document._id);

    await Version.create({
      document: document._id,
      versionNumber: newVersionNumber,
      content: document.content,
      saveType: "manual",
      changeDescription: "Updated version",
      contentSize: JSON.stringify(document.content).length,
    });

    // Apply updates
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (isPublic !== undefined) document.isPublic = isPublic;

    const updatedDocument = await document.save();

    // Prune old auto-saves in background
    pruneOldVersions(document._id).catch(console.error);

    res.status(200).json({ success: true, data: updatedDocument });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    await Version.deleteMany({ document: document._id });
    await document.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Yjs collaborative state (called by sync engine)
// @route   POST /api/documents/:id/sync
const syncDocument = async (req, res) => {
  try {
    const { yjsState, content, saveType, changeDescription, clientVersion } =
      req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Optimistic concurrency check
    if (clientVersion !== undefined && document.__v !== clientVersion) {
      return res.status(409).json({
        success: false,
        message: "Document was updated by another client. Please re-sync.",
        currentVersion: document.__v,
      });
    }

    // Validate AST content if provided
    if (content && Array.isArray(content)) {
      for (const node of content) {
        try {
          validateASTNode(node);
        } catch (validationErr) {
          return res.status(400).json({
            success: false,
            message: `Invalid AST structure in sync: ${validationErr.message}`,
          });
        }
      }
    }

    const yjsBuffer = yjsState ? Buffer.from(yjsState, "base64") : null;
    const newVersionNumber = await getNextVersionNumber(document._id);

    await Version.create({
      document: document._id,
      versionNumber: newVersionNumber,
      content: content || document.content,
      yjsState: yjsBuffer,
      saveType: saveType || "auto",
      changeDescription: changeDescription || "Collaborative sync",
      contentSize: JSON.stringify(content || document.content).length,
    });

    document.yjsState = yjsBuffer;
    document.lastSyncedAt = new Date();
    if (content !== undefined) document.content = content;

    await document.save();

    // Prune old auto-saves in background
    pruneOldVersions(document._id).catch(console.error);

    res.status(200).json({
      success: true,
      message: "Document state synced successfully",
      data: {
        documentId: document._id,
        versionNumber: newVersionNumber,
        documentVersion: document.__v,
        lastSyncedAt: document.lastSyncedAt,
      },
    });
  } catch (error) {
    if (error.name === "VersionError") {
      return res.status(409).json({
        success: false,
        message: "Concurrent update conflict. Please re-sync and try again.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get version history of a document (with pagination)
// @route   GET /api/documents/:id/versions?page=1&limit=20&saveType=manual
const getDocumentVersions = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).select("_id title");

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const saveTypeFilter = req.query.saveType;

    const query = { document: document._id };
    if (saveTypeFilter) query.saveType = saveTypeFilter;

    const [versions, total] = await Promise.all([
      Version.find(query)
        .sort({ versionNumber: -1 })
        .skip(skip)
        .limit(limit)
        .select("-yjsState"), // exclude binary from list
      Version.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: versions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: versions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a specific version with full content and Yjs state
// @route   GET /api/documents/:id/versions/:versionNumber
const getDocumentVersionById = async (req, res) => {
  try {
    const version = await Version.findOne({
      document: req.params.id,
      versionNumber: parseInt(req.params.versionNumber),
    });

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }

    const versionData = version.toObject();
    if (versionData.yjsState) {
      versionData.yjsState = Buffer.from(versionData.yjsState).toString(
        "base64"
      );
    }

    res.status(200).json({ success: true, data: versionData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore document to a specific version
// @route   POST /api/documents/:id/versions/:versionNumber/restore
const restoreDocumentVersion = async (req, res) => {
  try {
    const targetVersionNumber = parseInt(req.params.versionNumber);

    const [document, targetVersion] = await Promise.all([
      Document.findById(req.params.id),
      Version.findOne({
        document: req.params.id,
        versionNumber: targetVersionNumber,
      }),
    ]);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    if (!targetVersion) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }

    // Save current state as a new version before restoring
    const newVersionNumber = await getNextVersionNumber(document._id);

    await Version.create({
      document: document._id,
      versionNumber: newVersionNumber,
      content: document.content,
      yjsState: document.yjsState,
      saveType: "restored",
      changeDescription: `Restored to version ${targetVersionNumber}`,
      restoredFromVersion: targetVersionNumber,
      contentSize: JSON.stringify(document.content).length,
    });

    // Apply the restored content
    document.content = targetVersion.content;
    if (targetVersion.yjsState) {
      document.yjsState = targetVersion.yjsState;
    }
    document.restoredFromVersion = targetVersionNumber;
    document.lastSyncedAt = new Date();

    await document.save();

    res.status(200).json({
      success: true,
      message: `Document restored to version ${targetVersionNumber}`,
      data: {
        documentId: document._id,
        restoredFromVersion: targetVersionNumber,
        newVersionNumber,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply an AST transformation/patch to a document
// @route   POST /api/documents/:id/transform
// Expects: { operations: [{ op: "insert"|"delete"|"update", nodeId, node, position }] }
const transformDocument = async (req, res) => {
  try {
    const { operations, changeDescription, clientVersion } = req.body;

    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "operations array is required",
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Optimistic concurrency check
    if (clientVersion !== undefined && document.__v !== clientVersion) {
      return res.status(409).json({
        success: false,
        message: "Document was updated by another client. Please re-sync.",
        currentVersion: document.__v,
      });
    }

    // Save snapshot before transformation
    const newVersionNumber = await getNextVersionNumber(document._id);
    await Version.create({
      document: document._id,
      versionNumber: newVersionNumber,
      content: document.content,
      saveType: "auto",
      changeDescription: changeDescription || `Transformation: ${operations.length} op(s)`,
      contentSize: JSON.stringify(document.content).length,
    });

    // Apply operations to content array
    let contentArr = document.content.map((n) =>
      n.toObject ? n.toObject() : n
    );

    for (const op of operations) {
      switch (op.op) {
        case "insert": {
          // Validate the new node
          try {
            validateASTNode(op.node);
          } catch (err) {
            return res.status(400).json({
              success: false,
              message: `Invalid AST node in insert operation: ${err.message}`,
            });
          }
          const pos =
            op.position !== undefined ? op.position : contentArr.length;
          contentArr.splice(pos, 0, op.node);
          break;
        }
        case "delete": {
          const idx = contentArr.findIndex(
            (n) => n._id && n._id.toString() === op.nodeId
          );
          if (idx !== -1) contentArr.splice(idx, 1);
          break;
        }
        case "update": {
          const idx = contentArr.findIndex(
            (n) => n._id && n._id.toString() === op.nodeId
          );
          if (idx !== -1) {
            const updated = { ...contentArr[idx], ...op.node };
            try {
              validateASTNode(updated);
            } catch (err) {
              return res.status(400).json({
                success: false,
                message: `Invalid AST node in update operation: ${err.message}`,
              });
            }
            contentArr[idx] = updated;
          }
          break;
        }
        case "move": {
          const fromIdx = contentArr.findIndex(
            (n) => n._id && n._id.toString() === op.nodeId
          );
          if (fromIdx !== -1 && op.position !== undefined) {
            const [node] = contentArr.splice(fromIdx, 1);
            contentArr.splice(op.position, 0, node);
          }
          break;
        }
        default:
          return res.status(400).json({
            success: false,
            message: `Unknown operation type: "${op.op}". Supported: insert, delete, update, move`,
          });
      }
    }

    document.content = contentArr;
    await document.save();

    res.status(200).json({
      success: true,
      message: `Applied ${operations.length} transformation(s)`,
      data: {
        documentId: document._id,
        operationsApplied: operations.length,
        versionNumber: newVersionNumber + 1,
        contentLength: contentArr.length,
      },
    });
  } catch (error) {
    if (error.name === "VersionError") {
      return res.status(409).json({
        success: false,
        message: "Concurrent update conflict. Please re-sync and try again.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate an AST structure without saving
// @route   POST /api/documents/validate-ast
const validateAST = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !Array.isArray(content)) {
      return res.status(400).json({
        success: false,
        message: "content must be an array of AST nodes",
      });
    }

    const errors = [];
    content.forEach((node, i) => {
      try {
        validateASTNode(node);
      } catch (err) {
        errors.push({ index: i, message: err.message });
      }
    });

    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: "AST validation failed",
        errors,
      });
    }

    res.status(200).json({
      success: true,
      message: "AST is valid",
      nodeCount: content.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get document statistics and performance info
// @route   GET /api/documents/:id/stats
const getDocumentStats = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).select(
      "-yjsState -content"
    );

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const [versionCount, manualVersionCount, totalContentSize] =
      await Promise.all([
        Version.countDocuments({ document: document._id }),
        Version.countDocuments({ document: document._id, saveType: "manual" }),
        Version.aggregate([
          { $match: { document: document._id } },
          { $group: { _id: null, total: { $sum: "$contentSize" } } },
        ]),
      ]);

    const fullDoc = await Document.findById(req.params.id).select("content");
    const contentSize = JSON.stringify(fullDoc.content).length;

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        currentContentSize: contentSize,
        currentContentNodes: fullDoc.content.length,
        totalVersions: versionCount,
        manualVersions: manualVersionCount,
        autoVersions: versionCount - manualVersionCount,
        totalVersionStorageBytes:
          totalContentSize[0] ? totalContentSize[0].total : 0,
        lastSyncedAt: document.lastSyncedAt,
        schemaVersion: document.schemaVersion,
        restoredFromVersion: document.restoredFromVersion,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  syncDocument,
  getDocumentVersions,
  getDocumentVersionById,
  restoreDocumentVersion,
  transformDocument,
  validateAST,
  getDocumentStats,
};
