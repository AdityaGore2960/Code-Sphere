const Repo = require('../models/Repo');

// @desc    Create a new repository
// @route   POST /api/repos
const createRepo = async (req, res) => {
  try {
    const { name, description, visibility, hasReadme, license } = req.body;

    if (!name) return res.status(400).json({ message: 'Repository name is required' });

    const newRepo = await Repo.create({
      owner: req.user._id,
      name,
      description,
      private: visibility === 'private',
      hasReadme: hasReadme || false,
      license: license || 'None',
      html_url: `/repo/${req.user.username}/${name}` // Virtual URL
    });

    res.status(201).json(newRepo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all repositories for a user
// @route   GET /api/repos/:username
const getUserRepos = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const repos = await Repo.find({ owner: user._id }).sort({ createdAt: -1 });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all public repositories
// @route   GET /api/repos
const getAllRepos = async (req, res) => {
  try {
    const repos = await Repo.find({ private: false })
      .populate('owner', 'username profilePic')
      .sort({ createdAt: -1 });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRepo, getUserRepos, getAllRepos };
