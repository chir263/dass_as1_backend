const Report = require("../models/Report");
const SubGreddit = require("../models/SubGreddit");
const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const createReport = async (req, res) => {
  const report = await Report.create({ ...req.body });
  await SubGreddit.findOneAndUpdate(
    { name: report.reported_in },
    {
      $addToSet: {
        new_reports: report._id,
      },
    }
  );
  res.status(StatusCodes.CREATED).json({ report });
};
const verdictReport = async (req, res) => {
  const {
    params: { report_id: report_id },
    user: { user_name: user_name },
    query: { verdict: verdict },
  } = req;

  if (verdict === "block_user") {
    const rep = await Report.findOneAndUpdate(
      { _id: report_id },
      { verdict: "block_user" }
    );
    const subg = await SubGreddit.findOneAndUpdate(
      {
        name: rep.reported_in,
        moderators: user_name,
      },
      {
        $pull: {
          new_reports: report_id,
        },
        $addToSet: {
          reports_resolved: report_id,
        },
        $pull: {
          followers: rep.reported_user,
        },
        $addToSet: {
          blocked: rep.reported_user,
        },
      }
    );
    res.status(StatusCodes.OK).json({ ...rep, verdict: "block_user" });
  } else if (verdict === "delete_post") {
    const rep = await Report.findOneAndUpdate(
      { _id: report_id },
      { verdict: "delete_post" }
    );
    const subg = await SubGreddit.findOneAndUpdate(
      {
        name: rep.reported_in,
        moderators: user_name,
      },
      {
        $pull: {
          posts: rep.post_associated_with,
        },
        $pull: {
          new_reports: report_id,
        },
        $addToSet: {
          reports_resolved: report_id,
        },
      }
    );
    await Post.findOneAndRemove({ _id: rep.post_associated_with });
    res.status(StatusCodes.OK).json({ ...rep, verdict: "delete_post" });
  } else if (verdict === "ignore") {
    const rep = await Report.findOneAndUpdate(
      { _id: report_id },
      { verdict: "ignore" }
    );
    res.status(StatusCodes.OK).json({ ...rep, verdict: "ignore" });
  }
  res.status(StatusCodes.NOT_FOUND).json({ msg: "undefined verdict" });
};
module.exports = {
  createReport,
  verdictReport,
};
