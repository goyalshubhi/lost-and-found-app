'use strict';

import express from 'express';
import multer from 'multer';
import Item from '../model/items.js';
import logger from '../lib/logger.js';
import { s3Upload } from '../lib/s3.js'; // ✅ integrate S3 upload
import fs from 'fs-extra';

const router = express.Router();

// ✅ Multer setup for temporary file uploads
const upload = multer({ dest: 'uploads/' });

// ✅ CREATE item (POST /api/items)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    let imageFileName = null;

    // ✅ Upload to S3 if a file is attached
    if (req.file) {
      const { path, originalname, filename } = req.file;
      const s3Key = `uploads/${Date.now()}_${originalname}`;
      imageUrl = await s3Upload(path, s3Key); // upload to S3
      imageFileName = filename;
    }

    // ✅ Create and save item
    const newItem = new Item({
      ...req.body,
      imageUrl,
      imageFileName,
    });

    await newItem.save();

    logger.log('info', '✅ Item created successfully');
    return res.status(201).json(newItem);
  } catch (err) {
    console.error('❌ Error creating item:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ GET all items (GET /api/items)
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    return res.status(200).json(items);
  } catch (err) {
    console.error('❌ Error fetching items:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ GET single item by ID (GET /api/items/:id)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json(item);
  } catch (err) {
    console.error('❌ Error fetching item:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ UPDATE item (PUT /api/items/:id)
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json(updatedItem);
  } catch (err) {
    console.error('❌ Error updating item:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ DELETE item (DELETE /api/items/:id)
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting item:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
