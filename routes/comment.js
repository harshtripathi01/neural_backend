const express = require('express');
const router = express.Router();
const { addComment } = require('../controller/comment.js');

router.post('/:postId/comment', addComment);

module.exports = router;
