const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    parent_comment: {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
    root: { type: Boolean, default: false },
    commented_by: {
      type: String,
    },
    commented_in: {
      type: String,
      required: [true, "Please provide subgreddit name"],
    },
    commented_post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: [true, "Please provide post id"],
    },
    comment: {
      type: String,
      required: [true, "Please provide comment"],
      maxlength: 5000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
