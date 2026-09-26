const Document = require("../models/Document");

// Create a new document
const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    const document = await Document.create({
      title,
      content
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Create document error:", error.message);
    res.status(500).json({
      message: "Failed to create document"
    });
  }
};

// Get a document by ID
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    res.json(document);
  } catch (error) {
    console.error("Get document error:", error.message);
    res.status(500).json({
      message: "Failed to get document"
    });
  }
};

module.exports = {
  createDocument,
  getDocument
};
