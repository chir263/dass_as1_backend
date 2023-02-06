const Post = require("../models/Post");
const SubGreddit = require("../models/SubGreddit");
const User = require("../models/User");
const { addIntoDateStats } = require("./subgreddit");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const filter = (post, banned_keywords) => {
  let changed = false;
  let till = [];
  let strs = post.name.split(" ");
  for (let str of strs) {
    let c = 0;
    for (let word of banned_keywords) {
      if (word.trim().toLowerCase() === str.trim().toLowerCase()) {
        changed = true;
        till.push("*");
        c = 1;
        break;
        // console.log("aabskdbs", str);
      }
    }
    if (!c) till.push(str);
  }
  // console.log(till);
  if (changed) {
    // console.log(post.name, "changing");
    post.alert =
      "this post contained some banned keywords which are replaced by *";
    post.name = till.join(" ");
  }
  return post;
};

const createPost = async (req, res) => {
  let post = await Post.create({ ...req.body });
  const subg = await SubGreddit.findOneAndUpdate(
    { name: post.posted_in },
    {
      $addToSet: {
        posts: post._id,
      },
    }
  );
  const banned_keywords = subg.banned_keywords;
  post = await Post.findOneAndUpdate(
    { _id: post._id },
    { banned_keywords },
    { new: true }
  );
  addIntoDateStats(post?.posted_in, null, post?._id, null);
  res.status(StatusCodes.CREATED).json({ post: filter(post, banned_keywords) });
};
const getPost = async (req, res) => {
  // console.log("i am in post");
  const { post_id: post_id } = req.params;
  const post = await Post.findOne({ _id: post_id });
  // console.log(post);

  const subg = await SubGreddit.findOne({
    name: post.posted_in,
  });
  if (subg.blocked.includes(post.posted_by)) {
    post.posted_by = "blocked_user";
    post.posted_by_blocked = true;
  }
  post.comments = "";
  res.status(200).json({ post: filter(post, subg.banned_keywords) });
};

const getPostUser = async (req, res) => {
  const { user_name: user_name } = req.params;
  let post = await Post.find({ posted_by: user_name });
  // console.log(post);

  for (p of post) {
    p = filter(p, p.banned_keywords);
  }
  // console.log(post);
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

const getPostSub = async (req, res) => {
  const { subgreddit_name: subgreddit_name } = req.params;
  const posts = await Post.find({ posted_in: subgreddit_name });
  const subg = await SubGreddit.findOne({ name: subgreddit_name });
  for (post of posts) {
    post = filter(post, post.banned_keywords);
  }
  if (subg.blocked.includes(post.posted_by)) {
    post.posted_by = "blocked_user";
    post.posted_by_blocked = true;
  }
  res.status(200).json({ post: posts });
};

const getSavedPost = async (req, res) => {
  const user = await User.findOne({ user_name: req.user.user_name });
  let pp = user.saved_posts;
  const posts = await Post.find({ _id: { $in: pp } });
  for (post of posts) {
    post = filter(post, post.banned_keywords);
  }
  if (post.posted_by_blocked == true) {
    post.posted_by = "blocked_user";
  }
  res.status(200).json({ post: posts });
};

const addComment = async (req, res) => {
  // console.log("i am here");
  await Post.updateOne(
    { _id: req.params.post_id },
    {
      $addToSet: {
        comments: {
          user_name: req.user.user_name,
          comment: req.body.comment,
          createdAt: new Date(),
        },
      },
    }
  );
  return res.status(200).json({
    comment: {
      user_name: req.user.user_name,
      comment: req.body.comment,
      createdAt: new Date(),
    },
  });
};

module.exports = {
  createPost,
  getPost,
  updatePost,
  getPostUser,
  getPostSub,
  getSavedPost,
  addComment,
};
