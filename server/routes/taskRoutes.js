const express = require('express');
const Task = require('../models/taskModel');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  console.log('Fetching tasks for user ID:', req.user.id);
  Task.getAll(req.user.id, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      console.error('Error code:', err.code);
      console.error('Error SQL state:', err.sqlState);
      return res.status(500).json({ 
        message: 'Error fetching tasks',
        error: err.message || 'Database error',
        code: err.code,
        sqlState: err.sqlState
      });
    }
    console.log('Tasks fetched successfully:', results ? results.length : 0, 'tasks');
    res.json(results || []);
  });
});

router.get('/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;
  
  // Validate task ID
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  
  Task.getById(taskId, req.user.id, (err, result) => {
    if (err) {
      console.error('Error fetching task:', err);
      return res.status(500).json({ 
        message: 'Error fetching task',
        error: err.message || 'Database error'
      });
    }
    if (!result) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(result);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { title, description, deadline, status } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  Task.create(req.user.id, title, description, deadline, status || 'pending', (err, result) => {
    if (err) {
      console.error('Error creating task:', err);
      return res.status(500).json({ message: 'Error creating task', error: err.message });
    }
    res.status(201).json({ message: 'Task created successfully', id: result.insertId });
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;
  const { title, description, status, deadline } = req.body;
  
  // Validate required fields
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  
  // Validate task ID
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  
  // First verify the task belongs to the user
  Task.getById(taskId, req.user.id, (err, task) => {
    if (err) {
      console.error('Error fetching task for update:', err);
      return res.status(500).json({ message: 'Error updating task', error: err.message });
    }
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Now update the task
    Task.update(taskId, title, description, status || 'pending', deadline, (err) => {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ message: 'Error updating task', error: err.message });
      }
      res.json({ message: 'Task updated successfully' });
    });
  });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;
  
  // Validate task ID
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  
  // First verify the task belongs to the user
  Task.getById(taskId, req.user.id, (err, task) => {
    if (err) {
      console.error('Error fetching task for delete:', err);
      return res.status(500).json({ message: 'Error deleting task', error: err.message });
    }
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Now delete the task
    Task.delete(taskId, (err) => {
      if (err) {
        console.error('Error deleting task:', err);
        return res.status(500).json({ message: 'Error deleting task', error: err.message });
      }
      res.json({ message: 'Task deleted successfully' });
    });
  });
});

module.exports = router;