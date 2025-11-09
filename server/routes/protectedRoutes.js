// routes/protectedRoutes.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/userModel');

const router = express.Router();

// Example: get current user profile
router.get('/me', authenticateToken, (req, res) => {
  const userId = req.user.id;
  User.findById(userId, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  });
});

module.exports = router;
