const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    // Snapshot of the document content (AST) at this version
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    // Yjs binary state snapshot at this version
    yjsState: {
      type: Buffer,
      default: null,
    },
    // Type of save that triggered this version
    saveType: {
      type: String,
      enum: ["manual", "auto", "disconnect", "conflict-resolved"],
      default: "auto",
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changeDescription: {
      type: String,
      default: "Auto-saved version",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Version", versionSchema);
