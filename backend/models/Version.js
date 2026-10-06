const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
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
      enum: ["manual", "auto", "disconnect", "conflict-resolved", "restored"],
      default: "auto",
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changeDescription: {
      type: String,
      default: "Auto-saved version",
      maxlength: [500, "Change description cannot exceed 500 characters"],
    },
    // If this version was created by restoring a previous one, track which
    restoredFromVersion: {
      type: Number,
      default: null,
    },
    // Approximate size of this version's content in bytes (for performance monitoring)
    contentSize: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for fast version lookup
versionSchema.index({ document: 1, versionNumber: -1 });
versionSchema.index({ document: 1, createdAt: -1 });
versionSchema.index({ document: 1, saveType: 1 });

// Pre-save: calculate content size
versionSchema.pre("save", async function () {
  if (this.content) {
    this.contentSize = JSON.stringify(this.content).length;
  }
});

module.exports = mongoose.model("Version", versionSchema);
