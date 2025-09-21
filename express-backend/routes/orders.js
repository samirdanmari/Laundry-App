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


// confirming order complation (COLLECTION)
router.post('/confirm-collected/:id', (req, res) => {
  const id = req.params.id;
  const { actorId } = req.body; // ✅ Pass actorId from frontend

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

// router.post('/confirm-collected/:id', (req, res) => {
//   const id = req.params.id;
//   // const { actorId } = req.body; // ✅ Pass actorId from frontend
//   console.log('Confirming order ID:', id);

//   // First, fetch the order to get customer_id
//   db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, order) => {
//     if (err || !order) {
//       console.error('Order fetch error:', err);
//       return res.status(500).json({ message: 'Order not found' });
//     }

//     // Update the order
//     db.run(`
//       UPDATE orders
//       SET collected = 1,
//           collected_at = datetime('now')
//       WHERE id = ?
//     `, [id], function(err) {
//       if (err) {
//         console.error('DB error:', err);
//         return res.status(500).json({ message: 'Failed to confirm collection' });
//       }

//       // ✅ Log audit after successful update
//       logAudit(user.id, order.customerName, `Confirmed collection for order #${order.id}`, 'collection');

//       res.json({ message: 'Order marked as collected' });
//     });
//   });
// });

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
