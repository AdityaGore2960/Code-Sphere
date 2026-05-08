const express = require('express');
const { getUserStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:username', protect, getUserStats);

module.exports = router;
