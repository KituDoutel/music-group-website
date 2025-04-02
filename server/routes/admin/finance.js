const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');

// Get revenue reports
router.get('/revenue', async (req, res) => {
  try {
    const { period = 'monthly', year } = req.query;

    let dateFormat, groupBy;
    if (period === 'daily') {
      dateFormat = '%Y-%m-%d';
      groupBy = 'DATE(created_at)';
    } else if (period === 'monthly') {
      dateFormat = '%Y-%m';
      groupBy = 'YEAR(created_at), MONTH(created_at)';
    } else {
      dateFormat = '%Y';
      groupBy = 'YEAR(created_at)';
    }

    const revenue = await query(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        SUM(total_amount) as revenue,
        COUNT(*) as transactions
      FROM orders
      ${year ? 'WHERE YEAR(created_at) = ?' : ''}
      GROUP BY ${groupBy}
      ORDER BY period
    `, year ? [dateFormat, year] : [dateFormat]);

    res.json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get artist payouts
router.get('/payouts', async (req, res) => {
  try {
    const { status, artist } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND p.status = ?';
      params.push(status);
    }

    if (artist) {
      where += ' AND u.username LIKE ?';
      params.push(`%${artist}%`);
    }

    const payouts = await query(`
      SELECT 
        p.*,
        u.username as artist_name,
        u.email as artist_email
      FROM payouts p
      JOIN users u ON p.artist_id = u.id
      ${where}
      ORDER BY p.request_date DESC
    `, params);

    res.json(payouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process payout
router.post('/payouts/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    await query(`
      UPDATE payouts 
      SET 
        status = 'processed',
        processed_by = ?,
        processed_at = NOW()
      WHERE id = ?
    `, [adminId, id]);

    res.json({ message: 'Payout processed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;