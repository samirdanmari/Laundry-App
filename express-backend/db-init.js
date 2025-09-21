const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('laundry.db');

const upgrades = [
  { column: 'payment_status', type: "TEXT DEFAULT 'Unpaid'" },
  { column: 'payment_confirmed_at', type: 'TEXT' },
  { column: 'payment_confirmed_by', type: 'TEXT' },
  { column: 'payment_deposit_channel', type: 'TEXT' }
];

db.serialize(() => {
  db.get("PRAGMA table_info(orders)", (err, row) => {
    if (err) throw err;

    upgrades.forEach(({ column, type }) => {
      db.get(`PRAGMA table_info(orders)`, (err, res) => {
        db.all(`PRAGMA table_info(orders)`, (err, columns) => {
          const exists = columns.some(col => col.name === column);
          if (!exists) {
            db.run(`ALTER TABLE orders ADD COLUMN ${column} ${type}`);
            console.log(`✅ Added column '${column}'`);
          } else {
            console.log(`✅ Column '${column}' already exists`);
          }
        });
      });
    });
  });
});



