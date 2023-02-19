const router = require("express").Router();
const {
  createConversation,
  getConversation,
  getConversationTwo,
} = require("../controllers/conversation");

//new conv
router.post("/", createConversation);

//get conv of a user
router.get("/:userId", getConversation);

// get conv includes two userId
router.get("/find/:firstUserId/:secondUserId", getConversationTwo);

module.exports = router;
