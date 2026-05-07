const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, followUser, searchUsers, getGithubRepos } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile/:username', getProfile);
router.put('/profile', protect, upload.single('profilePic'), updateProfile);
router.post('/follow/:id', protect, followUser);
router.get('/search', searchUsers);
router.get('/github/:githubUsername', getGithubRepos);

module.exports = router;
