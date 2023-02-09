const Report = require("../models/Report");
const SubGreddit = require("../models/SubGreddit");
const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

function msToHMS(ms) {
  let seconds = ms / 1000;
  const hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
  const days = parseInt(hours / 24); // 3,600 seconds in 1 hour
  seconds = seconds % 3600;
  const minutes = parseInt(seconds / 60);
  seconds = seconds % 60;
  let str = "";
  if (days) str += days + "d ";
  if (hours) str += hours - days * 24 + "h ";
  else if (minutes) str += minutes + "m ";
  else if (seconds) str += seconds + "s ";
  str += "ago";
  return str;
}

const createReport = async (req, res) => {
  req.body.reported_by = req.user.user_name;
  const report = await Report.create({ ...req.body });
  await SubGreddit.findOneAndUpdate(
    { name: report.reported_in },
    {
      $addToSet: {
        new_reports: report._id,
      },
      $inc: {
        reports_num: 1,
      },
    },
    {
      new: true,
    }
  );
  res.status(StatusCodes.CREATED).json({ report });
};
const verdictReport = async (req, res) => {
  const {
    user: { user_name: user_name },
    params: { verdict: verdict, report_id: report_id },
  } = req;
  if (verdict === "block_user") {
    const rep = await Report.findOneAndUpdate(
      { _id: report_id },
      { verdict: "block_user" }
    );
    const [date, time] = new Date().toISOString().split("T");
    const subg = await SubGreddit.findOneAndUpdate(
      {
        name: rep.reported_in,
        moderators: user_name,
      },
      {
        $pull: {
          new_reports: report_id,
          followers: rep.reported_user,
        },
        $inc: {
          followers_num: -1,
        },
        $addToSet: {
          blocked: rep.reported_user,
          "date_stats.$[element].left_users": rep.reported_user,
        },
      },
      {
        arrayFilters: [{ "element.date": date }],
        new: true,
      }
    );
    const post = await Post.findOneAndUpdate(
      { _id: rep.post_associated_with },
      { posted_by_blocked: true }
    );
    res.status(StatusCodes.OK).json({ ...rep, verdict: "block_user" });
  } else if (verdict === "delete_post") {
    // console.log(report_id);
    const rep = await Report.findOneAndUpdate(
      { _id: report_id },
      { verdict: "delete_post" },
      {
        new: true,
      }
    );

    // console.log("asfasfsa", rep);
    const subg = await SubGreddit.findOneAndUpdate(
      {
        name: rep.reported_in,
        moderators: user_name,
      },
      {
        $pull: {
          posts: rep.post_associated_with,
          new_reports: report_id,
        },
        $addToSet: {
          reports_resolved: report_id,
        },
      },
      {
        new: true,
      }
    );
    if (subg) {
      await Post.findOneAndRemove({ _id: rep.post_associated_with });
      return res
        .status(StatusCodes.OK)
        .json({ ...rep, verdict: "delete_post" });
    }
  } else if (verdict === "ignore") {
    const rep = await Report.findOneAndUpdate(
      { _id: report_id },
      { verdict: "ignore" },
      {
        new: true,
      }
    );
    res.status(StatusCodes.OK).json({ ...rep, verdict: "ignore" });
  }
  res.status(StatusCodes.NOT_FOUND).json({ msg: "undefined verdict" });
};

const getReport = async (req, res) => {
  const { reportlist } = req.body;
  let result = Report.find({ _id: { $in: reportlist } });
  let reports = await result;

  // cleanup
  const ten_day = 1000 * 60 * 60 * 24 * 10;
  const one_minute = 1000 * 60;

  let rep_to_be_deleted = [];
  for (const rep of reports) {
    // console.log(
    //   rep._id,
    //   new Date() - rep.createdAt,
    //   msToHMS(new Date() - rep.createdAt)
    // );
    if (new Date() - rep.createdAt > ten_day) {
      rep_to_be_deleted.push(rep._id);
    }
  }
  reports.filter((rep) => {
    return !rep_to_be_deleted.includes(rep._id);
  });
  if (rep_to_be_deleted?.length > 0) {
    await SubGreddit.findOneAndUpdate(
      { name: req.params.sub_name },
      {
        $pull: {
          new_reports: { $in: rep_to_be_deleted },
        },
      }
    );
    await Report.deleteMany({ _id: { $in: rep_to_be_deleted } });
  }
  return res.status(StatusCodes.OK).json({ reports });
};
module.exports = {
  createReport,
  verdictReport,
  getReport,
};
