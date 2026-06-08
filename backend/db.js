const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'project_manager.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

async function initDB() {
  try {
    await query.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_color TEXT NOT NULL DEFAULT '#6366f1',
        avatar_url TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await query.run('ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL');
    } catch (e) {}

    await query.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    await query.run(`
      CREATE TABLE IF NOT EXISTS project_members (
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    await query.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('todo', 'in_progress', 'review', 'done')) DEFAULT 'todo',
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        due_date TEXT,
        assignee_id INTEGER,
        position INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE SET NULL
      )
    `);

    await query.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    await query.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        project_id INTEGER,
        task_id INTEGER,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables verified/created successfully.');
    await seedData();
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

async function seedData() {
  const usersCount = await query.get('SELECT COUNT(*) as count FROM users');
  if (usersCount.count === 0) {
    console.log('Seeding initial data...');
    
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      { username: 'alex', email: 'alex@example.com', password_hash: passwordHash, avatar_color: '#f59e0b' },
      { username: 'sophie', email: 'sophie@example.com', password_hash: passwordHash, avatar_color: '#10b981' },
      { username: 'marcus', email: 'marcus@example.com', password_hash: passwordHash, avatar_color: '#3b82f6' }
    ];

    const seededUsers = [];
    for (const u of users) {
      const res = await query.run(
        'INSERT INTO users (username, email, password_hash, avatar_color) VALUES (?, ?, ?, ?)',
        [u.username, u.email, u.password_hash, u.avatar_color]
      );
      seededUsers.push({ id: res.id, ...u });
    }

    const projects = [
      { name: 'Alpha Platform Development', description: 'Rebuilding the core web engine for visual board layout.', owner_id: seededUsers[0].id },
      { name: 'Mobile App Refactor', description: 'Upgrading core navigation modules and cache performance.', owner_id: seededUsers[1].id }
    ];

    const seededProjects = [];
    for (const p of projects) {
      const res = await query.run(
        'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
        [p.name, p.description, p.owner_id]
      );
      seededProjects.push({ id: res.id, ...p });
    }

    for (const project of seededProjects) {
      for (const user of seededUsers) {
        await query.run(
          'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
          [project.id, user.id]
        );
      }
    }

    const tasks = [
      { project_id: seededProjects[0].id, title: 'Implement CSS Nesting Layout', description: 'Utilize CSS nesting features to organize our glassmorphic dashboard rules cleanly.', status: 'done', priority: 'high', due_date: '2026-06-10', assignee_id: seededUsers[0].id, position: 0 },
      { project_id: seededProjects[0].id, title: 'Add WebSockets live board updates', description: 'Establish dynamic state broadcast via WS channels when user moves tasks.', status: 'in_progress', priority: 'high', due_date: '2026-06-15', assignee_id: seededUsers[1].id, position: 0 },
      { project_id: seededProjects[0].id, title: 'Audit Accessibility Keyboard Navigation', description: 'Ensure full focus management compatibility for dashboard overlays and modal details.', status: 'review', priority: 'medium', due_date: '2026-06-20', assignee_id: seededUsers[2].id, position: 0 },
      { project_id: seededProjects[0].id, title: 'Design user profile screen', description: 'Create responsive card sections showing user tasks and history charts.', status: 'todo', priority: 'low', due_date: '2026-06-30', assignee_id: null, position: 0 }
    ];

    const seededTasks = [];
    for (const t of tasks) {
      const res = await query.run(
        'INSERT INTO tasks (project_id, title, description, status, priority, due_date, assignee_id, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.position]
      );
      seededTasks.push({ id: res.id, ...t });
    }

    await query.run(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [seededTasks[1].id, seededUsers[0].id, "I'm currently working on setting up the socket heartbeat check to make sure connections auto-reconnect."]
    );
    await query.run(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [seededTasks[1].id, seededUsers[2].id, 'Awesome, looking forward to testing the live sync changes!']
    );

    await query.run(
      'INSERT INTO notifications (user_id, project_id, task_id, type, message) VALUES (?, ?, ?, ?, ?)',
      [seededUsers[1].id, seededProjects[0].id, seededTasks[1].id, 'task_assigned', 'You have been assigned to task: Add WebSockets live board updates']
    );

    console.log('Database seeding finished successfully.');
  }
}

module.exports = {
  db,
  query,
  initDB
};
