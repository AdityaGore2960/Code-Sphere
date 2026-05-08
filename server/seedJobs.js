const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

const jobs = [
  {
    title: 'Frontend Developer Intern',
    company: 'Google',
    type: 'Internship',
    location: 'Bangalore, India',
    salary: '₹50,000/mo',
    description: 'Looking for a React enthusiast for our core UI team.',
    link: 'https://careers.google.com'
  },
  {
    title: 'Full Stack Engineer',
    company: 'Meta',
    type: 'Full-time',
    location: 'Remote',
    salary: '$150k - $200k',
    description: 'Help us build the future of social networking with Node.js and React.',
    link: 'https://metacareers.com'
  },
  {
    title: 'Freelance Web Designer',
    company: 'StartupX',
    type: 'Freelance',
    location: 'Remote',
    salary: '$3000/project',
    description: 'Design a high-converting landing page for a new SaaS product.',
    link: 'https://upwork.com'
  },
  {
    title: 'Backend Intern',
    company: 'Amazon',
    type: 'Internship',
    location: 'Hyderabad, India',
    salary: '₹60,000/mo',
    description: 'Work on distributed systems and cloud infrastructure.',
    link: 'https://amazon.jobs'
  }
];

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await Job.deleteMany();
    console.log('Cleared existing jobs');
    
    await Job.insertMany(jobs);
    console.log('Seeded jobs successfully');
    
    process.exit();
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedJobs();
