const Document = require("../models/Document");
const Version = require("../models/Version");

// @desc    Create a new document
// @route   POST /api/documents
const createDocument = async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;

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
      changeDescription: "Initial version",
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
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
    const document = await Document.findById(req.params.id);

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
    const { title, content, isPublic } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Save current state as a new version before updating
    const latestVersion = await Version.findOne({
      document: document._id,
    }).sort({ versionNumber: -1 });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    await Version.create({
      document: document._id,
      versionNumber: newVersionNumber,
      content: document.content,
      changeDescription: "Updated version",
    });

    // Apply updates
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (isPublic !== undefined) document.isPublic = isPublic;

    const updatedDocument = await document.save();

    res.status(200).json({ success: true, data: updatedDocument });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Delete all versions of this document too
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
    const { yjsState, content, saveType, changeDescription, clientVersion } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Optimistic concurrency check — if client sends a version,
    // reject the update if the document has already been updated by someone else
    if (clientVersion !== undefined && document.__v !== clientVersion) {
      return res.status(409).json({
        success: false,
        message: "Document was updated by another client. Please re-sync.",
        currentVersion: document.__v,
      });
    }

    // Convert base64 Yjs state to Buffer for storage
    const yjsBuffer = yjsState ? Buffer.from(yjsState, "base64") : null;

    // Get latest version number
    const latestVersion = await Version.findOne({
      document: document._id,
    }).sort({ versionNumber: -1 });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Save version snapshot with both AST content and Yjs state
    await Version.create({
      document: document._id,
      versionNumber: newVersionNumber,
      content: content || document.content,
      yjsState: yjsBuffer,
      saveType: saveType || "auto",
      changeDescription: changeDescription || "Collaborative sync",
    });

    // Update document with latest Yjs state
    // Using $inc on __v for atomic version bump (concurrency safe)
    document.yjsState = yjsBuffer;
    document.lastSyncedAt = new Date();
    if (content !== undefined) document.content = content;

    await document.save();

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
    // Mongoose version conflict error
    if (error.name === "VersionError") {
      return res.status(409).json({
        success: false,
        message: "Concurrent update conflict. Please re-sync and try again.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get version history of a document
// @route   GET /api/documents/:id/versions
const getDocumentVersions = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Return versions without yjsState binary (too large for list view)
    const versions = await Version.find({ document: document._id })
      .sort({ versionNumber: -1 })
      .select("-yjsState");

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a specific version with full Yjs state
// @route   GET /api/documents/:id/versions/:versionNumber
const getDocumentVersionById = async (req, res) => {
  try {
    const version = await Version.findOne({
      document: req.params.id,
      versionNumber: req.params.versionNumber,
    });

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }

    // Convert Buffer back to base64 so Shreya's Yjs can consume it
    const versionData = version.toObject();
    if (versionData.yjsState) {
      versionData.yjsState = Buffer.from(versionData.yjsState).toString("base64");
    }

    res.status(200).json({ success: true, data: versionData });
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
};
