const express = require("express");

const router = express.Router();
const { createPost, getPost, updatePost } = require("../controllers/post");

router.route("/").post(createPost);
router.route("/:post_id").get(getPost).patch(updatePost);

module.exports = router;
