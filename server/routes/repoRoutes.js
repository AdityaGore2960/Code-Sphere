const express = require('express');
const router = express.Router();
const { createRepo, getUserRepos, getAllRepos } = require('../controllers/repoController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createRepo);
router.get('/', getAllRepos);
router.get('/:username', getUserRepos);

module.exports = router;
