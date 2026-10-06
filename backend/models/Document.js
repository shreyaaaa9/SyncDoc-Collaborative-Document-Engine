const mongoose = require("mongoose");

// AST node structure for block-based content
const astNodeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "paragraph",
        "heading",
        "code",
        "list",
        "listItem",
        "text",
        "blockquote",
        "thematicBreak",
        "break",
        "inlineCode",
        "emphasis",
        "strong",
        "delete",
        "image",
      ],
    },

    content: {
      type: String,
      default: "",
    },

    depth: {
      type: Number,
    },

    ordered: {
      type: Boolean,
    },

    value: {
      type: String,
    },

    lang: {
      type: String,
    },

    children: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],

    metadata: {
      type: Map,
      of: String,
    },
  },
  { _id: true }
);

// Validate AST node depth (maximum 5 levels)
astNodeSchema.pre("save", function () {
  const checkDepth = (node, depth) => {
    if (depth > 5) {
      throw new Error("AST node depth exceeds maximum of 5");
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        checkDepth(child, depth + 1);
      });
    }
  };

  checkDepth(this, 0);
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

    // Yjs binary state for real-time collaboration
    yjsState: {
      type: Buffer,
      default: null,
    },

    // Last time a Yjs sync was saved
    lastSyncedAt: {
      type: Date,
      default: null,
    },

    // Number of active collaborators
    activeCollaborators: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);
