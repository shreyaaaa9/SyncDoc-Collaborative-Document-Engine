const express = require("express");
const router = express.Router();
const { body, param, query, validationResult } = require("express-validator");
const {
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
} = require("../controllers/documentController");

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Validation rules
const createDocValidation = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters"),
];

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];

const versionNumberValidation = [
  param("versionNumber").isInt({ min: 1 }).withMessage("versionNumber must be a positive integer"),
];

// ─── Document CRUD ───────────────────────────────────────────────────────────
router.get("/", paginationValidation, validate, getDocuments);
router.post("/", createDocValidation, validate, createDocument);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

// ─── AST Validation ──────────────────────────────────────────────────────────
// POST /api/documents/validate-ast  — validate AST without saving
router.post("/validate-ast", validateAST);

// ─── Document Stats ──────────────────────────────────────────────────────────
// GET /api/documents/:id/stats
router.get("/:id/stats", getDocumentStats);

// ─── Collaborative Sync ───────────────────────────────────────────────────────
// POST /api/documents/:id/sync
router.post("/:id/sync", syncDocument);

// ─── AST Transformation Pipeline ─────────────────────────────────────────────
// POST /api/documents/:id/transform
// Body: { operations: [{ op, nodeId, node, position }], changeDescription, clientVersion }
router.post("/:id/transform", transformDocument);

// ─── Version History ──────────────────────────────────────────────────────────
// GET  /api/documents/:id/versions?page=1&limit=20&saveType=manual
router.get("/:id/versions", paginationValidation, validate, getDocumentVersions);

// GET  /api/documents/:id/versions/:versionNumber
router.get("/:id/versions/:versionNumber", versionNumberValidation, validate, getDocumentVersionById);

// POST /api/documents/:id/versions/:versionNumber/restore
router.post("/:id/versions/:versionNumber/restore", versionNumberValidation, validate, restoreDocumentVersion);

module.exports = router;
