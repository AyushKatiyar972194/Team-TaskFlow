const express = require('express'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/userModel'); 
require('dotenv').config(); 
const router = express.Router(); 
router.post('/register', async (req, res) => { 
  try {
    const { name, email, password } = req.body; 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    
    const salt = await bcrypt.genSalt(10); 
    const password_hash = await bcrypt.hash(password, salt); 
    
    User.create(name, email, password_hash, (err) => { 
      if (err) {
        console.error('Registration error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already registered' });
        }
        return res.status(500).json({ message: 'Registration failed. Please try again.' });
      }
      res.status(201).json({ message: 'User registered successfully' }); 
    }); 
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
}); 
router.post('/login', (req, res) => { 
  try {
    const { email, password } = req.body; 
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    User.findByEmail(email, async (err, results) => { 
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Login failed. Please try again.' });
      }
      
      if (!results || results.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' }); 
      }
      
      const user = results[0]; 
      const isMatch = await bcrypt.compare(password, user.password_hash); 
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' }); 
      }
      
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ message: 'Server configuration error' });
      }
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } }); 
    }); 
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
}); 
module.exports = router;