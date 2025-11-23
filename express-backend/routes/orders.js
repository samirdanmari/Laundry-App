const express = require('express');
const db = require('../db');
const router = express.Router();

// Audit log function to be assigned to actions on any targeted route wanted to keep track of
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

// Adding a new order
// This endpoint allows users to create a new order
router.post('/add', (req, res) => {
  const {
    roomNumber, customerName, contactNumber,
    items, totalAmount, createdBy, date, expectedDate,
    payment_method, payment_status
  } = req.body;

  const itemsJson = JSON.stringify(items);
  db.run(`
    INSERT INTO orders (
      room_number, customer_name, contact_number,
      items, total_amount, created_by, date, expected_date,
      payment_method, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [roomNumber, customerName, contactNumber, itemsJson,
     totalAmount, createdBy, date, expectedDate,
     payment_method, payment_status],
      function (err) {
      if (err) return res.status(500).json({ message: 'Failed to save order' });
      res.status(200).json({ message: 'Order saved', orderId: this.lastID });
      });
});

// Getting all orders
router.get('/all', (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error('❌ Failed to fetch orders:', err.message);
      return res.status(500).json({ message: 'Failed to retrieve orders' });
    }
    res.status(200).json({ orders: rows });
  });
}); 

// item and pricing logic

// Get all items
// router.get('/items', (req, res) => {
//   db.all('SELECT * FROM items', [], (err, rows) => {
//     if (err) return res.status(500).json({ message: 'Failed to fetch items' });
//     res.json(rows);
//   });
// });
// Add or update item with prices
router.post('/items', (req, res) => {
  const { name, prices } = req.body;

  if (!name || typeof prices !== 'object') {
    return res.status(400).json({ message: 'Missing name or prices' });
  }

  // Step 1: Insert item name (or ignore if exists)
  db.run('INSERT INTO items (name) VALUES (?) ON CONFLICT(name) DO NOTHING', [name], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to save item name' });

    // Step 2: Get item ID
    db.get('SELECT id FROM items WHERE name = ?', [name], (err, item) => {
      if (err || !item) return res.status(500).json({ message: 'Failed to retrieve item ID' });

      const itemId = item.id;
      const serviceTypes = ['Wash & Iron', 'Wash Only', 'Iron Only'];

      let completed = 0;
      serviceTypes.forEach(type => {
        const price = prices[type] ?? null;
        if (price === null) {
          completed++;
          return;
        }

        db.run(`
          INSERT INTO item_prices (item_id, service_type, price)
          VALUES (?, ?, ?)
          ON CONFLICT(item_id, service_type) DO UPDATE SET price = excluded.price
        `, [itemId, type, price], err => {
          if (err) console.error(`❌ Failed to save price for ${type}:`, err);
          completed++;
          if (completed === serviceTypes.length) {
            res.json({ message: '✅ Item and prices saved successfully' });
          }
        });
      });
    });
  });
});


// Get all items with prices
router.get('/items', (req, res) => {
  db.all(`
    SELECT items.id, items.name, item_prices.service_type, item_prices.price
    FROM items
    LEFT JOIN item_prices ON items.id = item_prices.item_id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch items' });

    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.name]) {
        grouped[row.name] = { id: row.id, name: row.name, prices: {} };
      }
      grouped[row.name].prices[row.service_type] = row.price;
    });

    res.json(Object.values(grouped));
  });
});


// Delete item
router.delete('/items/:id', (req, res) => {
  db.run('DELETE FROM items WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ message: 'Failed to delete item' });
    res.json({ message: 'Item deleted' });
  });
});

// Get item price map
router.get('/item-price-map', (req, res) => {
  db.all(`
    SELECT items.name AS item, item_prices.service_type, item_prices.price
    FROM items
    JOIN item_prices ON items.id = item_prices.item_id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch item prices' });

    const map = {};
    rows.forEach(row => {
      if (!map[row.item]) map[row.item] = {};
      map[row.item][row.service_type] = row.price;
    });

    res.json(map); // Example: { Shirt: { 'Wash & Iron': 500, 'Wash Only': 300 } }
  });
});


// confirming order complation (COLLECTION)
router.post('/confirm-collected/:id', (req, res) => {
  const id = req.params.id;
  const { actorId } = req.body;

  console.log('Confirming order ID:', id);

  // First, fetch the order to get customer_id
  db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, order) => {
    if (err || !order) {
      console.error('Order fetch error:', err);
      return res.status(500).json({ message: 'Order not found' });
    }

    // Update the order
    db.run(`
      UPDATE orders
      SET collected = 1,
          collected_at = datetime('now')
      WHERE id = ?
    `, [id], function(err) {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Failed to confirm collection' });
      }

      // ✅ Log audit after successful update
      logAudit(actorId, order.customer_id, `Confirmed collection for order #${order.id}`, 'collection');

      res.json({ message: 'Order marked as collected' });
    });
  });
});

// Comfirming an order Payment
router.post('/confirm-payment/:id', (req, res) => {
  const { id } = req.params;
  const { username, deposit_channel } = req.body;

  const timestamp = new Date().toISOString();
db.run(`
  UPDATE orders SET 
    payment_status = 'Paid',
    payment_confirmed_by = ?,
    payment_confirmed_at = ?,
    payment_deposit_channel = ?
  WHERE id = ?
  `, [username, new Date().toISOString(), deposit_channel, id],
  function (err) {
      if (err) return res.status(500).json({ message: 'Failed to confirm payment' });
    });
    res.status(200).json({ 
      message: 'Payment confirmed',
      confirmedAt: timestamp
    });
    logAudit(user.id, order.customer_id, `Confirmed payment for order #${order.id}`, 'payment');
  });


  // Get overdue orders
  router.get('/overdue-orders', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  db.all(`
    SELECT id, customer_name, room_number, expected_date, payment_status
    FROM orders
    WHERE expected_date < ? AND collected = 0
  `, [today], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch overdue orders' });
    res.json(rows);
  });
});



  // edit order
  router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    roomNumber, customerName, contactNumber,
    items, totalAmount, expectedDate, payment_method, payment_status
  } = req.body;

  const itemsJson = JSON.stringify(items);

  db.run(`
    UPDATE orders SET
      room_number = ?, customer_name = ?, contact_number = ?,
      items = ?, total_amount = ?, expected_date = ?,
      payment_method = ?, payment_status = ?
    WHERE id = ?
  `, [
    roomNumber, customerName, contactNumber,
    itemsJson, totalAmount, expectedDate,
    payment_method, payment_status, id
  ], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to update order' });
    res.json({ message: 'Order updated successfully' });
  });
});

// Delete Order
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM orders WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to delete order' });
    res.json({ message: 'Order deleted successfully' });
  });
});

router.post('/sales-report', (req, res) => {
  const { startDate, endDate, reportType, statusFilter } = req.body;

  db.all(`SELECT * FROM orders WHERE date BETWEEN ? AND ?`, [startDate, endDate], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch report' });

    // Apply status filter
    const filtered = statusFilter === 'All'
      ? rows
      : rows.filter(o => o.payment_status === statusFilter);

    const revenue = filtered.filter (o => o.payment_status == 'Paid'||o.payment_status == 'Unpaid'||o.payment_status == 'Unconfirmed')
    const paid = filtered.filter(o => o.payment_status === 'Paid');
    const unconfirmed = filtered.filter(o => o.payment_status === 'Unconfirmed');
    const unpaid = filtered.filter(o => o.payment_status === 'Unpaid');

    const totalRevenue = revenue.reduce((sum, o)=> sum +o.total_amount, 0)
    const totalPaid = paid.reduce((sum, o) => sum + o.total_amount, 0);
    const unconfirmedTotal = unconfirmed.reduce((sum, o) => sum + o.total_amount, 0);
    const unpaidTotal = unpaid.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = filtered.length;
    const paidCount = paid.length;
    const avgPerDay = totalPaid / ((new Date(endDate) - new Date(startDate)) / 86400000 + 1);

    if (reportType === 'daily') {
      const table = filtered.map(o => ({
        room: o.room_number,
        name: o.customer_name,
        amount: o.total_amount,
        payment_status: o.payment_status
      }));

      return res.json({
        reportType: 'daily',
        startDate,
        endDate,
        totalOrders,
        totalRevenue,
        totalPaid,
        unconfirmedTotal,
        unpaidTotal,
        paidCount,
        avgPerDay,
        table
      });
    }

// Range report: group by date
const grouped = {};
filtered.forEach(o => {
  if (!grouped[o.date]) {
    grouped[o.date] = { Paid: 0, Unpaid: 0, Unconfirmed: 0 };
  }
  grouped[o.date][o.payment_status] += o.total_amount;
});

const table = Object.keys(grouped).map(date => {
  const paid = grouped[date].Paid || 0;
  const unpaid = grouped[date].Unpaid || 0;
  const unconfirmed = grouped[date].Unconfirmed || 0;
  return {
    date,
    paid,
    unpaid,
    unconfirmed,
    total: paid + unpaid + unconfirmed
  };
});

res.json({
  reportType: 'range',
  startDate,
  endDate,
  totalOrders,
  totalRevenue,
  totalPaid,
  unconfirmedTotal,
  unpaidTotal,
  paidCount,
  avgPerDay,
  rangeTable: table // ✅ use rangeTable instead of table
});
  });
});

module.exports = router;
