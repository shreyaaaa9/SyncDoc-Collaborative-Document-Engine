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
    // Snapshot of the document content at this version
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
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
