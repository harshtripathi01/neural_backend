const Message = require('../model/message');
const User = require('../model/user');
const Chat = require('../model/chat');
const Admin = require('../model/admin');
const jwt = require('jsonwebtoken');
const usersconfig = require('../utils/user');
const { USER, USER_TYPE } = require('../config/constant');

const allMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    // Find the chat to get the userId
    const chat = await Chat.findById(chatId).populate('users');
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Assuming there's only one user in chat.users for simplicity, you may need to adjust this
    const user = chat.users[0];
    if (!user) {
      return res.status(404).json({ message: "User not found in chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'firstName email')
      .populate('chat')
      .populate('template')
      .lean(); // Use .lean() to get plain JavaScript objects instead of Mongoose documents

    const populatedMessages = messages.map(message => {
      if (message.template && message.template.message) {
        const populatedMessage = message.template.message
          .replace("${CoupleNames}", `${user.firstName} & ${user.partnerName}`)
          .replace("${partnerName}", user.partnerName)
          .replace("${NumbersOfGuest}", user.guestCount);

        message.template.message = populatedMessage;
      }
      return message;
    })

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
    if (!decoded || (!decoded.userId && !decoded.adminId)) {
      return res.status(401).json({ message: 'Invalid or missing token' });
    }

    const senderId = decoded.userId || decoded.adminId;
    const senderModel = decoded.userId ? 'User' : 'Admin';

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    const newMessage = {
      sender: senderId,
      senderModel,
      chat: chatId,
    };

    // Check for optional fields and add them if present
    if (content) {
      newMessage.content = content;
    }

    if (file) {
      newMessage.file = file; // Assuming file is a string representing the file path
    }

    if (template) {
      newMessage.template = template; // Assuming template is a valid ObjectId
    }

    let message = await Message.create(newMessage);

    message = await Message.findById(message._id)
      .populate('sender', 'firstName email')
      .populate({
        path: 'chat',
        populate: {
          path: 'users admin',
          select: 'firstName email'
        }
      });

    // Update latestMessage in Chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




module.exports = { allMessages, sendMessage };
