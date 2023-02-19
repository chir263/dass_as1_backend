const Conversation = require("../models/Conversation");

const createConversation = async (req, res) => {
  const conversation = await Conversation.create({
    members: [req.body.senderId, req.body.receiverId],
  });
  return res.status(200).json(conversation);
};

const getConversation = async (req, res) => {
  const conversation = await Conversation.find({
    members: { $in: [req.params.userId] },
  });
  res.status(200).json(conversation);
};

const getConversationTwo = async (req, res) => {
  let conversation = await Conversation.findOne({
    members: { $all: [req.params.firstUserId, req.params.secondUserId] },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      members: [req.params.firstUserId, req.params.secondUserId],
    });
  }
  res.status(200).json(conversation);
};

module.exports = {
  createConversation,
  getConversation,
  getConversationTwo,
};
