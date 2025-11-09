const db = require('./db'); 

const User = { 
  create: (name, email, password_hash, callback) => { 
    const sql = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'; 
    db.query(sql, [name, email, password_hash], callback); 
  }, 
  findByEmail: (email, callback) => { 
    const sql = 'SELECT * FROM users WHERE email = ?'; 
    db.query(sql, [email], callback); 
  },
  findById: (id, callback) => {
    const sql = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
    db.query(sql, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0] || null);
    });
  }
}; 

module.exports = User; 
