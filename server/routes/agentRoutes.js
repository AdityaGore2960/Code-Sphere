const express = require('express');
const router = express.Router();
const { processAgentTask, getAgentHistory } = require('../controllers/agentController');
const { protect } = require('../middleware/auth');

router.post('/task', protect, processAgentTask);
router.get('/history', protect, getAgentHistory);

module.exports = router;
