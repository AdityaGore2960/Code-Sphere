const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const dummyUsers = [
  {
    username: "john_dev",
    name: "John Developer",
    email: "john@example.com",
    password: "password123",
    bio: "Senior Full Stack Engineer | Open Source Enthusiast",
    githubUsername: "johndev",
    leetcodeUsername: "johndev_lc",
    codeforcesUsername: "johndev_cf",
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    interests: ["webdev", "ai", "opensource"],
    codingStats: {
      github: {
        public_repos: 45,
        followers: 120,
        top_repos: [
          { name: "react-ui-lib", stars: 150, forks: 30, language: "TypeScript" },
          { name: "node-server-boilerplate", stars: 85, forks: 15, language: "JavaScript" }
        ]
      },
      leetcode: {
        totalSolved: 450,
        ranking: 15000,
        easySolved: 150,
        mediumSolved: 200,
        hardSolved: 100
      },
      codeforces: {
        rating: 1850,
        maxRank: "candidate master",
        ratingHistory: [
          { newRating: 1500 }, { newRating: 1620 }, { newRating: 1580 }, { newRating: 1710 }, { newRating: 1850 }
        ]
      },
      lastUpdated: new Date()
    }
  },
  {
    username: "jane_coder",
    name: "Jane Coder",
    email: "jane@example.com",
    password: "password123",
    bio: "Algorithm Lover | competitive Programmer",
    githubUsername: "janecoder",
    leetcodeUsername: "jane_lc",
    codeforcesUsername: "jane_cf",
    skills: ["C++", "Python", "Algorithms", "Data Structures"],
    interests: ["competitive-coding", "python", "algorithms"],
    codingStats: {
      github: {
        public_repos: 12,
        followers: 50,
        top_repos: [
          { name: "algo-visualizer", stars: 300, forks: 80, language: "C++" }
        ]
      },
      leetcode: {
        totalSolved: 800,
        ranking: 5000,
        easySolved: 200,
        mediumSolved: 400,
        hardSolved: 200
      },
      codeforces: {
        rating: 2100,
        maxRank: "master",
        ratingHistory: [
          { newRating: 1700 }, { newRating: 1850 }, { newRating: 1920 }, { newRating: 2050 }, { newRating: 2100 }
        ]
      },
      lastUpdated: new Date()
    }
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const u of dummyUsers) {
      const exists = await User.findOne({ username: u.username });
      if (!exists) {
        await User.create(u);
        console.log(`Created user: ${u.username}`);
      } else {
        exists.codingStats = u.codingStats;
        await exists.save();
        console.log(`Updated stats for user: ${u.username}`);
      }
    }

    console.log('Seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
