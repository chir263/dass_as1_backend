const express = require("express");

const router = express.Router();
const {
  createPost,
  getPost,
  updatePost,
  getPostUser,
  getPostSub,
  getSavedPost,
} = require("../controllers/post");

router.route("/").post(createPost);
router.route("/:post_id").get(getPost).patch(updatePost);
router.route("/user/:user_name").get(getPostUser);
router.route("/subgreddit/:subgreddit_name").get(getPostSub);
router.route("/savedpost/:abc").get(getSavedPost);

module.exports = router;
