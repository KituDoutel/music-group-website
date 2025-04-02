const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middlewares/auth');
const { query } = require('../config/database');

// Middleware cek subscription
const checkSubscription = async (req, res, next) => {
  if (req.user) {
    const [sub] = await query(
      'SELECT plan FROM subscriptions WHERE user_id = ? AND payment_status = "active" AND end_date > NOW()',
      [req.user.id]
    );
    req.user.plan = sub ? sub.plan : 'free';
  } else {
    req.user = { plan: 'free' };
  }
  next();
};

// Endpoint streaming
router.get('/:id', auth, checkSubscription, async (req, res) => {
  const trackId = req.params.id;
  const [track] = await query('SELECT * FROM tracks WHERE id = ?', [trackId]);
  
  if (!track) return res.status(404).send('Track not found');

  // Logika untuk free tier (hanya 30 detik pertama)
  const isPreview = req.user.plan === 'free';
  const filePath = path.join(__dirname, '../uploads', track.file_path);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  
  let start = 0;
  let end = fileSize - 1;
  
  if (isPreview) {
    end = Math.min(30 * 1000, fileSize - 1); // 30 detik pertama
  }

  // Header untuk partial content
  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': 'audio/mpeg'
  });

  // Stream file
  const stream = fs.createReadStream(filePath, { start, end });
  stream.pipe(res);

  // Log play history
  if (req.user.id) {
    await query(
      'INSERT INTO play_history (user_id, track_id, play_duration) VALUES (?, ?, ?)',
      [req.user.id, trackId, isPreview ? 30 : track.duration]
    );
  }
});