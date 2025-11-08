// models/userModel.js
const db = require('../db').promise(); // use promise wrapper for async/await

const User = {
  async create(name, email, password_hash) {
    const sql = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
    const [result] = await db.execute(sql, [name, email, password_hash]);
    return { id: result.insertId, name, email };
  },

  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const [rows] = await db.execute(sql, [email]);
    return rows[0]; // undefined if not found
  },

  async findById(id) {
    const sql = 'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1';
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
};

module.exports = User;
