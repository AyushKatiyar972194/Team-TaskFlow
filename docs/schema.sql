CREATE DATABASE taskflow_db;
USE taskflow_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'To Do',
  assigned_to VARCHAR(100),
  deadline DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

