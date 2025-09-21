const express = require('express');
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

// Get audit logs
router.get('/audit-logs', (req, res) => {
  db.all(`
    SELECT a.*, u1.username AS actor_name, u2.username AS target_name
    FROM audit_logs a
    LEFT JOIN users u1 ON a.actor_id = u1.id
    LEFT JOIN users u2 ON a.target_user_id = u2.id
    ORDER BY a.timestamp DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch audit logs' });
    res.json(rows);
  });
});




module.exports = router;
