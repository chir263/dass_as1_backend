const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide post"],
      maxlength: 5000,
    },
    posted_by: {
      type: String,
      required: [true, "Please provide user name"],
    },
    posted_by_blocked: { type: Boolean, default: false },
    posted_in: {
      type: String,
      required: [true, "Please provide subgreddit name"],
    },
    banned_keywords: {
      type: [String],
    },
    upvotes: [String],
    downvotes: [String],
    alert: {
      type: String,
      default: "",
    },
    // comments: [
    //   {
    //     user_name: String,
    //     comment: String,
    //     createdAt: { type: Date },
    //   },
    // ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
