const mongoose = require("mongoose");

const SubGredditSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide subgreddit name"],
      maxlength: 50,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please provide subgreddit description"],
      maxlength: 1000,
    },
    createdBy: {
      type: String,
      required: [true, "Please provide user"],
    },
    tags: [{ type: String }],
    banned_keywords: [{ type: String }],
    followers: [{ type: String }],
    posts: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubGreddit", SubGredditSchema);
