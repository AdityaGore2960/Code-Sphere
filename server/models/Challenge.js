const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  points: { type: Number, default: 10 },
  boilerplate: { type: String, required: true }, // Initial code structure
  solution: { type: String, required: true }, // Function name or expected logic
  testCases: [{
    input: { type: String },
    expected: { type: String }
  }],
  solvedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    solvedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Challenge', ChallengeSchema);
