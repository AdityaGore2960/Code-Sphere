const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  images: { type: [String], default: [] },
  tags: { type: [String], default: [] },

  // Project Showcase Fields
  isProject: { type: Boolean, default: false },
  techStack: { type: [String], default: [] },
  githubLink: { type: String, default: '' },
  demoLink: { type: String, default: '' },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo' },
  video: { type: String, default: '' },
  event: {
    title: { type: String },
    date: { type: Date }
  },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
