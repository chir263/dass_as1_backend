const express = require("express");

const router = express.Router();
const { createSubGreddit } = require("../controllers/subgreddit");

router.route("/").post(createSubGreddit);

module.exports = router;
