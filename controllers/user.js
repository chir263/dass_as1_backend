const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getUser = async (req, res) => {
  const {
    params: { user_name: user_name },
    user: { userId },
  } = req;

  const user = await User.findOne({
    user_name: user_name,
  });
  if (!user) {
    throw new NotFoundError(`No User with user name ${user_name}`);
  }
  let tempUser = {};
  tempUser.first_name = user.first_name;
  tempUser.last_name = user.last_name;
  tempUser.user_name = user.user_name;
  tempUser.age = user.age;
  if (userId == user._id) {
    tempUser.contact_number = user.contact_number;
    tempUser.email = user.email;
  }
  res.status(StatusCodes.OK).json({ User: tempUser });
};

const updateUser = async (req, res) => {
  const {
    body: { first_name, last_name, email, age, contact_number },
    user: { userId },
    params: { user_name: user_name },
  } = req;

  if (
    first_name === "" ||
    last_name === "" ||
    email === "" ||
    age === 0 ||
    contact_number === ""
  ) {
    throw new BadRequestError("fields cannot be empty");
  }
  temUser = { first_name, last_name, email, age, contact_number };
  const user = await User.findOneAndUpdate(
    { _id: userId, user_name: user_name },
    temUser
  );
  if (!user) {
    throw new NotFoundError(`No user with user name ${user_name}`);
  }
  res.status(StatusCodes.OK).json({ user: temUser });
};

const followUser = async (req, res) => {
  const {
    user: { userId },
    params: { user_name: user_name },
  } = req;
  let follower_user = req.user.user_name;
  const user1 = await User.findOneAndUpdate(
    { _id: userId },
    {
      $addToSet: {
        following: user_name,
      },
    }
  );

  const user2 = await User.findOneAndUpdate(
    { user_name: user_name },
    {
      $addToSet: {
        followers: follower_user,
      },
    }
  );
  if (!user1) {
    throw new NotFoundError(`No user with user name ${user_name}`);
  }
  if (!user2) {
    throw new NotFoundError(`No user with user name ${follower_user}`);
  }
  res
    .status(StatusCodes.OK)
    .json({ follower: follower_user, following: user_name });
};

const unfollowUser = async (req, res) => {
  const {
    user: { userId },
    params: { user_name: user_name },
  } = req;
  let follower_user = req.user.user_name;
  const user1 = await User.findOneAndUpdate(
    { _id: userId },
    {
      $pull: {
        following: user_name,
      },
    }
  );

  const user2 = await User.findOneAndUpdate(
    { user_name: user_name },
    {
      $pull: {
        followers: follower_user,
      },
    }
  );
  if (!user1) {
    throw new NotFoundError(`No user with user name ${user_name}`);
  }
  if (!user2) {
    throw new NotFoundError(`No user with user name ${follower_user}`);
  }
  res
    .status(StatusCodes.OK)
    .json({ unfollowed: { follower: follower_user, following: user_name } });
};

const removeUser = async (req, res) => {
  const {
    user: { userId },
    params: { user_name: user_name },
  } = req;
  let follower_user = req.user.user_name;
  const user1 = await User.findOneAndUpdate(
    { _id: userId },
    {
      $pull: {
        followers: user_name,
      },
    }
  );

  const user2 = await User.findOneAndUpdate(
    { user_name: user_name },
    {
      $pull: {
        following: follower_user,
      },
    }
  );
  if (!user1) {
    throw new NotFoundError(`No user with user name ${user_name}`);
  }
  if (!user2) {
    throw new NotFoundError(`No user with user name ${follower_user}`);
  }
  res
    .status(StatusCodes.OK)
    .json({ removed: { following: follower_user, follower: user_name } });
};

module.exports = {
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  removeUser,
};
