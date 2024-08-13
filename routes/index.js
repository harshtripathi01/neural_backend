const express = require("express");

const admin = require("./admin.js");
const user = require("./user.js");
const rating = require("./rating.js");
const uploadImage = require("./uploadImage.js");
const chat = require("./chat.js");
const message = require("./message.js");
const query = require("./query.js");
const comment = require("./comment.js");
const post = require("./post.js");
const router = express.Router();
router.use("/comment",comment);
router.use("/post",post);
router.use("/query",query);
router.use("/chat",chat);
router.use("/message",message);
router.use("/admin",admin);
router.use("/user",user);
router.use("/upload",uploadImage);
router.use("/rating",rating);

module.exports =router;

