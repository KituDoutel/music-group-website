const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { query } = require('../config/database');

// Middleware untuk memeriksa artist role
const isArtist = async (req, res, next) => {
  if (req.user.role !== 'artist') {
    return res.status(403).json({ error: 'Artist access only' });
  }
  next();
};

// Get artist stats
router.get('/stats', auth, isArtist, async (req, res) => {
  try {
    const [stats] = await query(`
      SELECT 
        COUNT(t.id) as total_tracks,
        SUM(t.stream_count) as total_streams,
        SUM(ph.play_duration) as total_minutes,
        COUNT(DISTINCT ph.user_id) as unique_listeners
      FROM tracks t
      LEFT JOIN play_history ph ON t.id = ph.track_id
      WHERE t.artist_id = ?
    `, [req.user.id]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get earnings (royalty)
router.get('/earnings', auth, isArtist, async (req, res) => {
  try {
    const [earnings] = await query(`
      SELECT 
        SUM(
          CASE 
            WHEN s.plan = 'free' THEN 0.001
            WHEN s.plan = 'premium' THEN 0.005
            WHEN s.plan = 'pro' THEN 0.01
          END * ph.play_duration / 60
        ) as total_earnings
      FROM play_history ph
      JOIN tracks t ON ph.track_id = t.id
      LEFT JOIN subscriptions s ON ph.user_id = s.user_id 
        AND s.payment_status = 'active' 
        AND s.end_date > NOW()
      WHERE t.artist_id = ?
    `, [req.user.id]);

    res.json(earnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});