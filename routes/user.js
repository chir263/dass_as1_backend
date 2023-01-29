const express = require("express");

const router = express.Router();
const {
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  removeUser,
  opPost,
  getAllUser,
  getUserList,
} = require("../controllers/user");

router.route("/").get(getAllUser);
router.route("/").post(getUserList);
router.route("/:user_name").get(getUser).patch(updateUser);
router.route("/follow/:user_name").patch(followUser);
router.route("/unfollow/:user_name").patch(unfollowUser);
router.route("/remove_user/:user_name").patch(removeUser);
router.route("/post/:post_id").post(opPost);

module.exports = router;
