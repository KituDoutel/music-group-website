const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const auth = require('../middlewares/auth');

// Create new event booking
router.post('/', auth, async (req, res) => {
  const { event_name, event_date, event_type, attendees, special_requests } = req.body;
  const userId = req.user.id;

  try {
    const sql = `
      INSERT INTO events 
      (user_id, event_name, event_date, event_type, attendees, special_requests)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      userId, event_name, event_date, event_type, attendees, special_requests
    ]);
    
    // Kirim email notifikasi
    await sendBookingEmail(userId, result.insertId);
    
    res.status(201).json({ 
      message: 'Booking submitted successfully',
      bookingId: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function untuk mengirim email
async function sendBookingEmail(userId, bookingId) {
  // Implementasi email menggunakan Nodemailer
  // ...
}

module.exports = router;