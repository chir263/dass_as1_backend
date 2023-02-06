const express = require("express");

const router = express.Router();
const {
  createReport,
  verdictReport,
  getReport,
} = require("../controllers/report");

router.route("/").post(createReport);
router.route("/ops/:report_id/op/:verdict").post(verdictReport);
router.route("/getreport/:sub_name").post(getReport);

module.exports = router;
