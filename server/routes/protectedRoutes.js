// routes/protectedRoutes.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/userModel');

const router = express.Router();

// Example: get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
