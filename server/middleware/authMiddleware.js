const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 

function authenticateToken(req, res, next) { 
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const authHeader = req.headers['authorization']; 
  const token = authHeader && authHeader.split(' ')[1]; 
  
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' }); 
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => { 
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' }); 
    }
    req.user = user; 
    next(); 
  }); 
} 

module.exports = authenticateToken;