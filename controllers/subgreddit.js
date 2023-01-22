const SubGreddit = require("../models/SubGreddit");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const createSubGreddit = async (req, res) => {
  req.body.createdBy = req.user.user_name;
  req.body.followers = [req.user.user_name];
  const subgreddit = await SubGreddit.create({ ...req.body });
  res.status(StatusCodes.CREATED).json({ subgreddit });
};

module.exports = {
  createSubGreddit,
};
