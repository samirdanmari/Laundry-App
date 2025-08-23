const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

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
    res.status(200).json({ role: user.role, username: user.username });
  });
});

router.post('/logout', (req, res) => {
  const { userId, loginTime } = req.body;
  const logoutTime = new Date();
  const duration = Math.floor((logoutTime - new Date(loginTime)) / 1000); // in seconds
  db.run(`UPDATE users SET session_duration = ? WHERE id = ?`, [duration, userId], err => {
    if (err) return res.status(500).json({ message: 'Failed to update session duration' });
    res.json({ message: 'Logout successful' });
  });
});


module.exports = router;

