'use strict';

import HttpErrors from 'http-errors';
import jsonWebToken from 'jsonwebtoken';
import Account from '../../model/account.js'; // ✅ fixed path

/**
 * ✅ Bearer Authentication Middleware
 * Checks Authorization header for a valid JWT token.
 * Attaches the verified account to req.user.
 */
export default async function bearerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      throw new HttpErrors(401, 'Authorization header required');

    const token = authHeader.split('Bearer ')[1];
    if (!token) throw new HttpErrors(401, 'Invalid Authorization header format');

    let tokenData;
    try {
      tokenData = jsonWebToken.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new HttpErrors(401, 'Invalid or expired token');
    }

    const account = await Account.findOne({ tokenSeed: tokenData.tokenSeed });
    if (!account) throw new HttpErrors(401, 'Invalid account');

    req.user = account; // ✅ store logged-in user
    return next();
  } catch (err) {
    console.error('❌ Bearer Auth Error:', err.message);
    return res.status(err.status || 401).json({ error: err.message });
  }
}
