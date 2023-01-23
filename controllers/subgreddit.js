const SubGreddit = require("../models/SubGreddit");
const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");

const createSubGreddit = async (req, res) => {
  req.body.createdBy = req.user.user_name;
  req.body.followers = [req.user.user_name];
  const subgreddit = await SubGreddit.create({ ...req.body });
  res.status(StatusCodes.CREATED).json({ subgreddit });
};

const deleteSubGreddit = async (req, res) => {
  const {
    user: { user_name },
    params: { subgreddit_name: subgreddit_name },
  } = req;

  const subgreddit = await SubGreddit.findOneAndRemove({
    name: subgreddit_name,
    createdBy: user_name,
  });
  if (!subgreddit) {
    throw new NotFoundError(`No subgreddit with name ${subgreddit_name}`);
  }
  subgreddit.posts.map(async (post_id) => {
    const post = await Post.findByIdAndRemove({
      _id: post_id,
    });
    if (!post) {
      throw new NotFoundError(`No post with id ${post_id}`);
    }
  });
  res.status(StatusCodes.OK).json({ msg: `deleted ${subgreddit.name}` });
};

const getSubGreddit = async (req, res) => {
  const {
    params: { subgreddit_name: subgreddit_name },
  } = req;

  const subgreddit = await SubGreddit.findOne({
    name: subgreddit_name,
  });
  if (!subgreddit) {
    throw new NotFoundError(`No subgreddit with name ${subgreddit_name}`);
  }
  res.status(StatusCodes.OK).json({ subgreddit });
};

const getAllSubgreddit = async (req, res) => {
  const subgreddit = await SubGreddit.find({});
  subgreddits = subgreddit.map((sub) => sub.name);
  res.status(200).json({ subgreddits });
};

const opsSubGreddit = async (req, res) => {
  const {
    user: { user_name },
    params: { subgreddit_name: subgreddit_name, ops: ops },
    query: { user: user },
  } = req;
  if (ops === "request") {
    const subgreddit = await SubGreddit.findOneAndUpdate(
      { name: subgreddit_name },
      {
        $addToSet: {
          resquests: user_name,
        },
      }
    );
    return res
      .status(StatusCodes.OK)
      .json({ msg: `Requested ${subgreddit.name}` });
  } else if (ops === "accept") {
    if (!user) throw new BadRequestError("Specify user");
    const subgreddit = await SubGreddit.findOneAndUpdate(
      { name: subgreddit_name, createdBy: user_name, resquests: user },
      {
        $addToSet: {
          followers: user,
        },
        $pull: {
          resquests: user,
        },
      }
    );
    if (subgreddit)
      return res
        .status(StatusCodes.OK)
        .json({ msg: `Accepted ${user} in ${subgreddit_name}` });
    else return res.status(404).json({ msg: `${user} not found` });
  } else if (ops === "reject") {
    if (!user) throw new BadRequestError("Specify user");
    const subgreddit = await SubGreddit.findOneAndUpdate(
      { name: subgreddit_name, createdBy: user_name, resquests: user },
      {
        $pull: {
          resquests: user,
        },
      }
    );
    if (subgreddit)
      return res.status(StatusCodes.OK).json({ msg: `Rejected ${user}` });
    else return res.status(404).json({ msg: `${user} not found` });
  }
  return res.status(404).json({ msg: "ops not defined" });
};

module.exports = {
  createSubGreddit,
  deleteSubGreddit,
  getSubGreddit,
  getAllSubgreddit,
  opsSubGreddit,
};
