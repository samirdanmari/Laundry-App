const express = require('express');
const db = require('../db');
const router = express.Router();

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


  // Sales report
  router.post('/sales-report', (req, res) => {
  const { startDate, endDate, reportType } = req.body;

  db.all(`
    SELECT * FROM orders
    WHERE date BETWEEN ? AND ?
  `, [startDate, endDate], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch report' });

    const paid = rows.filter(o => o.payment_status === 'Paid');
    const unconfirmed = rows.filter(o => o.payment_status === 'Unconfirmed');
    const unpaid = rows.filter(o => o.payment_status === 'Unpaid');

    const totalPaid = paid.reduce((sum, o) => sum + o.total_amount, 0);
    const unconfirmedTotal = unconfirmed.reduce((sum, o) => sum + o.total_amount, 0);
    const unpaidTotal = unpaid.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = rows.length;
    const paidCount = paid.length;

    const avgPerDay = totalPaid / ((new Date(endDate) - new Date(startDate)) / 86400000 + 1);

    if (reportType === 'daily') {
      const table = paid.map(o => ({
        room: o.room_number,
        name: o.customer_name,
        amount: o.total_amount
      }));

      return res.json({
        reportType: 'daily',
        startDate,
        endDate,
        totalOrders,
        totalPaid,
        unconfirmedTotal,
        unpaidTotal,
        paidCount,
        avgPerDay,
        table
      });
    }

    // group by date
    const grouped = {};
    paid.forEach(o => {
      grouped[o.date] = (grouped[o.date] || 0) + o.total_amount;
    });

    const table = Object.keys(grouped).map(date => ({
      date,
      amount: grouped[date]
    }));

    res.json({
      reportType: 'range',
      startDate,
      endDate,
      totalOrders,
      totalPaid,
      unconfirmedTotal,
      unpaidTotal,
      paidCount,
      avgPerDay,
      table
    });
  });
});


module.exports = router;
