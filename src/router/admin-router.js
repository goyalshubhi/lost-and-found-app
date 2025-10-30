'use strict';

import express from 'express';
import Admin from '../model/admin.js';
import Item from '../model/items.js';
import Account from '../model/account.js';
import logger from '../lib/logger.js';

const router = express.Router();

/**
 * ✅ GET all items (for dashboard view)
 * Route: GET /api/admin/items
 */
router.get('/api/admin/items', async (req, res) => {
  try {
    const items = await Item.find().populate('accountId', 'username email');
    return res.status(200).json(items);
  } catch (err) {
    console.error('❌ Error fetching items for admin:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * ✅ UPDATE item approval status
 * Route: PUT /api/admin/items/:id/approve
 * Body: { approved: true/false }
 */
router.put('/api/admin/items/:id/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );

    if (!item) return res.status(404).json({ error: 'Item not found' });

    return res.status(200).json({
      message: `Item ${approved ? 'approved' : 'rejected'} successfully`,
      item,
    });
  } catch (err) {
    console.error('❌ Error approving item:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * ✅ DELETE item (remove inappropriate or duplicate)
 * Route: DELETE /api/admin/items/:id
 */
router.delete('/api/admin/items/:id', async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting item:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * ✅ GET simple dashboard stats
 * Route: GET /api/admin/stats
 */
router.get('/api/admin/stats', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const totalUsers = await Account.countDocuments();
    const approvedItems = await Item.countDocuments({ approved: true });
    const pendingItems = await Item.countDocuments({ approved: false });

    return res.status(200).json({
      totalUsers,
      totalItems,
      approvedItems,
      pendingItems,
    });
  } catch (err) {
    console.error('❌ Error fetching stats:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
