const mongoose = require('mongoose');

const RepoSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  private: { type: Boolean, default: false },
  hasReadme: { type: Boolean, default: false },
  license: { type: String, default: 'None' },
  language: { type: String, default: 'JavaScript' },
  stargazers_count: { type: Number, default: 0 },
  forks_count: { type: Number, default: 0 },
  html_url: { type: String, default: '#' }
}, { timestamps: true });

module.exports = mongoose.model('Repo', RepoSchema);
