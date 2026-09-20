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

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
