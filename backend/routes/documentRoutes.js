const express = require("express");

const {
  createDocument,
  getDocument
} = require("../controllers/documentController");

const router = express.Router();

// Create a new document
router.post("/", createDocument);

// Get a document by ID
router.get("/:id", getDocument);

module.exports = router;
