const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { query } = require('../config/database');
const admin = require('../middlewares/admin');

// Middleware admin only
router.use(auth, admin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await query('SELECT id, username, email, role FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage tracks
router.get('/tracks', async (req, res) => {
  try {
    const tracks = await query(`
      SELECT t.*, u.username as artist_name 
      FROM tracks t
      JOIN users u ON t.artist_id = u.id
    `);
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!['user', 'artist', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});