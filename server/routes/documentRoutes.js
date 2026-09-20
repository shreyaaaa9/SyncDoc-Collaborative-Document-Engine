const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require("../controllers/documentController");

// Validation rules for creating/updating a document
const documentValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Routes
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.post("/", documentValidation, validate, createDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
