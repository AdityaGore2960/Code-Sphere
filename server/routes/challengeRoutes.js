const express = require('express');
const router = express.Router();
const { getChallenges, submitSolution, getLeaderboard } = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getChallenges);
router.post('/:id/submit', protect, submitSolution);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
