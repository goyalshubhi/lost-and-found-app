'use strict';

import express from 'express';
import HttpErrors from 'http-errors';
import Account from '../model/account.js';
import basicAuth from '../lib/middleware/basic-auth-middleware.js';

const router = express.Router();

/**
 * ✅ Signup Route
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { username, password, email, firstName, lastName, phone } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      throw new HttpErrors(400, 'Missing required fields');
    }

    const account = await Account.createAccount({
      username,
      password,
      email,
      firstName,
      lastName,
      phone,
    });

    const token = await account.createToken();
    res.status(201).json({ token, account });
  } catch (err) {
    console.error('❌ Signup Error:', err.message);
    next(err);
  }
});

/**
 * ✅ Login Route
 * GET /api/auth/login
 * Uses Basic Auth header (base64 encoded username:password)
 */
router.get('/login', basicAuth, async (req, res, next) => {
  try {
    const token = await req.account.createToken();
    res.status(200).json({ token, account: req.account });
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    next(err);
  }
});

export default router;
