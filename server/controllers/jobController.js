const Job = require('../models/Job');

// @desc    Get all jobs with search and filters
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  const { q, type, experienceLevel, remote } = req.query;
  let query = {};

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { company: { $regex: q, $options: 'i' } },
      { skills: { $in: [new RegExp(q, 'i')] } }
    ];
  }

  if (type && type !== 'All') query.type = type;
  if (experienceLevel && experienceLevel !== 'All') query.experienceLevel = experienceLevel;
  if (remote === 'true') query.remote = true;
  if (remote === 'false') query.remote = false;

  try {
    const jobs = await Job.find(query)
      .populate('postedBy', 'username profilePic')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
const createJob = async (req, res) => {
  const { title, company, type, location, salary, description, link, skills, experienceLevel, remote, logo } = req.body;
  try {
    const job = await Job.create({
      title,
      company,
      type,
      location,
      salary,
      description,
      link,
      skills,
      experienceLevel,
      remote,
      logo,
      postedBy: req.user._id
    });

    const populatedJob = await Job.findById(job._id).populate('postedBy', 'username profilePic');
    const io = req.app.get('io');
    if (io) {
      io.emit('new_job', populatedJob);
    }

    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle save job
// @route   POST /api/jobs/save/:id
const toggleSaveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isSaved = job.savedBy.includes(req.user._id);
    if (isSaved) {
      job.savedBy = job.savedBy.filter(id => id.toString() !== req.user._id.toString());
    } else {
      job.savedBy.push(req.user._id);
    }

    await job.save();
    res.json({ message: isSaved ? 'Job unsaved' : 'Job saved', isSaved: !isSaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'username profilePic');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, createJob, toggleSaveJob, getJobById };
