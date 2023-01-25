const express = require("express");

const router = express.Router();
const { createReport, verdictReport } = require("../controllers/report");

router.route("/").post(createReport);
router.route("/:report_id/verdict").post(verdictReport);
router.route("/:report_id").get(verdictReport);
router.route("/:subgreddit").get(verdictReport);

module.exports = router;
