const Post = require("../models/Post");
const SubGreddit = require("../models/SubGreddit");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const createPost = async (req, res) => {
  const post = await Post.create({ ...req.body });
  await SubGreddit.findOneAndUpdate(
    { name: post.posted_in },
    {
      $addToSet: {
        posts: post._id,
      },
    }
  );
  res.status(StatusCodes.CREATED).json({ post });
};
const getPost = async (req, res) => {
  // console.log("i am in post");
  const { post_id: post_id } = req.params;
  const post = await Post.findOne({ _id: post_id });
  // console.log(post);

  const subg = await SubGreddit.findOne({
    name: post.posted_in,
  });
  if (subg.blocked.includes(post.posted_by)) post.posted_by = "blocked_user";

  let changed = false;
  let str = post.name;

  let banned_keywords = subg.banned_keywords;

  String.prototype.replaceAll = function (strReplace, strWith) {
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    var reg = new RegExp(esc, "ig");
    return this.replace(reg, strWith);
  };
  for (const word of banned_keywords) {
    if (str.search(new RegExp("Ral", "i")) == -1) {
      str = str.replaceAll(word, "*");
      changed = true;
    }
  }
  post.name = str;

  if (changed) {
    post.alert =
      "this post contained some banned keywords which are replaced by *";
  }

  res.status(200).json({ post });
};

const getPostUser = async (req, res) => {
  const { user_name: user_name } = req.params;
  const post = await Post.find({ posted_by: user_name });
  res.status(200).json({ post });
};

const updatePost = async (req, res) => {
  const {
    params: { post_id: post_id },
    user: { user_name: user_name },
    query: { op: op },
  } = req;
  if (op == "up") {
    const post = await Post.findOneAndUpdate(
      { _id: post_id },
      {
        $pull: { downvotes: user_name },
        $addToSet: { upvotes: user_name },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ up: post.upvotes.length, down: post.downvotes.length });
  } else if (op == "down") {
    const post = await Post.findOneAndUpdate(
      { _id: post_id },
      {
        $pull: { upvotes: user_name },
        $addToSet: { downvotes: user_name },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ up: post.upvotes.length, down: post.downvotes.length });
  } else if (op == "rup") {
    const post = await Post.findOneAndUpdate(
      { _id: post_id },
      { $pull: { upvotes: user_name } },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ up: post.upvotes.length, down: post.downvotes.length });
  } else if (op == "rdown") {
    const post = await Post.findOneAndUpdate(
      { _id: post_id },
      { $pull: { downvotes: user_name } },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ up: post.upvotes.length, down: post.downvotes.length });
  }
  return res.status(400).json({ msg: "define op" });
};

module.exports = {
  createPost,
  getPost,
  updatePost,
  getPostUser,
};
