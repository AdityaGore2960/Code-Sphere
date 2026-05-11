const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  headline: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  banner: { type: String, default: '' },
  bio: { type: String, default: '' },
  pronouns: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: [String], default: [] },
  education: { type: [String], default: [] },
  certifications: [{
    name: String,
    organization: String,
    issueDate: String,
    credentialUrl: String,
    file: String
  }],
  resume: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  url: { type: String, default: '' },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    portfolio: String
  },
  githubUsername: { type: String, default: '' },
  leetcodeUsername: { type: String, default: '' },
  codeforcesUsername: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  interests: { type: [String], default: [] },
  codingStats: {
    github: Object,
    leetcode: Object,
    codeforces: Object,
    lastUpdated: Date
  },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  points: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
