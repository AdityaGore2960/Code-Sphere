const User = require('../models/User');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile/:username
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  console.log('--- Update Profile Debug ---');
  console.log('User:', req.user?._id);
  console.log('Body Fields:', Object.keys(req.body));
  console.log('File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profilePicUrl = user.profilePic;

    // Handle File Upload (Multer)
    if (req.file) {
      try {
        const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.includes('your_');
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        if (isCloudinaryConfigured) {
          console.log('Uploading profile pic to Cloudinary...');
          const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'codesphere_profiles'
          });
          profilePicUrl = uploadResponse.secure_url;
        } else {
          console.log('Cloudinary not configured, using base64 for profile pic...');
          profilePicUrl = dataURI;
        }
      } catch (cloudErr) {
        console.error('Cloudinary Profile Upload Error:', cloudErr);
        // Fallback to base64 if possible
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        profilePicUrl = "data:" + req.file.mimetype + ";base64," + b64;
      }
    }
    // Handle Base64 Upload (JSON)
    else if (req.body.profilePic && req.body.profilePic.startsWith('data:image')) {
      try {
        const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

        if (isCloudinaryConfigured) {
          console.log('Uploading base64 to Cloudinary...');
          const uploadResponse = await cloudinary.uploader.upload(req.body.profilePic, {
            folder: 'codesphere_profiles'
          });
          profilePicUrl = uploadResponse.secure_url;
        } else {
          profilePicUrl = req.body.profilePic;
        }
      } catch (cloudErr) {
        console.error('Cloudinary Base64 Upload Error:', cloudErr);
        profilePicUrl = req.body.profilePic;
      }
    } else if (req.body.profilePic !== undefined) {
      profilePicUrl = req.body.profilePic;
    }

    user.profilePic = profilePicUrl;

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.pronouns = req.body.pronouns !== undefined ? req.body.pronouns : user.pronouns;
    user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
    user.githubUsername = req.body.githubUsername !== undefined ? req.body.githubUsername : user.githubUsername;
    user.socialLinks = req.body.socialLinks ? (typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : req.body.socialLinks) : user.socialLinks;
    user.skills = req.body.skills ? (typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills) : user.skills;

    const savedUser = await user.save();

    const updatedUser = await User.findById(savedUser._id)
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update Profile Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/follow/:id
const followUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) return res.status(404).json({ message: 'User to follow not found' });
    if (!currentUser) return res.status(404).json({ message: 'Current user not found' });

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = currentUser.following.some(followId => followId.toString() === userToFollow._id.toString());

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();
    res.json({ message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully', isFollowing: !isFollowing });
  } catch (error) {
    console.error('Follow User Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
const searchUsers = async (req, res) => {
  const query = req.query.query || req.query.q || '';
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } }
      ]
    }).select('username profilePic bio skills');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get GitHub repos
// @route   GET /api/users/github/:githubUsername
const getGithubRepos = async (req, res) => {
  try {
    const { githubUsername } = req.params;
    if (!githubUsername) return res.status(400).json({ message: 'GitHub username is required' });

    const token = process.env.GITHUB_TOKEN;
    const hasValidToken = token && token.startsWith('ghp_') && !token.includes('optional');

    const response = await axios.get(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=12`, {
      headers: hasValidToken ? { Authorization: `token ${token}` } : {}
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Error fetching repositories';

    console.error(`Github API Error (${status}):`, message);

    res.status(status).json({
      message: status === 404 ? 'Github user not found' : message,
      error: error.response?.status === 401 ? 'Invalid GitHub Token' : 'Github API Error'
    });
  }
};

module.exports = { getProfile, updateProfile, followUser, searchUsers, getGithubRepos };
