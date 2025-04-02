const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');

// Stats utama
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'artist') AS total_artists,
        (SELECT COUNT(*) FROM tracks) AS total_tracks,
        (SELECT COUNT(*) FROM products) AS total_products,
        (SELECT SUM(total_amount) FROM orders) AS total_revenue,
        (SELECT COUNT(*) FROM subscriptions WHERE payment_status = 'active') AS active_subscriptions
    `);
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Data grafik 30 hari terakhir
router.get('/chart-data', async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(CASE WHEN role = 'user' THEN 1 END) AS new_users,
        COUNT(CASE WHEN role = 'artist' THEN 1 END) AS new_artists,
        COUNT(DISTINCT user_id) AS premium_users,
        SUM(CASE WHEN type = 'digital' THEN 1 ELSE 0 END) AS digital_sales,
        SUM(CASE WHEN type = 'merch' THEN 1 ELSE 0 END) AS merch_sales
      FROM (
        SELECT u.id, u.role, u.created_at, NULL AS type, NULL AS user_id
        FROM users u
        UNION ALL
        SELECT NULL, NULL, o.created_at, p.type, o.user_id
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        UNION ALL
        SELECT NULL, NULL, s.start_date, NULL, s.user_id
        FROM subscriptions s
        WHERE s.payment_status = 'active'
      ) AS combined_data
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;