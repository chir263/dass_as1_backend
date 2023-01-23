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

module.exports = {
  createPost,
};
