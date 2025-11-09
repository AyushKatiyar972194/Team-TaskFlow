const express = require('express');
const Task = require('../models/taskModel');
const authenticateToken = require('./authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  Task.getAll(req.user.id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching tasks' });
    res.json(results);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { title, description, deadline } = req.body;
  if (!title || !description)
    return res.status(400).json({ message: 'All fields required' });

  Task.create(req.user.id, title, description, deadline, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error creating task' });
    res.status(201).json({ message: 'Task created successfully', id: result.insertId });
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { title, description, status, deadline } = req.body;
  Task.update(req.params.id, title, description, status, deadline, (err) => {
    if (err) return res.status(500).json({ message: 'Error updating task' });
    res.json({ message: 'Task updated successfully' });
  });
});

router.delete('/:id', authenticateToken, (req, res) => {
  Task.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting task' });
    res.json({ message: 'Task deleted successfully' });
  });
});

module.exports = router;