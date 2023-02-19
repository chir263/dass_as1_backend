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
      maxlength: 10000,
    },
    createdBy: {
      type: String,
      required: [true, "Please provide user"],
    },
    tags: [{ type: String }],
    banned_keywords: [{ type: String }],
    followers: [{ type: String }],
    followers_num: { type: Number, defaut: 0 },
    blocked: [{ type: String }],
    left: [{ type: String }],
    resquests: [{ type: String }],
    posts: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
    new_reports: [{ type: mongoose.Types.ObjectId, ref: "Report" }],
    reports_resolved: [{ type: mongoose.Types.ObjectId, ref: "Report" }],
    moderators: [{ type: String }],
    reports_num: { type: Number, default: 0 },
    date_stats: [
      {
        date: [String],
        new_users: [String],
        left_users: [String],
        new_posts: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
        num_visits: [String],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubGreddit", SubGredditSchema);

//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
