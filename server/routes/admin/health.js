const express = require('express');
const router = express.Router();
const { pool } = require('../../../config/database');
const os = require('os');

// System health check
router.get('/status', async (req, res) => {
  try {
    // Database check
    let dbStatus = 'ok';
    try {
      await pool.query('SELECT 1');
    } catch (err) {
      dbStatus = 'error';
    }

    // Disk space check
    const disk = os.platform() === 'win32' ? 'C:' : '/';
    const diskStats = require('node-disk-info').getDiskInfoSync()[0];
    const diskFreePercent = (diskStats.available / diskStats.total) * 100;

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    res.json({
      status: 'healthy',
      components: {
        database: dbStatus,
        disk: {
          total: diskStats.total,
          free: diskStats.available,
          percent_free: diskFreePercent.toFixed(2)
        },
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percent_used: memoryPercent.toFixed(2)
        },
        uptime: process.uptime(),
        load: os.loadavg()
      }
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: err.message 
    });
  }
});

// Recent errors
router.get('/errors', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const errors = await query(`
      SELECT *
      FROM system_errors
      ORDER BY created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json(errors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;