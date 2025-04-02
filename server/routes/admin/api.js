const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');
const crypto = require('crypto');

// Generate new API key
router.post('/keys', async (req, res) => {
  const { name, scopes, expires_in } = req.body;
  const adminId = req.user.id;

  try {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiSecret = crypto.randomBytes(64).toString('hex');

    await query(`
      INSERT INTO api_keys (
        name, api_key, api_secret, scopes, expires_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      name,
      apiKey,
      crypto.createHash('sha256').update(apiSecret).digest('hex'),
      scopes.join(','),
      expires_in ? new Date(Date.now() + expires_in * 1000) : null,
      adminId
    ]);

    res.json({
      api_key: apiKey,
      api_secret: apiSecret, // Only shown once!
      expires_at: expires_in ? new Date(Date.now() + expires_in * 1000) : 'Never'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revoke API key
router.delete('/keys/:id', async (req, res) => {
  try {
    await query(`
      UPDATE api_keys
      SET revoked = TRUE, revoked_at = NOW(), revoked_by = ?
      WHERE id = ?
    `, [req.user.id, req.params.id]);

    res.json({ message: 'API key revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API usage analytics
router.get('/analytics', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await query(`
      SELECT 
        api_key_id,
        COUNT(*) as requests,
        COUNT(DISTINCT ip_address) as unique_ips,
        MIN(timestamp) as first_request,
        MAX(timestamp) as last_request
      FROM api_logs
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY api_key_id
      ORDER BY requests DESC
    `, [days]);

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;