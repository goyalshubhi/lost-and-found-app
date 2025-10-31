// src/router/twilio-router.js
router.get('/test', (req, res) => {
  res.json({ message: 'Twilio router working ✅' });
});
'use strict';

import express from 'express';
import Item from '../model/items.js';
import Account from '../model/account.js'; // ensures model registered
import { sendSMS } from '../lib/twilio.js';

const router = express.Router();

/**
 * Debug route — check items and populated users
 * GET /api/twilio/debug-items
 */
router.get('/debug-items', async (req, res) => {
  try {
    const items = await Item.find().populate('accountId', 'username phone email firstName lastName');
    res.json({
      count: items.length,
      items,
    });
  } catch (err) {
    console.error('❌ Error fetching items:', err.message);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * Notify route — send SMS to the owner of the lost item when a match occurs
 * POST /api/twilio/notify
 * body: { foundItemId, lostItemId }
 */
router.post('/notify', async (req, res) => {
  try {
    const { foundItemId, lostItemId } = req.body;
    if (!foundItemId || !lostItemId) {
      return res.status(400).json({ message: 'Missing foundItemId or lostItemId' });
    }

    const foundItem = await Item.findById(foundItemId).populate('accountId', 'phone firstName lastName username');
    const lostItem = await Item.findById(lostItemId).populate('account', 'phone firstName lastName username');

    if (!foundItem || !lostItem) {
      return res.status(404).json({
        message: 'One or both items not found in DB',
        foundItemExists: !!foundItem,
        lostItemExists: !!lostItem,
      });
    }

    // Validate phone numbers
    const foundPhone = foundItem.userId && foundItem.userId.phone;
    const lostPhone = lostItem.userId && lostItem.userId.phone;

    if (!foundPhone || !lostPhone) {
      return res.status(400).json({
        message: 'Missing phone number for one or both users',
        foundUserPhone: foundPhone || null,
        lostUserPhone: lostPhone || null,
      });
    }

    const message = `📢 Match Found!\nItem: ${foundItem.title}\nFound by: ${foundItem.userId.firstName || foundItem.userId.username}\nContact: ${foundPhone}`;

    const sid = await sendSMS({ to: lostPhone, message });
    if (!sid) return res.status(500).json({ message: 'Failed to send SMS via Twilio' });

    console.log('✅ SMS sent successfully for item match.');
    return res.json({ success: true, sid });
  } catch (err) {
    console.error('❌ Twilio Notify Route Error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
