const express = require("express");

const router = express.Router();
const { createComment, getComments } = require("../controllers/comment");

router.route("/").post(createComment);
router.route("/:post_id").post(getComments);

module.exports = router;
