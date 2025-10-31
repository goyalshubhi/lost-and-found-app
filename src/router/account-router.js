'use strict';

import express from 'express';
import Account from '../model/account.js';
import HttpErrors from 'http-errors';

const router = express.Router();

/**
 * ✅ POST /api/accounts/signup
 * Create a new user account
 */
router.post('/signup', async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, phone, locationId } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      throw new HttpErrors(400, 'Missing required fields');
    }

    const existing = await Account.findOne({ $or: [{ username }, { email }] });
    if (existing) throw new HttpErrors(409, 'Username or email already exists');

    const account = await Account.createAccount({
      username,
      password,
      email,
      firstName,
      lastName,
      phone,
      locationId,
    });

    const token = await account.createToken();

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      account,
    });
  } catch (err) {
    console.error('❌ Signup Error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
