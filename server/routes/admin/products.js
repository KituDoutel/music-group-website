const express = require('express');
const router = express.Router();
const { query } = require('../../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup upload untuk product image
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../../uploads/products');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all products
router.get('/', async (req, res) => {
  const { type, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClause = '';
    const params = [];

    if (type) {
      whereClause = 'WHERE type = ?';
      params.push(type);
    }

    const products = await query(`
      SELECT * FROM products
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [total] = await query(`
      SELECT COUNT(*) as count FROM products
      ${whereClause}
    `, params);

    res.json({
      data: products,
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

// Add new product
router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, price, type, stock } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Product image is required' });
  }

  try {
    await query(`
      INSERT INTO products (
        name, description, price, type, 
        stock, image_url
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      name,
      description,
      parseFloat(price),
      type,
      parseInt(stock),
      `products/${req.file.filename}`
    ]);

    res.json({ message: 'Product added successfully' });
  } catch (err) {
    // Hapus file jika error
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, type, stock } = req.body;

  try {
    // Jika ada file gambar baru
    if (req.file) {
      // Dapatkan gambar lama untuk dihapus
      const [product] = await query(
        'SELECT image_url FROM products WHERE id = ?',
        [id]
      );

      if (product) {
        const oldImagePath = path.join(
          __dirname, '../../../uploads', product.image_url
        );
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      await query(`
        UPDATE products 
        SET 
          name = ?, 
          description = ?, 
          price = ?, 
          type = ?, 
          stock = ?,
          image_url = ?
        WHERE id = ?
      `, [
        name,
        description,
        parseFloat(price),
        type,
        parseInt(stock),
        `products/${req.file.filename}`,
        id
      ]);
    } else {
      await query(`
        UPDATE products 
        SET 
          name = ?, 
          description = ?, 
          price = ?, 
          type = ?, 
          stock = ?
        WHERE id = ?
      `, [
        name,
        description,
        parseFloat(price),
        type,
        parseInt(stock),
        id
      ]);
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    // Hapus file jika error
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;