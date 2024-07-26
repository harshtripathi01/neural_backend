const { Op } = require('sequelize');
const { Chat, User, Message } = require('../models');
const jwt = require('jsonwebtoken');

const createChat = async (req, res) => {
  const { userId, otherUserId } = req.body;

  if (!userId || !otherUserId) {
    return res.status(400).send({ message: "User ID and Other User ID are required" });
  }

  try {
    const existingChat = await Chat.findOne({
      where: {
        isGroupChat: false,
      },
      include: [
        { model: User, as: 'users', where: { id: { [Op.in]: [userId, otherUserId] } } }
      ]
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = await Chat.create({
      chatName: "Chat between Users",
      isGroupChat: false,
    });

    await newChat.addUsers([userId, otherUserId]);

    const fullChat = await Chat.findByPk(newChat.id, {
      include: { model: User, as: 'users', attributes: { exclude: ['password'] } }
    });

    res.status(200).json(fullChat);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const getUserChats = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        message: "Authorization token is required",
        success: false,
        statuscode: 401,
      });
    }

    const detoken = jwt.decode(token);
    const user_id = detoken.userId;

    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          as: 'users',
          where: { id: user_id },
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (chats.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: chats });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const searchChat = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        message: "Authorization token is required",
        success: false,
        statuscode: 401,
      });
    }

    const detoken = jwt.decode(token);
    const user_id = detoken.userId;

    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        message: "Search term is required",
        success: false,
        statuscode: 400,
      });
    }

    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          as: 'users',
          where: { id: user_id },
          attributes: { exclude: ['password'] }
        },
        {
          model: User,
          as: 'users',
          where: { firstName: { [Op.iLike]: `%${searchTerm}%` } },
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (chats.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: chats });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

module.exports = { createChat, getUserChats, searchChat };
