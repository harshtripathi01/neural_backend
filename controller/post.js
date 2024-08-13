const { Post } = require('../model/post');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const createPost = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const detoken = jwt.decode(token);
    const { content, image } = req.body;

    const newPost = new Post({
      content: content,
      image: image
    });

    if (detoken.adminId) {
      newPost.adminId = detoken.adminId;
    } else if (detoken.userId) {
      newPost.userId = detoken.userId;
    } else {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        statuscode: 400
      });
    }

    const savedPost = await newPost.save();

    return res.json({
      message: "Post created",
      success: true,
      data: savedPost,
      statuscode: 200
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: error,
      success: false,
      statuscode: 500
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username')
      .populate('adminId', 'username')
      .populate('comments');

    const postsWithCommentCounts = posts.map(post => ({
      ...post._doc,
      commentCount: post.comments.length
    }));

    return res.json({
      message: "Posts retrieved",
      success: true,
      data: postsWithCommentCounts,
      statuscode: 200
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: error,
      success: false,
      statuscode: 500
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate('userId', 'username')
      .populate('adminId', 'username')
      .populate('comments');

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
        statuscode: 404
      });
    }

    return res.json({
      message: "Post retrieved",
      success: true,
      data: {
        ...post._doc,
        commentCount: post.comments.length
      },
      statuscode: 200
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: error,
      success: false,
      statuscode: 500
    });
  }
};

module.exports = { createPost, getPosts, getPostById };
