const Challenge = require('../models/Challenge');
const User = require('../models/User');

// @desc    Get all challenges
// @route   GET /api/challenges
const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit challenge solution
// @route   POST /api/challenges/:id/submit
const submitSolution = async (req, res) => {
  const { code } = req.body;
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    // Simple JS execution for "Mini Problems"
    // In production, use a secure sandbox like 'vm2'
    let passed = true;
    let results = [];

    for (const test of challenge.testCases) {
      try {
        // Prepare execution context
        const execute = new Function('input', `${code}; return solution(input);`);
        const output = execute(JSON.parse(test.input));
        
        const isCorrect = JSON.stringify(output) === test.expected;
        if (!isCorrect) passed = false;
        
        results.push({ input: test.input, expected: test.expected, output: JSON.stringify(output), passed: isCorrect });
      } catch (err) {
        passed = false;
        results.push({ input: test.input, error: err.message, passed: false });
      }
    }

    if (passed) {
      // Check if already solved
      const alreadySolved = challenge.solvedBy.find(s => s.user.toString() === req.user._id.toString());
      if (!alreadySolved) {
        challenge.solvedBy.push({ user: req.user._id });
        await challenge.save();

        // Update user points
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: challenge.points } });
      }
    }

    res.json({ passed, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Leaderboard
// @route   GET /api/challenges/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ points: -1 })
      .limit(10)
      .select('username profilePic points');
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChallenges, submitSolution, getLeaderboard };
