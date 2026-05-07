const Post = require('../models/Post');
const User = require('../models/User');
const Repo = require('../models/Repo');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Create post
// @route   POST /api/posts
const createPost = async (req, res) => {
  console.log('--- Create Post Debug ---');
  console.log('Body:', req.body);
  console.log('File:', req.file ? req.file.originalname : 'No file');

  try {
    let imageUrl = '';

    // Handle File Upload
    if (req.file) {
      try {
        const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

        if (isCloudinaryConfigured) {
          console.log('Uploading file to Cloudinary...');
          // Use stream for buffer if needed, but here we use simple upload
          const b64 = Buffer.from(req.file.buffer).toString('base64');
          let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
          const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'codesphere_posts'
          });
          imageUrl = uploadResponse.secure_url;
        } else {
          // Fallback to base64 if no cloudinary
          const b64 = Buffer.from(req.file.buffer).toString('base64');
          imageUrl = "data:" + req.file.mimetype + ";base64," + b64;
        }
      } catch (cloudErr) {
        console.error('Cloudinary Upload Error:', cloudErr);
        // Final fallback to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        imageUrl = "data:" + req.file.mimetype + ";base64," + b64;
      }
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    // Parse techStack and event if they are strings (from FormData)
    let techStack = req.body.techStack || [];
    if (typeof techStack === 'string') {
      try { techStack = JSON.parse(techStack); } catch (e) { techStack = [techStack]; }
    }

    let event = req.body.event;
    if (typeof event === 'string') {
      try { event = JSON.parse(event); } catch (e) { event = null; }
    }

    const post = await Post.create({
      user: req.user._id,
      content: req.body.content,
      image: imageUrl,
      isProject: req.body.isProject === 'true' || req.body.isProject === true,
      techStack: techStack,
      githubLink: req.body.githubLink || '',
      demoLink: req.body.demoLink || '',
      repository: req.body.repository,
      video: req.body.video,
      event: event
    });

    const populatedPost = await Post.findById(post._id).populate([
      { path: 'user', select: 'username profilePic' },
      { path: 'repository' }
    ]);

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feed posts (following)
// @route   GET /api/posts
const getFeed = async (req, res) => {
  console.log('--- Get Feed Debug ---');
  console.log('User ID:', req.user?._id);

  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      console.log('Current user not found in DB');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Following count:', currentUser.following?.length);

    const posts = await Post.find({
      $or: [
        { user: { $in: currentUser.following || [] } },
        { user: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('repository');
    
    console.log('Posts found:', posts.length);
    res.json(posts);
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending/all posts
// @route   GET /api/posts/explore
const getExplore = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('repository');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/like/:id
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment
// @route   POST /api/posts/comment/:id
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = {
      user: req.user._id,
      content: req.body.content
    };
    post.comments.push(comment);
    await post.save();
    const updatedPost = await Post.findById(req.params.id).populate('comments.user', 'username profilePic');
    res.json(updatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get projects by tech stack
// @route   GET /api/posts/projects
const getProjects = async (req, res) => {
  const { tech } = req.query;
  try {
    let query = { isProject: true };
    if (tech) {
      query.techStack = { $in: [new RegExp(tech, 'i')] };
    }
    const projects = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bookmark post
// @route   POST /api/posts/bookmark/:id
const bookmarkPost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.bookmarks.includes(req.params.id)) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== req.params.id);
    } else {
      user.bookmarks.push(req.params.id);
    }
    await user.save();
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
  console.log('--- Delete Post Debug ---');
  console.log('Post ID to delete:', req.params.id);
  console.log('User ID requesting:', req.user._id);

  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid Post ID format');
      return res.status(400).json({ message: 'Invalid Post ID format' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log('Post not found in DB');
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the owner
    if (post.user.toString() !== req.user._id.toString()) {
      console.log('Unauthorized delete attempt');
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    console.log('Post deleted successfully');
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost, getFeed, getExplore, likePost, addComment, getProjects, bookmarkPost, deletePost
};

module.exports = {
  createPost, getFeed, getExplore, likePost, addComment, getProjects, bookmarkPost, deletePost
};
