const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// audit log  function to be assigne to actions on any targeted route wanted to keep track of
function logAudit(actorId, targetUserId, action, permission) {
  db.run(
    `INSERT INTO audit_logs (actor_id, target_user_id, action, permission) VALUES (?, ?, ?, ?)`,
    [actorId, targetUserId, action, permission],
    err => {
      if (err) console.error('❌ Failed to log audit:', err.message);
      else console.log(`📋 Audit logged: ${action} '${permission}' for user ${targetUserId} by ${actorId}`);
    }
  );
}

// add new user
router.post('/add-user', async (req, res) => {
  const { username, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`, 
    [username, hash, role], 
    function (err) {
     if (err) {
        console.error('❌ Failed to insert user:', err.message);
        return res.status(500).json({ message: 'User creation failed' });
      }
    const userId = this.lastID;
    console.log('✅ User inserted with ID:', userId);

    // Check if role exists
    db.get(`SELECT id FROM roles WHERE name = ?`, [role], (err, roleRow) => {
      if (err || !roleRow) {
          console.error(`❌ Role '${role}' not found or error:`, err?.message);
          return res.status(404).json({ message: 'Role not found' });
        }
        console.log(`✅ Role '${role}' found with ID:`, roleRow.id);
      db.run(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleRow.id], err => {
        // if (err) return res.status(500).json({ message: 'Role assignment failed' });
          if (err) {
            console.error('❌ Failed to assign role:', err.message);
            return res.status(500).json({ message: 'Role assignment failed' });
          }
          console.log('✅ Role assigned successfully');
        res.json({ message: 'User created and role assigned', userId });
      });
    });
  });
});

// Get all roles
router.get('/roles', (req, res) => {
  db.all('SELECT * FROM roles', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch roles' });
    res.json(rows);
  });
});

// // Add a new user role assignment
// router.post('/assign-role', (req, res) => {
//   const { user_id, role_name } = req.body;
//   db.get('SELECT id FROM roles WHERE name = ?', [role_name], (err, role) => {
//     if (!role) return res.status(404).json({ message: 'Role not found' });
//     db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user_id, role.id], function (err) {
//       if (err) return res.status(500).json({ message: 'Role assignment failed' });
//       res.json({ message: `Assigned role '${role_name}' to user ${user_id}` });
//     });
//   });
// });

router.get('/users-with-roles', (req, res) => {
  db.all(`
    SELECT users.id, users.username, roles.name AS role, users.last_login, users.session_duration
    FROM users
    LEFT JOIN user_roles ON users.id = user_roles.user_id
    LEFT JOIN roles ON user_roles.role_id = roles.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching users' });
    res.json(rows);
  });
});

// user modal
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  db.get(`
    SELECT users.id, users.username, roles.name AS role
    FROM users
    LEFT JOIN user_roles ON users.id = user_roles.user_id
    LEFT JOIN roles ON user_roles.role_id = roles.id
    WHERE users.id = ?
  `, [userId], (err, user) => {
    if (err || !user) return res.status(404).json({ message: 'User not found' });

    db.all(`
      SELECT permissions.name FROM permissions
      JOIN role_permissions ON permissions.id = role_permissions.permission_id
      JOIN user_roles ON role_permissions.role_id = user_roles.role_id
      WHERE user_roles.user_id = ?
    `, [userId], (err, permissions) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch permissions' });

      res.json({ ...user, permissions: permissions.map(p => p.name) });
    });
  });
});

// Change user role
router.post('/change-role', (req, res) => {
  const { user_id, new_role, actorId } = req.body;

  db.get('SELECT id FROM roles WHERE name = ?', [new_role], (err, role) => {
    if (!role) return res.status(404).json({ message: 'Role not found' });

    db.run('DELETE FROM user_roles WHERE user_id = ?', [user_id], () => {
      db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user_id, role.id], err => {
        if (err) return res.status(500).json({ message: 'Failed to assign new role' });

        logAudit(actorId, user_id, 'change_role', new_role);
        res.json({ message: 'Role updated successfully' });
      });
    });
  });
});

// Assign permission to user
router.post('/assign-permission', (req, res) => {
  const { actor_id, user_id, permission_name } = req.body;

  db.get(`SELECT id FROM permissions WHERE name = ?`, [permission_name], (err, permission) => {
    if (!permission) return res.status(404).json({ message: 'Permission not found' });

    db.run(`INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)`, [user_id, permission.id], err => {
      if (err) return res.status(500).json({ message: 'Failed to assign permission' });

      logAudit(actor_id, user_id, 'assign', permission_name);
      res.json({ message: 'Permission assigned successfully' });
    });
  });
});


// Remove permission from 
router.post('/remove-permission', (req, res) => {
  const { actor_id, user_id, permission_name } = req.body;

  db.get(`SELECT id FROM permissions WHERE name = ?`, [permission_name], (err, permission) => {
    if (!permission) return res.status(404).json({ message: 'Permission not found' });

    db.run(`DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?`, [user_id, permission.id], err => {
      if (err) return res.status(500).json({ message: 'Failed to remove permission' });

      logAudit(actor_id, user_id, 'remove', permission_name);
      res.json({ message: 'Permission removed successfully' });
    });
  });
});

// change password
router.post('/change-password', async (req, res) => {
  const { user_id, new_password } = req.body;
  const hash = await bcrypt.hash(new_password, 10);

  db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user_id], err => {
    if (err) return res.status(500).json({ message: 'Password update failed' });
    res.json({ message: 'Password updated successfully' });
  });
});

// delete User
router.delete('/delete-user/:id', (req, res) => {
  const userId = req.params.id;


  db.run('DELETE FROM users WHERE id = ?', [userId], err => {
    if (err) return res.status(500).json({ message: 'Failed to delete user' });
    res.json({ message: 'User deleted successfully' });
  });
});


module.exports = router;