const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/bulk/' });

// Bulk import tracks
router.post('/import-tracks', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  const filePath = path.join(__dirname, '../../../', req.file.path);

  try {
    // Process CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Validate and import
    for (const [index, row] of results.entries()) {
      try {
        // Validate required fields
        if (!row.title || !row.artist_id || !row.genre) {
          throw new Error('Missing required fields');
        }

        await query(`
          INSERT INTO tracks (
            title, artist_id, genre, release_date, duration
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          row.title,
          row.artist_id,
          row.genre,
          row.release_date || new Date().toISOString().split('T')[0],
          parseInt(row.duration) || 0
        ]);
      } catch (err) {
        errors.push({
          row: index + 1,
          error: err.message,
          data: row
        });
      }
    }

    res.json({
      message: `Imported ${results.length - errors.length} tracks successfully`,
      errors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Clean up file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// Bulk email users
router.post('/send-email', async (req, res) => {
  const { subject, message, userGroup } = req.body;

  try {
    let where = '';
    const params = [];

    if (userGroup === 'artists') {
      where = 'WHERE role = "artist"';
    } else if (userGroup === 'subscribers') {
      where = 'WHERE id IN (SELECT user_id FROM subscriptions WHERE payment_status = "active")';
    }

    const users = await query(`
      SELECT email FROM users
      ${where}
    `, params);

    // Send emails (implement with your email service)
    const emails = users.map(user => user.email);
    await sendBulkEmail(emails, subject, message);

    res.json({
      message: `Email sent to ${users.length} users`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;