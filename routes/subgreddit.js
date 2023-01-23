const express = require("express");

const router = express.Router();
const {
  createSubGreddit,
  deleteSubGreddit,
  getSubGreddit,
  getAllSubgreddit,
  opsSubGreddit,
} = require("../controllers/subgreddit");

router.route("/").post(createSubGreddit).get(getAllSubgreddit);
router.route("/:subgreddit_name").delete(deleteSubGreddit).get(getSubGreddit);
router.route("/:subgreddit_name/:ops").get(opsSubGreddit); // request, accept, reject

module.exports = router;
