const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    concern: {
      type: String,
    },
    reported_by: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    reported_user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    posted_associated_with: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
