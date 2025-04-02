const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');
const bcrypt = require('bcryptjs');

// Get all users with pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Query utama
    const users = await query(`
      SELECT id, username, email, role, created_at 
      FROM users 
      WHERE username LIKE ? OR email LIKE ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [`%${search}%`, `%${search}%`, parseInt(limit), parseInt(offset)]);

    // Hitung total
    const [total] = await query(
      'SELECT COUNT(*) as count FROM users WHERE username LIKE ? OR email LIKE ?',
      [`%${search}%`, `%${search}%`]
    );

    res.json({
      data: users,
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

// Update user role
router.put('/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'artist', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    await query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password user
router.post('/:id/reset-password', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ban/unban user
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { banned } = req.body;

  try {
    await query(
      'UPDATE users SET banned = ? WHERE id = ?',
      [banned, id]
    );
    res.json({ 
      message: `User ${banned ? 'banned' : 'unbanned'}` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;