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
  tempUser.followers = user.followers;
  tempUser.following = user.following;
  if (userId == user._id) {
    tempUser.contact_number = user.contact_number;
    tempUser.email = user.email;
    tempUser.saved_posts = user.saved_posts;
  }
  res.status(StatusCodes.OK).json({ User: tempUser });
};

const getAllUser = async (req, res) => {
  const {
    user: { userId },
  } = req;
  const user = await User.findOne({
    _id: userId,
  });
  const followers = user.followers;
  const following = user.following;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  // console.log(followers);
  let result = User.find({});
  result = result.skip(skip).limit(limit);
  result = result.select(["first_name", "last_name", "user_name"]);
  const users = await result;
  let allUsers = users.map((user) => {
    let user_ = {
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    if (following.includes(user.user_name)) user_.following = true;
    if (followers.includes(user.user_name)) user_.follower = true;
    // console.log(user_);
    return user_;
  });
  return res.status(StatusCodes.OK).json({ allUsers });
};

const updateUser = async (req, res) => {
  // console.log("updateing user");
  const {
    body: { first_name, last_name, age, contact_number },
    user: { userId },
    params: { user_name: user_name },
  } = req;

  if (
    first_name === "" ||
    last_name === "" ||
    age === 0 ||
    contact_number === ""
  ) {
    throw new BadRequestError("fields cannot be empty");
  }
  temUser = { first_name, last_name, age, contact_number };
  const user = await User.findOneAndUpdate(
    { _id: userId, user_name: user_name },
    temUser,
    {
      new: true,
      runValidators: true,
    }
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
  const user1 = await User.findOne({ _id: userId });

  const user2 = await User.findOne({ user_name: user_name });
  if (!user1) {
    throw new NotFoundError(`No user with user name ${user_name}`);
  }
  if (!user2) {
    throw new NotFoundError(`No user with user name ${follower_user}`);
  }
  await User.findOneAndUpdate(
    { _id: userId },
    {
      $addToSet: {
        following: user_name,
      },
    },
    {
      new: true,
    }
  );

  await User.findOneAndUpdate(
    { user_name: user_name },
    {
      $addToSet: {
        followers: follower_user,
      },
    },
    {
      new: true,
    }
  );
  return res
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
    },
    {
      new: true,
    }
  );

  const user2 = await User.findOneAndUpdate(
    { user_name: user_name },
    {
      $pull: {
        followers: follower_user,
      },
    },
    {
      new: true,
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
    },
    {
      new: true,
    }
  );

  const user2 = await User.findOneAndUpdate(
    { user_name: user_name },
    {
      $pull: {
        following: follower_user,
      },
    },
    {
      new: true,
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

const opPost = async (req, res) => {
  const { post_id } = req.params;
  const { op } = req.query;
  if (op === "save") {
    await User.findOneAndUpdate(
      { user_name: req.user.user_name },
      {
        $addToSet: {
          saved_posts: post_id,
        },
      },
      {
        new: true,
      }
    );
    res.status(StatusCodes.OK).json({ msg: "post saved" });
  } else if (op === "remove") {
    const user = await User.findOneAndUpdate(
      { user_name: req.user.user_name },
      {
        $pull: {
          saved_posts: post_id,
        },
      },
      { new: true }
    );
    // console.log(req.user.user_name, post_id, user);
    res.status(StatusCodes.OK).json({ msg: "post removed" });
  }
};

const getUserList = async (req, res) => {
  const { userlist } = req.body;
  let result = User.find({ user_name: { $in: userlist } });
  result = result.select([
    "first_name",
    "last_name",
    "user_name",
    "followers",
    "following",
    "age",
  ]);
  let users = await result;
  return res.status(StatusCodes.OK).json({ users });
};

module.exports = {
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  removeUser,
  opPost,
  getAllUser,
  getUserList,
};
