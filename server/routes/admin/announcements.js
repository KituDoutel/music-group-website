const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');

// Create announcement
router.post('/', async (req, res) => {
  const { title, message, target, start_date, end_date } = req.body;
  const adminId = req.user.id;

  try {
    const result = await query(`
      INSERT INTO announcements (
        title, message, target, start_date, end_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [title, message, target, start_date, end_date, adminId]);

    // Broadcast to connected clients via WebSocket if needed
    broadcastAnnouncement({
      id: result.insertId,
      title,
      message,
      target
    });

    res.json({ 
      message: 'Announcement created',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active announcements
router.get('/active', async (req, res) => {
  try {
    const announcements = await query(`
      SELECT * FROM announcements
      WHERE start_date <= NOW() AND end_date >= NOW()
      ORDER BY created_at DESC
    `);

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dismiss announcement for user
router.post('/:id/dismiss', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await query(`
      INSERT INTO dismissed_announcements
      (user_id, announcement_id)
      VALUES (?, ?)
    `, [userId, id]);

    res.json({ message: 'Announcement dismissed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;