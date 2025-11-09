const db = require('./db');

const Task = {
  getAll: (userId, callback) => {
    const sql = 'SELECT * FROM tasks WHERE user_id = ?';
    db.query(sql, [userId], callback);
  },

  create: (userId, title, description, deadline, callback) => {
    const sql = 'INSERT INTO tasks (user_id, title, description, deadline) VALUES (?, ?, ?, ?)';
    db.query(sql, [userId, title, description, deadline], callback);
  },

  update: (taskId, title, description, status, deadline, callback) => {
    const sql = 'UPDATE tasks SET title=?, description=?, status=?, deadline=? WHERE id=?';
    db.query(sql, [title, description, status, deadline, taskId], callback);
  },

  delete: (taskId, callback) => {
    const sql = 'DELETE FROM tasks WHERE id=?';
    db.query(sql, [taskId], callback);
  }
};

module.exports = Task;