const express = require("express");
const chat = require("../controller/chat.js")
 
const router = express.Router();
 
// router.post("/", chat.accessChat);
// router.get("/fetchChats", chat.fetchChats);
router.post("/group", chat.createChat);
// router.put("/rename", chat.renameGroup);
// router.put("/removeFromGroup", chat.removeFromGroup);
// router.put("/addToGroup", chat.addToGroup);
// router.get("/getGroupParticipants/:chatId", chat.getGroupParticipants);
// router.get("/getAdminChats",chat.getAdminChats);
router.get("/getUserChats",chat.getUserChats);
router.get("/searchChat",chat.searchChat);
module.exports = router