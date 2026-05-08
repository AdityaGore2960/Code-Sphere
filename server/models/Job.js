const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  logo: { type: String },
  type: { 
    type: String, 
    enum: ['Full-time', 'Internship', 'Freelance', 'Contract'], 
    default: 'Full-time' 
  },
  location: { type: String, default: 'Remote' },
  salary: { type: String },
  description: { type: String },
  link: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
