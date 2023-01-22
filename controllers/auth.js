const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res
    .status(StatusCodes.CREATED)
    .json({ user: { user_name: user.user_name }, token });
};

const login = async (req, res) => {
  const { user_name, password } = req.body;
  // console.log(user_name, password);
  if (!user_name || !password) {
    throw new BadRequestError("Please provide user name and password");
  }
  const user = await User.findOne({ user_name });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const token = user.createJWT();
  res
    .status(StatusCodes.OK)
    .json({ user: { user_name: user.user_name }, token });
};

module.exports = {
  register,
  login,
};
