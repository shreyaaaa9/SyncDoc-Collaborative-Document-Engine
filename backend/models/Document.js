const mongoose = require("mongoose");

// Supported AST node types — expanded for transformation pipeline
const AST_NODE_TYPES = [
  "paragraph",
  "heading",
  "code",
  "list",
  "list-item",
  "image",
  "blockquote",
  "table",
  "table-row",
  "table-cell",
  "horizontal-rule",
  "link",
  "text",
  "bold",
  "italic",
  "inline-code",
];

// Recursive AST node validator (checks depth and structure)
const validateASTNode = (node, depth = 0) => {
  if (depth > 10) {
    throw new Error(`AST node depth exceeds maximum of 10 at depth ${depth}`);
  }
  if (!node || typeof node !== "object") {
    throw new Error("AST node must be an object");
  }
  if (!node.type || typeof node.type !== "string") {
    throw new Error("AST node must have a string 'type' field");
  }
  if (!AST_NODE_TYPES.includes(node.type)) {
    throw new Error(`Unknown AST node type: "${node.type}"`);
  }
  if (node.children && Array.isArray(node.children)) {
    if (node.children.length > 200) {
      throw new Error(
        `AST node has too many children (${node.children.length}). Maximum is 200.`
      );
    }
    node.children.forEach((child) => validateASTNode(child, depth + 1));
  }
};

// AST node schema — supports full nested document structure
const astNodeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "AST node type is required"],
      enum: {
        values: AST_NODE_TYPES,
        message: "AST node type '{VALUE}' is not supported",
      },
    },
    content: {
      type: String,
      default: "",
      maxlength: [50000, "AST node content cannot exceed 50,000 characters"],
    },
    // Nested child nodes stored as Mixed for flexibility
    children: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    // Structured attributes (level for headings, language for code, href for links)
    attrs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Flexible metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    // Position info for conflict resolution
    position: {
      start: { type: Number, default: 0 },
      end: { type: Number, default: 0 },
    },
  },
  { _id: true }
);

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // AST-based content blocks
    content: {
      type: [astNodeSchema],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Yjs binary state for real-time collaboration
    yjsState: {
      type: Buffer,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    activeCollaborators: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Track which version this document was restored from
    restoredFromVersion: {
      type: Number,
      default: null,
    },
    // AST schema version for migration tracking
    schemaVersion: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true }
);

// Indexes for performance
documentSchema.index({ owner: 1, updatedAt: -1 });
documentSchema.index({ isPublic: 1, updatedAt: -1 });
documentSchema.index({ title: "text" });

// Note: AST validation is handled in the controller via validateASTNode()
// Size and structure checks are done before save, not in a pre-save hook

module.exports = mongoose.model("Document", documentSchema);
module.exports.AST_NODE_TYPES = AST_NODE_TYPES;
module.exports.validateASTNode = validateASTNode;
