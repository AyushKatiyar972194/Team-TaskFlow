const express = require('express'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/userModel'); 
require('dotenv').config(); 
const router = express.Router(); 
router.post('/register', async (req, res) => { 
const { name, email, password } = req.body; 
if (!name || !email || !password) 
return res.status(400).json({ message: 'All fields required' }); 
const salt = await bcrypt.genSalt(10); 
const password_hash = await bcrypt.hash(password, salt); 
User.create(name, email, password_hash, (err) => { 
if (err) return res.status(500).json({ message: 'Email already registered' }); 
res.status(201).json({ message: 'User registered successfully' }); 
}); 
}); 
router.post('/login', (req, res) => { 
const { email, password } = req.body; 
User.findByEmail(email, async (err, results) => { 
if (err || results.length === 0) 
return res.status(400).json({ message: 'Invalid credentials' }); 
const user = results[0]; 
const isMatch = await bcrypt.compare(password, user.password_hash); 
if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' }); 
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
res.json({ token, user: { id: user.id, name: user.name, email: user.email } }); 
}); 
}); 
module.exports = router;