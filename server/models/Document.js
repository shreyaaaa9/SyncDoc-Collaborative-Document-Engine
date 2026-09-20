const mongoose = require("mongoose");

// AST node structure for block-based content
const astNodeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["paragraph", "heading", "code", "list", "image"],
    },
    content: {
      type: String,
      default: "",
    },
    children: [
      {
        type: mongoose.Schema.Types.Mixed, // supports nested AST nodes
      },
    ],
    metadata: {
      type: Map,
      of: String,
    },
  },
  { _id: true }
);

// Pre-save hook to validate AST node depth (max 5 levels)
astNodeSchema.pre("save", function (next) {
  const checkDepth = (node, depth) => {
    if (depth > 5) throw new Error("AST node depth exceeds maximum of 5");
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => checkDepth(child, depth + 1));
    }
  };
  checkDepth(this, 0);
  next();
});

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
