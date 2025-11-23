const express = require('express');
const cors = require('cors');
const db = require('./db'); // SQLite connection


const authRoutes = require('./routes/auth'); // Authentication routes
const orderRoutes = require('./routes/orders'); // Order management routess
const userRoutes = require('./routes/roles'); // User management routes
const auditLogRoutes = require('./routes/audit-log'); // Audit log routes

const app = express();
app.use(cors());
app.use(express.json());

// 💡 Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    last_login TEXT,
    session_duration INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`, err => {
  if (err) console.error('Error creating users table:', err.message);
  else console.log('Users table ready.');
});

// reate role table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )
`, err => {
  if (err) console.error('Error creating roles table:', err.message);
  else console.log('Roles table ready.');
});

// Create permissions table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )
`, err => {
  if (err) console.error('Error creating permissions table:', err.message);
  else console.log('Permissions table ready.');
});

//linking user with permission
db.run(`
  CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER,
    role_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(role_id) REFERENCES roles(id)
  )
`, err=>{
  if (err) console.error('Error creating user_roles table:', err.message);
  else console.log('User-Roles table ready.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER,
    permission_id INTEGER,
    FOREIGN KEY(role_id) REFERENCES roles(id),
    FOREIGN KEY(permission_id) REFERENCES permissions(id)
  )
`, err => {
  if (err) console.error('Error creating role_permissions table:', err.message);
  else console.log('Role-Permissions table ready.');
});

// 💡 Create orders table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT,
    customer_name TEXT,
    contact_number TEXT,
    items TEXT, -- stored as JSON string
    total_amount REAL,
    created_by TEXT,
    date TEXT,
    expected_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);


// // Create items table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
)
`);

// Items price tables
db.run(`
CREATE TABLE IF NOT EXISTS item_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER,
  service_type TEXT CHECK(service_type IN ('Wash & Iron', 'Wash Only', 'Iron Only')),
  price REAL NOT NULL,
  FOREIGN KEY (item_id) REFERENCES items(id),
  UNIQUE(item_id, service_type)
)
`);


// Tobe uncommented if the collected feature is not shown in the future
// db.run(`ALTER TABLE orders ADD COLUMN collected INTEGER DEFAULT 0`);
// db.run(`ALTER TABLE orders ADD COLUMN collected_at TEXT`);

// 💡 Create Permission table if not exists
const defaultPermissions = [
  'AddOrder',
  'EditDeleteOrder',
  'ConfirmPayment',
  'GenerateSalesReport'
];

// Create default roles if they don't exist
const defaultRoles = [
  'SuperAdmin',
  'Staff',
  'Accountant'
];
defaultRoles.forEach(role => {
  db.run('INSERT OR IGNORE INTO roles (name) VALUES (?)', [role]);
}, err => {
  if (err) {
    console.error('❌ Error creating default roles:', err.message);
  } else {
    console.log('✅ Default roles created or already exist.');
  }
});

// 💡 Create default permissions if they don't exist
defaultPermissions.forEach(permission => {
  db.run('INSERT OR IGNORE INTO permissions (name) VALUES (?)', [permission]);
},err => {
  if (err) {
    console.error('❌ Error creating default permissions:', err.message);
  } else {
    console.log('✅ Default permissions created or already exist.');
  }
}
);


db.run(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    target_user_id INTEGER,
    action TEXT,
    permission TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(actor_id) REFERENCES users(id),
    FOREIGN KEY(target_user_id) REFERENCES users(id)
  )
`);

// Routes

//login route
app.use('/api', authRoutes);
//orders route
app.use('/api/orders', orderRoutes);
//users route
app.use('/api/roles', userRoutes);

//audit log route
app.use('/api/audit-log', auditLogRoutes);

app.listen(3000, () => {
  console.log('Express server running on http://localhost:3000');
});

