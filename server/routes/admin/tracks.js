const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../../uploads/tracks');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Get all tracks with filters
router.get('/', async (req, res) => {
  const { artist, genre, sort = 'newest', page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (artist) {
      whereClause += ' AND u.username LIKE ?';
      params.push(`%${artist}%`);
    }

    if (genre) {
      whereClause += ' AND t.genre = ?';
      params.push(genre);
    }

    const orderBy = sort === 'popular' 
      ? 't.stream_count DESC' 
      : 't.release_date DESC';

    const tracks = await query(`
      SELECT 
        t.id, t.title, t.duration, t.genre, t.release_date, 
        t.stream_count, t.file_path, t.cover_image,
        u.id as artist_id, u.username as artist_name
      FROM tracks t
      JOIN users u ON t.artist_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [total] = await query(`
      SELECT COUNT(*) as count 
      FROM tracks t
      JOIN users u ON t.artist_id = u.id
      ${whereClause}
    `, params);

    res.json({
      data: tracks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload track baru
router.post('/', upload.single('track'), async (req, res) => {
  const { title, artistId, genre, releaseDate } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Audio file is required' });
  }

  try {
    // Validasi artist
    const [artist] = await query(
      'SELECT id FROM users WHERE id = ? AND role = "artist"',
      [artistId]
    );
    
    if (!artist) {
      // Hapus file yang sudah diupload jika validasi gagal
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid artist ID' });
    }

    await query(`
      INSERT INTO tracks (
        title, artist_id, duration, genre, 
        release_date, file_path
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      title,
      artistId,
      Math.floor(req.file.duration) || 0, // Jika bisa dapat duration dari file
      genre,
      releaseDate,
      `tracks/${req.file.filename}`
    ]);

    res.json({ message: 'Track uploaded successfully' });
  } catch (err) {
    // Hapus file jika error
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// Update track metadata
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, genre, releaseDate } = req.body;

  try {
    await query(`
      UPDATE tracks 
      SET title = ?, genre = ?, release_date = ?
      WHERE id = ?
    `, [title, genre, releaseDate, id]);
    
    res.json({ message: 'Track updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete track
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Dapatkan path file untuk dihapus
    const [track] = await query(
      'SELECT file_path FROM tracks WHERE id = ?',
      [id]
    );

    if (track) {
      const filePath = path.join(__dirname, '../../../uploads', track.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await query('DELETE FROM tracks WHERE id = ?', [id]);
    res.json({ message: 'Track deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;