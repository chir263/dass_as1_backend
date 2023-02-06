const express = require("express");

const router = express.Router();
const {
  createSubGreddit,
  deleteSubGreddit,
  getSubGreddit,
  getAllSubgreddit,
  getUserSubGreddit,
  opsSubGreddit,
  searchSubgreddit,
} = require("../controllers/subgreddit");

router.route("/").post(createSubGreddit).get(getAllSubgreddit);
router.route("/search").post(searchSubgreddit);
router.route("/:user_name").get(getUserSubGreddit);
router.route("/sub/:subgreddit_name").post(deleteSubGreddit).get(getSubGreddit);
router.route("/delete_sub/:subgreddit_name").post(deleteSubGreddit);
router.route("/:subgreddit_name/:ops").get(opsSubGreddit); // request, accept, reject

module.exports = router;
