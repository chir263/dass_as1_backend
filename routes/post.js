const express = require("express");

const router = express.Router();
const {
  createPost,
  getPost,
  updatePost,
  getPostUser,
} = require("../controllers/post");

router.route("/").post(createPost);
router.route("/:post_id").get(getPost).patch(updatePost);
router.route("/user/:user_name").get(getPostUser);

module.exports = router;
