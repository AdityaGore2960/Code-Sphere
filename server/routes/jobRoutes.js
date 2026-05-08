const express = require('express');
const router = express.Router();
const { getJobs, createJob } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.post('/', protect, createJob);

module.exports = router;
