const Comment  = require('../model/comment.js');
const Post  = require('../model/post.js');

const jwt = require('jsonwebtoken');
const logger = require('../logger');

const addComment = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const detoken = jwt.decode(token);
    const { content } = req.body;
    const postId = req.params.postId;

    const newComment = new Comment({
      content: content,
      postId: postId,
      userId: detoken.userId || detoken.adminId
    });

    const savedComment = await newComment.save();

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
        statuscode: 404
      });
    }

    post.comments.push(savedComment._id);
    await post.save();

    return res.json({
      message: "Comment added",
      success: true,
      data: savedComment,
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

module.exports = { addComment };
