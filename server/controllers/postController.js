const Post = require('../models/Post');
const User = require('../models/User');
const Repo = require('../models/Repo');
const Notification = require('../models/Notification');
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
  console.log('--- Create Post Debug Start ---');
  console.log('Request Body:', req.body);
  console.log('Files Received:', req.files ? Object.keys(req.files) : 'None');

  try {
    let imageUrl = '';
    let imagesUrls = [];
    let videoUrl = '';

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
      !process.env.CLOUDINARY_CLOUD_NAME.includes('your_') &&
      process.env.CLOUDINARY_API_KEY &&
      !process.env.CLOUDINARY_API_KEY.includes('your_');

    if (req.files) {
      if (isCloudinaryConfigured) {
        // Handle single image
        if (req.files['image']) {
          const file = req.files['image'][0];
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = "data:" + file.mimetype + ";base64," + b64;
          const uploadResponse = await cloudinary.uploader.upload(dataURI, { folder: 'codesphere_posts' });
          imageUrl = uploadResponse.secure_url;
        }

        // Handle multiple images (screenshots)
        if (req.files['images']) {
          for (const file of req.files['images']) {
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = "data:" + file.mimetype + ";base64," + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, { folder: 'codesphere_posts' });
            imagesUrls.push(uploadResponse.secure_url);
          }
        }

        // Handle video
        if (req.files['video']) {
          const file = req.files['video'][0];
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = "data:" + file.mimetype + ";base64," + b64;
          const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'codesphere_videos',
            resource_type: 'video'
          });
          videoUrl = uploadResponse.secure_url;
        }
      } else {
        console.warn('Cloudinary not configured. Skipping file uploads.');
      }
    }

    // Ensure content is present (Mongoose required field)
    const postContent = req.body.content || (req.body.isProject === 'true' ? 'New project showcase!' : 'Shared a new update.');

    let techStack = req.body.techStack || [];
    if (typeof techStack === 'string') {
      try { techStack = JSON.parse(techStack); } catch (e) { techStack = techStack.split(',').map(s => s.trim()); }
    }

    let event = req.body.event;
    if (typeof event === 'string' && event.trim()) {
      try { event = JSON.parse(event); } catch (e) { event = null; }
    }

    // Extract tags from content (hashtags)
    const contentTags = postContent.match(/#(\w+)/g)?.map(tag => tag.substring(1).toLowerCase()) || [];

    // Merge with techStack if project
    const allTags = [...new Set([...contentTags, ...(Array.isArray(techStack) ? techStack : [])])];

    const postData = {
      user: req.user._id,
      content: postContent,
      image: imageUrl || '',
      images: imagesUrls,
      tags: allTags,
      isProject: req.body.isProject === 'true' || req.body.isProject === true,
      techStack: Array.isArray(techStack) ? techStack : [],
      githubLink: req.body.githubLink || '',
      demoLink: req.body.demoLink || '',
      repository: req.body.repository && req.body.repository !== 'undefined' ? req.body.repository : undefined,
      video: videoUrl || '',
      event: event && event.title ? event : undefined
    };

    console.log('Post Data to Save:', postData);

    const post = await Post.create(postData);

    const populatedPost = await Post.findById(post._id).populate([
      { path: 'user', select: 'username profilePic' },
      { path: 'repository' }
    ]);

    console.log('--- Create Post Success ---');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('--- Create Post Error ---');
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error while creating post',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};


// @desc    Get feed posts (following)
// @route   GET /api/posts
const getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const followingIds = currentUser.following || [];
    const userInterests = [...new Set([...(currentUser.interests || []), ...(currentUser.skills || [])])];

    // Fetch posts from the last 7 days to keep feed fresh
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get all potential candidate posts
    let posts = await Post.find({
      createdAt: { $gte: oneWeekAgo }
    })
      .populate('user', 'username profilePic')
      .populate('repository');

    // Calculate Smart Score for each post
    const scoredPosts = posts.map(post => {
      let score = 0;
      const hoursOld = (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60);

      // 1. Following Factor (+15 pts)
      if (followingIds.includes(post.user._id.toString()) || post.user._id.toString() === req.user._id.toString()) {
        score += 15;
      }

      // 2. Interest Factor (+8 pts per matching tag)
      if (post.tags && post.tags.length > 0 && userInterests.length > 0) {
        const matches = post.tags.filter(tag => userInterests.includes(tag.toLowerCase())).length;
        score += matches * 8;
      }

      // 3. Trending/Engagement Factor (Likes weighted by age)
      const engagement = (post.likes?.length || 0) + (post.comments?.length || 0) * 2;
      const trendingBoost = engagement / Math.pow(hoursOld + 2, 1.2);
      score += trendingBoost * 10;

      // 4. Recency Bonus
      score += (1 / (hoursOld + 1)) * 20;

      // Convert to plain object to attach score for sorting
      const postObj = post.toObject();
      postObj.relevanceScore = score;
      return postObj;
    });

    // Sort by score and take top 50
    const sortedPosts = scoredPosts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 50);

    res.json(sortedPosts);
  } catch (error) {
    console.error('Smart Feed Error:', error);
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
    if (!post.likes.includes(req.user._id)) {
      post.likes.push(req.user._id);
      // Create Notification
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id
        });
      }
    } else {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
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

    // Create Notification
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id
      });
    }

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
