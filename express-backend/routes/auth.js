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

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });

       const loginTime = new Date().toISOString();

       db.run(`UPDATE users SET last_login = ?, session_duration = ? WHERE id = ?`, [
      loginTime,
      0, // Start with 0, update later if needed
      user.id
    ]);
    logAudit(user.id, user.id, 'User logged in', 'login');
    res.status(200).json({ role: user.role, username: user.username });
  });
});

router.post('/logout', (req, res) => {
  const { user, loginTime } = req.body;

  if (!user || !user.id) {
    return res.status(400).json({ message: 'Invalid user data' });
  }

  const logoutTime = new Date();
  const duration = Math.floor((logoutTime - new Date(loginTime)) / 1000); // in seconds

  db.run(`UPDATE users SET session_duration = ? WHERE id = ?`, [duration, user.id], err => {
    if (err) return res.status(500).json({ message: 'Failed to update session duration' });

    logAudit(user.id, user.id, 'User logged out', 'logout');
    res.json({ message: 'Logout successful' });
  });
});

module.exports = router;





