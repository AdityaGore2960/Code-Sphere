const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register user — saves new user to MongoDB
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email and password' });
  }

  try {
    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Create and save user to database (password is auto-hashed by pre-save hook)
    const user = await User.create({ username, email, password });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user — checks database for user, then verifies password
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Step 1: Look up user in database by email
    const user = await User.findOne({ email });

    if (!user) {
      // No account found — return a distinct code so the client can redirect to signup
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'No account found with this email. Please sign up first.',
      });
    }

    // Step 2: Verify password against the hashed one in the database
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        code: 'WRONG_PASSWORD',
        message: 'Incorrect password. Please try again.',
      });
    }

    // Step 3: All good — return user data + token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
