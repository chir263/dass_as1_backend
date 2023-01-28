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
      },
      {
        new: true,
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
  req.body.moderators = [req.user.user_name];
  req.body.followers_num = 1;
  req.body.date_stats = [
    {
      date: date,
      new_users: [req.user.user_name],
      new_posts: [],
      num_visits: [req.user.visit_time],
    },
  ];
  if (req.body.tags?.length > 0) {
    req.body.tags = req.body.tags.map((tag) => tag.toLowerCase());
  }
  // console.log(req.body);
  const subgreddit = await SubGreddit.create({ ...req.body });
  // console.log("success");
  const sub = (({
    tags,
    banned_keywords,
    followers,
    name,
    description,
    createdBy,
    createdAt,
    posts,
  }) => ({
    tags,
    banned_keywords,
    followers,
    name,
    description,
    createdBy,
    createdAt,
    posts,
  }))(subgreddit);
  res.status(StatusCodes.CREATED).json({ sub });
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
  });
  res.status(StatusCodes.OK).json({ msg: `deleted ${subgreddit.name}` });
};

const getSubGreddit = async (req, res) => {
  const {
    params: { subgreddit_name: subgreddit_name },
  } = req;

  let subgreddit = await SubGreddit.findOne({
    name: subgreddit_name,
  });
  if (!subgreddit) {
    throw new NotFoundError(`No subgreddit with name ${subgreddit_name}`);
  }
  const [date, time] = new Date().toISOString().split("T");
  subgreddit.date_stats = "";
  // adding visit
  addIntoDateStats(
    (subgreddit_name_ = subgreddit_name),
    (new_user = null),
    (new_post = null),
    (new_visit = `${req.user.user_name} $ ${time}`)
  );
  return res.status(StatusCodes.OK).json({ subgreddit });
};

const getUserSubGreddit = async (req, res) => {
  const {
    params: { user_name: user_name },
  } = req;
  let subgreddit = await SubGreddit.find({
    createdBy: user_name,
  })
    .select(
      "tags banned_keywords followers name description createdBy createdAt posts"
    )
    .sort("-createdAt");

  return res.status(StatusCodes.OK).json({ subgreddit });
};

const getAllSubgreddit = async (req, res) => {
  const subgreddit = await SubGreddit.find({})
    .select(
      "tags banned_keywords followers followers_num name description createdBy createdAt posts"
    )
    .sort("-createdAt");
  // subgreddits = subgreddit.map((sub) => sub.name);
  res.status(200).json({ subgreddit });
};

const opsSubGreddit = async (req, res) => {
  const {
    user: { user_name },
    params: { subgreddit_name: subgreddit_name, ops: ops },
    query: { user: user },
  } = req;
  if (ops === "request") {
    const sub = await SubGreddit.findOne({ name: subgreddit_name, left: user });
    if (!sub) {
      const subgreddit = await SubGreddit.findOneAndUpdate(
        { name: subgreddit_name },
        {
          $addToSet: {
            resquests: user_name,
          },
        },
        {
          new: true,
        }
      );
      return res
        .status(StatusCodes.OK)
        .json({ msg: `Requested ${subgreddit.name}` });
    } else return res.status(404).json({ msg: `Lefted ${user}` });
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
        $inc: {
          followers_num: 1,
        },
      },
      {
        new: true,
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
      },
      {
        new: true,
      }
    );
    if (subgreddit)
      return res.status(StatusCodes.OK).json({ msg: `Rejected ${user}` });
    else return res.status(404).json({ msg: `${user} not found` });
  } else if (ops === "left") {
    if (!user) throw new BadRequestError("Specify user");
    const subgreddit = await SubGreddit.findOneAndUpdate(
      { name: subgreddit_name },
      {
        $addToSet: {
          left: user,
        },
        $pull: {
          followers: user,
        },
        $inc: {
          followers_num: -1,
        },
      },
      {
        new: true,
      }
    );
    if (subgreddit) {
      return res
        .status(StatusCodes.OK)
        .json({ msg: `Accepted ${user} in ${subgreddit_name}` });
    } else return res.status(404).json({ msg: `${user} not found` });
  }
  return res.status(404).json({ msg: "ops not defined" });
};

const searchSubgreddit = async (req, res) => {
  let {
    body: { tags, sort, search },
  } = req;
  tags = tags?.split(",").map((tag) => tag.trim());
  sort = sort
    ?.split(",")
    .map((tag) => tag.trim())
    .join(" ");
  search = search?.trim();
  sort = sort || "-createdAt";
  // console.log(sort);
  sort = sort.replace("-followers", "-followers_num");
  let subgreddit = {};
  if (!tags || (tags && !tags[0])) {
    subgreddit = await SubGreddit.find({})
      .select(
        "tags banned_keywords followers followers_num name description createdBy createdAt posts"
      )
      .sort(sort);
  } else {
    subgreddit = await SubGreddit.find({ tags: { $in: tags } })
      .select(
        "tags banned_keywords followers followers_num name description createdBy createdAt posts"
      )
      .sort(sort);
  }
  console.log(sort);
  // console.log("search", search, "dsf");
  if (search) {
    console.log(search);
    subgreddit = subgreddit.filter((sub) =>
      sub.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  return res.status(StatusCodes.OK).json({ subgreddit });
  // return res.send("sadfaf");
};

module.exports = {
  createSubGreddit,
  deleteSubGreddit,
  getSubGreddit,
  getAllSubgreddit,
  opsSubGreddit,
  createDateStatIfNot,
  getUserSubGreddit,
  searchSubgreddit,
};
