
// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username email');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's own posts (must come before /:id route)
router.get('/mine', auth, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id }).populate('author', 'username');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user posts' });
    }
});

// Create a post
router.post('/', auth, async (req, res) => {
    const post = new Post({
        title: req.body.title,
        body: req.body.body,
        author: req.user.id, // Use authenticated user's ID from JWT
    });
    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username email');
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            if (post.author.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this post' });
            }
            post.title = req.body.title || post.title;
            post.body = req.body.body || post.body;
            const updatedPost = await post.save();
            res.json(updatedPost);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      console.log('Delete attempt by:', req.user.id, 'Post author:', post.author.toString());
      if (post.author.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }

      await Post.findByIdAndDelete(req.params.id); // ✅ FIXED

      res.json({ message: 'Post deleted' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;
