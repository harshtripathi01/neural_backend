const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById } = require('../controller/post.js');

router.post('/create', createPost);
router.get('/getPost', getPosts);
router.get('getPost/:id', getPostById);

module.exports = router;
