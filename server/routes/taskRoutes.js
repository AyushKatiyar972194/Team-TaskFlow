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

  // Convert deadline from datetime-local format (YYYY-MM-DDTHH:mm) to MySQL format (YYYY-MM-DD HH:mm:ss)
  let formattedDeadline = null;
  if (deadline && deadline.trim() !== '') {
    // Replace 'T' with space
    formattedDeadline = deadline.replace('T', ' ');
    // Ensure we have HH:mm:ss format
    const timePart = formattedDeadline.split(' ')[1] || '';
    const timeParts = timePart.split(':');
    if (timeParts.length === 2) {
      // Add seconds if missing
      formattedDeadline = formattedDeadline.replace(/:([0-9]{2})$/, ':$1:00');
    } else if (timeParts.length === 1) {
      // Add minutes and seconds if missing
      formattedDeadline += ':00:00';
    }
    // Ensure format is YYYY-MM-DD HH:mm:ss
    if (!formattedDeadline.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      console.error('Invalid deadline format:', formattedDeadline);
      formattedDeadline = null;
    }
  }

  Task.create(req.user.id, title, description, formattedDeadline, status || 'pending', (err, result) => {
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
  
  console.log('PUT /api/tasks/:id - Received:', { taskId, title, description, status, deadline });
  
  // Validate required fields
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  
  // Validate task ID
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  
  // Convert deadline from datetime-local format (YYYY-MM-DDTHH:mm) to MySQL format (YYYY-MM-DD HH:mm:ss)
  let formattedDeadline = null;
  if (deadline && deadline.trim() !== '') {
    try {
      console.log('Converting deadline:', deadline);
      // Replace 'T' with space
      formattedDeadline = deadline.replace('T', ' ');
      
      // Split into date and time parts
      const parts = formattedDeadline.split(' ');
      const datePart = parts[0] || '';
      const timePart = parts[1] || '';
      
      console.log('Split deadline:', { datePart, timePart });
      
      if (datePart && timePart) {
        // Parse time part
        const timeParts = timePart.split(':');
        let hours = timeParts[0] || '00';
        let minutes = timeParts[1] || '00';
        let seconds = timeParts[2] || '00';
        
        console.log('Time parts:', { hours, minutes, seconds });
        
        // Ensure two-digit format
        hours = String(parseInt(hours) || 0).padStart(2, '0');
        minutes = String(parseInt(minutes) || 0).padStart(2, '0');
        seconds = String(parseInt(seconds) || 0).padStart(2, '0');
        
        // Reconstruct in MySQL format: YYYY-MM-DD HH:mm:ss
        formattedDeadline = `${datePart} ${hours}:${minutes}:${seconds}`;
        
        console.log('Formatted deadline:', formattedDeadline);
        
        // Validate final format
        if (!formattedDeadline.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
          console.error('Invalid deadline format after conversion:', formattedDeadline);
          formattedDeadline = null;
        } else {
          console.log('Deadline conversion successful:', deadline, '->', formattedDeadline);
        }
      } else {
        console.error('Invalid deadline format - missing date or time:', deadline);
        formattedDeadline = null;
      }
    } catch (error) {
      console.error('Error converting deadline format:', error, deadline);
      formattedDeadline = null;
    }
  } else {
    console.log('No deadline provided or empty');
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
    
    // Now update the task with formatted deadline
    console.log('Updating task with:', { taskId, title, description, status: status || 'pending', deadline: formattedDeadline });
    Task.update(taskId, title, description, status || 'pending', formattedDeadline, (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ message: 'Error updating task', error: err.message });
      }
      console.log('Task updated successfully. Result:', result);
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