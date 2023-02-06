const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    concern: {
      type: String,
      required: [true, "Please provide concern"],
    },
    selected_text: {
      type: String,
      required: [true, "Please provide selected text"],
    },
    reported_by: {
      type: String,
      required: [true, "Please provide user"],
    },
    reported_user: {
      type: String,
      required: [true, "Please provide reported user"],
    },
    post_associated_with: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: [true, "Please provide post"],
    },
    reported_in: {
      type: String,
      required: [true, "Please provide subgreddit name"],
    },
    verdict: {
      type: String,
      enum: ["block_user", "delete_post", "ignore", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
