const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    concern: {
      type: String,
    },
    reported_by: {
      type: String,
    },
    reported_user: {
      type: String,
    },
    posted_associated_with: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
