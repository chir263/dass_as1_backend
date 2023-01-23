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
    posted_in: {
      type: String,
      required: [true, "Please provide subgreddit name"],
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
