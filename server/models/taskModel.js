const db = require('./db');

const Task = {
  getAll: (userId, callback) => {
    const sql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC';
    db.query(sql, [userId], callback);
  },

  getById: (taskId, userId, callback) => {
    const sql = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
    db.query(sql, [taskId, userId], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0] || null);
    });
  },

  create: (userId, title, description, deadline, status, callback) => {
    const sql = 'INSERT INTO tasks (user_id, title, description, deadline, status) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [userId, title, description, deadline, status], callback);
  },

  update: (id, title, description, status, deadline, callback) => {
    const sql = 'UPDATE tasks SET title = ?, description = ?, status = ?, deadline = ? WHERE id = ?';
    console.log('Task.update called with:', { id, title, description, status, deadline });
    console.log('SQL:', sql);
    console.log('Parameters:', [title, description, status, deadline, id]);
    db.query(sql, [title, description, status, deadline, id], (err, result) => {
      if (err) {
        console.error('Database update error:', err);
      } else {
        console.log('Database update result:', result);
      }
      callback(err, result);
    });
  },

  delete: (id, callback) => {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [id], callback);
  }
};

module.exports = Task;
