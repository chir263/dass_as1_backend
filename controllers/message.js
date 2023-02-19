const Message = require("../models/Message");

const createMessage = async (req, res) => {
  const message = await Message.create(req.body);
  res.status(200).json(message);
};

const getMessage = async (req, res) => {
  const messages = await Message.find({
    conversationId: req.params.conversationId,
  });
  res.status(200).json(messages);
};

module.exports = {
  createMessage,
  getMessage,
};
