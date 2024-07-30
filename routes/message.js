const express = require('express');
const router = express.Router();
const message = require('../controller/message.js');
 
 
router.get("/allMessages/:chatId", message.allMessages);
router.post("/createMessage", message.sendMessage);

 
module.exports = router;