const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
const createJob = async (req, res) => {
  const { title, company, type, location, salary, description, link } = req.body;
  try {
    const job = await Job.create({
      title,
      company,
      type,
      location,
      salary,
      description,
      link,
      postedBy: req.user._id
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getJobs, createJob };
