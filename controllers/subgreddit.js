const SubGreddit = require("../models/SubGreddit");
const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");

// DATE & STATS SEGMENT //
const createDateStatIfNot = async (subgreddit_name) => {
  let date = [
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  ];
  const subgreddit = await SubGreddit.findOne({ name: subgreddit_name });
  if (!subgreddit) return `No subgreddit with name ${subgreddit_name}`;

  const checkDate = (obj) => {
    return (
      new Date(obj.date).toDateString() ===
      new Date(date[0], date[1], date[2]).toDateString()
    );
  };
  if (!subgreddit.date_stats.some(checkDate)) {
    const [date_, time] = new Date().toISOString().split("T");
    await SubGreddit.findOneAndUpdate(
      { name: subgreddit_name },
      {
        $addToSet: {
          date_stats: {
            date: date_,
            new_users: [],
            new_posts: [],
            num_visits: [],
          },
        },
      }
    );
  }
};

const addIntoDateStats = async (
  subgreddit_name_,
  new_user = null,
  new_post = null,
  new_visit = null
) => {
  createDateStatIfNot(subgreddit_name_);
  const [date, time] = new Date().toISOString().split("T");
  // console.log({ subgreddit_name_, new_user, new_post, new_visit });
  if (new_user) {
    await SubGreddit.updateOne(
      { name: subgreddit_name_ },
      { $addToSet: { "date_stats.$[element].new_users": new_user } },
      { arrayFilters: [{ "element.date": date }] }
    );
  }
  if (new_post) {
    await SubGreddit.updateOne(
      { name: subgreddit_name_ },
      { $addToSet: { "date_stats.$[element].new_posts": new_post } },
      { arrayFilters: [{ "element.date": date }] }
    );
  }
  if (new_visit) {
    await SubGreddit.updateOne(
      { name: subgreddit_name_ },
      { $push: { "date_stats.$[element].num_visits": new_visit } },
      { arrayFilters: [{ "element.date": date }] }
    );
  }
};

// CLOSE DATE & STATS SEGMENT //

const createSubGreddit = async (req, res) => {
  const [date, time] = new Date().toISOString().split("T");
  req.user.visit_time = `${req.user.user_name} $ ${time}`;
  req.body.createdBy = req.user.user_name;
  req.body.followers = [req.user.user_name];
  req.body.date_stats = [
    {
      date: date,
      new_users: [req.user.user_name],
      new_posts: [],
      num_visits: [req.user.visit_time],
    },
  ];
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
  const [date, time] = new Date().toISOString().split("T");

  // adding visit
  addIntoDateStats(
    (subgreddit_name_ = subgreddit_name),
    (new_user = null),
    (new_post = null),
    (new_visit = `${req.user.user_name} $ ${time}`)
  );
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
    if (subgreddit) {
      // adding user
      addIntoDateStats(
        (subgreddit_name_ = subgreddit_name),
        (new_user = user),
        (new_post = null),
        (new_visit = null)
      );
      return res
        .status(StatusCodes.OK)
        .json({ msg: `Accepted ${user} in ${subgreddit_name}` });
    } else return res.status(404).json({ msg: `${user} not found` });
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
  createDateStatIfNot,
};
