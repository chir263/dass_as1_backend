const express = require("express");

const router = express.Router();
const {
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  removeUser,
} = require("../controllers/user");

router.route("/:user_name").get(getUser).patch(updateUser);
router.route("/follow/:user_name").patch(followUser);
router.route("/unfollow/:user_name").patch(unfollowUser);
router.route("/remove_user/:user_name").patch(removeUser);

module.exports = router;
