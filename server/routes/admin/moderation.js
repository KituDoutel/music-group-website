const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');

// Get flagged content
router.get('/flags', async (req, res) => {
  try {
    const { status, type } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      where += ' AND content_type = ?';
      params.push(type);
    }

    const flags = await query(`
      SELECT 
        f.*, 
        u1.username as reporter_name,
        u2.username as reviewer_name
      FROM content_flags f
      LEFT JOIN users u1 ON f.reported_by = u1.id
      LEFT JOIN users u2 ON f.reviewed_by = u2.id
      ${where}
      ORDER BY created_at DESC
    `, params);

    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Take moderation action
router.post('/actions', async (req, res) => {
  const { actionType, contentType, contentId, reason } = req.body;
  const moderatorId = req.user.id;

  try {
    // Log action
    await query(`
      INSERT INTO moderation_actions 
      (moderator_id, action_type, content_type, content_id, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [moderatorId, actionType, contentType, contentId, reason]);

    // Update flag status if exists
    if (contentType === 'track' || contentType === 'artist') {
      await query(`
        UPDATE content_flags 
        SET 
          status = 'reviewed',
          reviewed_by = ?,
          reviewed_at = NOW()
        WHERE 
          content_type = ? 
          AND content_id = ?
          AND status = 'pending'
      `, [moderatorId, contentType, contentId]);
    }

    // Apply action
    switch (actionType) {
      case 'remove':
        if (contentType === 'track') {
          await query('UPDATE tracks SET is_public = FALSE WHERE id = ?', [contentId]);
        } else if (contentType === 'user') {
          await query('UPDATE users SET banned = TRUE WHERE id = ?', [contentId]);
        }
        break;
      case 'ban':
        await query('UPDATE users SET banned = TRUE WHERE id = ?', [contentId]);
        break;
    }

    res.json({ message: 'Action applied successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;