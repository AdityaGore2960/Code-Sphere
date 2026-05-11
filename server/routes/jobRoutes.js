const express = require('express');
const router = express.Router();
const { getJobs, createJob, toggleSaveJob, getJobById } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.get('/:id', protect, getJobById);
router.post('/', protect, createJob);
router.post('/save/:id', protect, toggleSaveJob);

module.exports = router;
