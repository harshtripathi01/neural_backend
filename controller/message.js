const { Chat, Message, User } = require('../models');
const jwt = require('jsonwebtoken');

const allMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await Chat.findByPk(chatId, { include: 'users' });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = await Message.findAll({
      where: { chatId },
      include: [
        { model: User, as: 'sender', attributes: ['firstName', 'email'] },
        { model: Chat }
      ]
    });

    const populatedMessages = messages.map(message => {
      const sender = chat.users.find(user => user.id === message.senderId);
      if (message.template && message.template.message && sender) {
        const populatedMessage = message.template.message
          .replace("${CoupleNames}", `${sender.firstName} & ${sender.partnerName}`)
          .replace("${partnerName}", sender.partnerName)
          .replace("${NumbersOfGuest}", sender.guestCount);

        message.template.message = populatedMessage;
      }
      return message;
    });

    res.json(populatedMessages);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  const { content, chatId, file, template } = req.body;

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid or missing token' });
    }

    const senderId = decoded.userId;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    const newMessage = {
      senderId,
      chatId,
      content,
      file,
      templateId: template
    };

    const message = await Message.create(newMessage);

    await Chat.update({ latestMessageId: message.id }, { where: { id: chatId } });

    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['firstName', 'email'] },
        { model: Chat, include: { model: User, as: 'users', attributes: ['firstName', 'email'] } }
      ]
    });

    res.json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { allMessages, sendMessage };
