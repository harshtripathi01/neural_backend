const Chat = require("../model/chat.js");
const User = require("../model/user.js");
const Admin = require("../model/admin.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const createChat = async (req, res) => {
  const { userId, adminId } = req.body;

  if (!userId || !adminId) {
    return res.status(400).send({ message: "User ID and Admin ID are required" });
  }

  try {
    const usersArray = [new mongoose.Types.ObjectId(userId)]; // Use `new` keyword here
    const adminObjectId = new mongoose.Types.ObjectId(adminId); // Use `new` keyword here

    const existingChat = await Chat.findOne({
      users: { $all: usersArray },
      admin: adminObjectId,
      isGroupChat: false,
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = await Chat.create({
      chatName: "Chat between User and Admin",
      users: usersArray,
      admin: adminObjectId,
      isGroupChat: false
    });

    const fullChat = await Chat.findById(newChat._id)
      .populate("users", "-password")
      .populate("admin", "-password");

    res.status(200).json(fullChat);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
const getAdminChats = async (req, res) => {
  // const token = req.headers.authorization;

  // if (!token) {
  //   return res.status(401).send({ message: "Authorization token is required" });
  // }

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
    const admin_id = detoken.adminId;

    // const adminObjectId = new mongoose.Types.ObjectId(adminId);

    const chats = await Chat.find({ admin: admin_id }).populate('users');

    if (chats.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: chats });
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

    const chats = await Chat.find({ users: user_id }).populate('admin');

    if (chats.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: chats });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const searchChat = async(re,res)=>{
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

    const chats = await Chat.find({
        users: user_id,
        'admin.business_name': { $regex: new RegExp(searchTerm, 'i') } // Case-insensitive search
    }).populate('admin');

    if (chats.length === 0) {
        return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: chats });
} catch (error) {
    res.status(400).send({ message: error.message });
}
};

module.exports = { createChat,getAdminChats ,getUserChats,searchChat};
