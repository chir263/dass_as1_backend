const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide subgreddit name"],
      maxlength: 50,
    },
    posted_by: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    posted_in: {
      type: mongoose.Types.ObjectId,
      ref: "SubGreddit",
    },
    upvotes: {
      type: Number,
      trim: true,
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
