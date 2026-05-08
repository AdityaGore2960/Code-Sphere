const User = require('../models/User');
const Notification = require('../models/Notification');
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
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profilePicUrl = user.profilePic;
    let bannerUrl = user.banner;

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

    // Handle File Uploads (Multer any)
    if (req.files && Array.isArray(req.files)) {
      const getFile = (name) => req.files.find(f => f.fieldname === name);

      const profilePicFile = getFile('profilePic');
      if (profilePicFile) {
        const b64 = Buffer.from(profilePicFile.buffer).toString("base64");
        const dataURI = "data:" + profilePicFile.mimetype + ";base64," + b64;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, { folder: 'codesphere_profiles' });
        profilePicUrl = uploadResponse.secure_url;
      }

      const bannerFile = getFile('banner');
      if (bannerFile) {
        const b64 = Buffer.from(bannerFile.buffer).toString("base64");
        const dataURI = "data:" + bannerFile.mimetype + ";base64," + b64;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, { folder: 'codesphere_banners' });
        bannerUrl = uploadResponse.secure_url;
      }

      const resumeFile = getFile('resume');
      if (resumeFile) {
        const b64 = Buffer.from(resumeFile.buffer).toString("base64");
        const dataURI = "data:" + resumeFile.mimetype + ";base64," + b64;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, { 
          folder: 'codesphere_resumes',
          resource_type: 'raw'
        });
        user.resume = uploadResponse.secure_url;
      }
    }

    // Handle Base64 fallbacks for profilePic
    if (req.body.profilePic && req.body.profilePic.startsWith('data:image')) {
      if (isCloudinaryConfigured) {
        const uploadResponse = await cloudinary.uploader.upload(req.body.profilePic, { folder: 'codesphere_profiles' });
        profilePicUrl = uploadResponse.secure_url;
      } else {
        profilePicUrl = req.body.profilePic;
      }
    } else if (req.body.profilePic) {
      profilePicUrl = req.body.profilePic;
    }

    // Handle Base64 fallbacks for banner
    if (req.body.banner && req.body.banner.startsWith('data:image')) {
      if (isCloudinaryConfigured) {
        const uploadResponse = await cloudinary.uploader.upload(req.body.banner, { folder: 'codesphere_banners' });
        bannerUrl = uploadResponse.secure_url;
      } else {
        bannerUrl = req.body.banner;
      }
    } else if (req.body.banner) {
      bannerUrl = req.body.banner;
    }

    user.profilePic = profilePicUrl;
    user.banner = bannerUrl;

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.headline = req.body.headline !== undefined ? req.body.headline : user.headline;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.pronouns = req.body.pronouns !== undefined ? req.body.pronouns : user.pronouns;
    
    // Parse complex fields
    if (req.body.experience) {
      user.experience = typeof req.body.experience === 'string' ? JSON.parse(req.body.experience) : req.body.experience;
    }
    if (req.body.education) {
      user.education = typeof req.body.education === 'string' ? JSON.parse(req.body.education) : req.body.education;
    }
    if (req.body.skills) {
      user.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
    }

    // Handle Certifications and their potential files
    if (req.body.certifications) {
      let certs = typeof req.body.certifications === 'string' ? JSON.parse(req.body.certifications) : req.body.certifications;
      
      if (req.files && Array.isArray(req.files)) {
        for (let i = 0; i < certs.length; i++) {
          const fieldName = `certFile_${i}`;
          const certFile = req.files.find(f => f.fieldname === fieldName);
          if (certFile) {
            const b64 = Buffer.from(certFile.buffer).toString("base64");
            const dataURI = "data:" + certFile.mimetype + ";base64," + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, { 
              folder: 'codesphere_certifications',
              resource_type: 'raw'
            });
            certs[i].file = uploadResponse.secure_url;
          }
        }
      }
      user.certifications = certs;
    }

    const handlesChanged = 
      (req.body.githubUsername !== undefined && req.body.githubUsername !== user.githubUsername) ||
      (req.body.leetcodeUsername !== undefined && req.body.leetcodeUsername !== user.leetcodeUsername) ||
      (req.body.codeforcesUsername !== undefined && req.body.codeforcesUsername !== user.codeforcesUsername);

    if (handlesChanged) {
      user.codingStats = undefined; // Force refresh on next fetch
    }

    user.githubUsername = req.body.githubUsername !== undefined ? req.body.githubUsername : user.githubUsername;
    user.leetcodeUsername = req.body.leetcodeUsername !== undefined ? req.body.leetcodeUsername : user.leetcodeUsername;
    user.codeforcesUsername = req.body.codeforcesUsername !== undefined ? req.body.codeforcesUsername : user.codeforcesUsername;
    user.socialLinks = req.body.socialLinks ? (typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : req.body.socialLinks) : user.socialLinks;
    user.interests = req.body.interests ? (typeof req.body.interests === 'string' ? JSON.parse(req.body.interests) : req.body.interests) : user.interests;

    const savedUser = await user.save();

    const updatedUser = await User.findById(savedUser._id)
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update Profile Error:', error);
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

      // Create Notification
      await Notification.create({
        recipient: userToFollow._id,
        sender: req.user._id,
        type: 'follow'
      });
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
