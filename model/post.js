
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
      content: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      image: { type: String },
      comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
    },
    { timestamps: true }
  );
  
  const Post = mongoose.model('Post', postSchema);

module.exports = Post;