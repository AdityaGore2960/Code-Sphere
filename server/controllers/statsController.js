const axios = require('axios');
const User = require('../models/User');

// @desc    Get user's coding stats (GitHub, LeetCode, Codeforces)
// @route   GET /api/stats/:username
const getUserStats = async (req, res) => {
  const { github, leetcode, codeforces } = req.query;
  const username = req.params.username;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check for cached stats (less than 1 hour old)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.codingStats && user.codingStats.lastUpdated > oneHourAgo) {
      console.log('Serving cached stats for', username);
      return res.json(user.codingStats);
    }

    const stats = {};

    // 1. GitHub Stats
    if (github) {
      try {
        const githubRes = await axios.get(`https://api.github.com/users/${github}`, {
           headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}
        });
        const reposRes = await axios.get(`https://api.github.com/users/${github}/repos?sort=updated&per_page=5`, {
           headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}
        });

        stats.github = {
          public_repos: githubRes.data.public_repos,
          followers: githubRes.data.followers,
          following: githubRes.data.following,
          created_at: githubRes.data.created_at,
          top_repos: reposRes.data.map(repo => ({
            name: repo.name,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            url: repo.html_url
          }))
        };
      } catch (err) {
        console.error('GitHub Fetch Error:', err.message);
      }
    }

    // 2. LeetCode Stats
    if (leetcode) {
      try {
        const leetcodeRes = await axios.get(`https://leetcode-stats-api.herokuapp.com/${leetcode}`);
        if (leetcodeRes.data.status === 'success') {
          stats.leetcode = leetcodeRes.data;
        }
      } catch (err) {
        console.error('LeetCode Fetch Error:', err.message);
      }
    }

    // 3. Codeforces Stats
    if (codeforces) {
      try {
        const cfUserRes = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforces}`);
        const cfRatingRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${codeforces}`);
        
        if (cfUserRes.data.status === 'OK') {
          stats.codeforces = {
            ...cfUserRes.data.result[0],
            ratingHistory: cfRatingRes.data.result
          };
        }
      } catch (err) {
        console.error('Codeforces Fetch Error:', err.message);
      }
    }

    // Save to DB
    user.codingStats = {
      ...stats,
      lastUpdated: new Date()
    };
    await user.save();

    res.json(user.codingStats);
  } catch (error) {
    console.error('Stats Controller Error:', error);
    res.status(500).json({ message: 'Error fetching coding stats' });
  }
};

module.exports = { getUserStats };
