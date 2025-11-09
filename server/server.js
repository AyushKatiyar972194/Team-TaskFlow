// server.js

const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const db = require('./models/db'); // ensure pool is created so we know connection params are valid

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/api/auth', require('./routes/authRoutes')); 
// parse JSON bodies
app.use(express.json());

// simple health
app.get('/', (req, res) => res.send('API is running'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// global error logger (simple)
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
