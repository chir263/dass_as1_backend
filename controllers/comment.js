const Comment = require("../models/Comment");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const createComment = async (req, res) => {
  req.body.commented_by = req.user.user_name;
  req.body.children = [];
  const comment = await Comment.create(req.body);
  return res.status(StatusCodes.CREATED).json({ comment });
};

const getComments = async (req, res) => {
  body = { commented_post: req.params.post_id };
  if (req.body.parent_comment) body.parent_comment = req.body.parent_comment;
  if (req.body.root) body.root = req.body.root;
  let nodes = await Comment.find(body).sort("-createdAt");
  return res.status(StatusCodes.CREATED).json({ comments: nodes });
};
module.exports = {
  createComment,
  getComments,
};
