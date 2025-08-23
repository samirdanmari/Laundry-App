const bcrypt = require('bcrypt');
const db = require('./db');
const defaultRoles = ['SuperAdmin', 'Staff', 'Accountant'];
const defaultPermissions = ['AddOrder', 'EditDeleteOrder', 'ConfirmPayment', 'GenerateSalesReport'];

const seedUser = async (username, plainPassword, role) => {
const hash = await bcrypt.hash(plainPassword, 10);
  db.run(
    `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
    [username, hash, role],
    err => {
      if (err) {
        console.error(`❌ Could not add ${username}:`, err.message);
      } else {
        console.log(`✅ User '${username}' with role '${role}' added.`);
      }
    }
  );
};

// 👇 Call this once to add sample users
(async () => {
  await seedUser('admin', 'admin123', 'SuperAdmin');
  await seedUser('staff1', 'staffpass', 'Staff');
  await seedUser('account1', 'accountpass', 'Accountant');
})();


