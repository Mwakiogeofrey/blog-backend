// controllers/postController.js
const Post = require('../models/Post');

// controllers/postController.js
exports.createPost = async (req, res) => {
  try {
    console.log('Create Post Request:', { body: req.body, user: req.user });
    if (!req.body.title || !req.body.body) {
      console.error('Missing title or body');
      return res.status(400).json({ error: 'Title and body are required' });
    }
    if (!req.user || !req.user.id) {
      console.error('User not provided in request');
      return res.status(400).json({ error: 'User not provided' });
    }
    const post = await Post.create({ ...req.body, author: req.user.id });
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Post creation failed', details: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const posts = await Post.find({ author: req.user.id }).populate('author', 'username');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};

// controllers/postController.js
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the logged-in user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Not your post' });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });

  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Post deletion failed', details: err.message });
  }
};

