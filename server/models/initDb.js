const db = require('./db');

// Function to initialize database tables
function initDatabase() {
  return new Promise((resolve, reject) => {
    // Check if tasks table exists
    db.query("SHOW TABLES LIKE 'tasks'", (err, results) => {
      if (err) {
        console.error('Error checking tables:', err);
        return reject(err);
      }

      if (results.length === 0) {
        console.log('⚠️  Tasks table does not exist. Creating...');
        createTables()
          .then(() => {
            console.log('✅ Database tables created successfully');
            resolve();
          })
          .catch(reject);
      } else {
        console.log('✅ Tasks table exists');
        resolve();
      }
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        deadline DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    db.query(createTasksTable, (err) => {
      if (err) {
        console.error('Error creating tasks table:', err);
        // If foreign key constraint fails, try without it
        if (err.code === 'ER_CANNOT_ADD_FOREIGN') {
          console.log('⚠️  Foreign key constraint failed. Creating table without foreign key...');
          const createTasksTableNoFK = `
            CREATE TABLE IF NOT EXISTS tasks (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              status VARCHAR(50) DEFAULT 'pending',
              deadline DATETIME,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
          db.query(createTasksTableNoFK, (err2) => {
            if (err2) {
              return reject(err2);
            }
            resolve();
          });
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
}

module.exports = { initDatabase };

