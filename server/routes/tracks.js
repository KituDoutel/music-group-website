const express = require('express');
const router = express.Router();
const Track = require('../models/Track');
const auth = require('../middlewares/auth');

// Get all tracks
router.get('/', async (req, res) => {
  try {
    const tracks = await Track.getAll();
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single track
router.get('/:id', async (req, res) => {
  try {
    const track = await Track.getById(req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    
    // Log stream (jika diputar)
    if (req.query.stream === 'true') {
      await Track.incrementStream(req.params.id);
    }
    
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;