'use strict';

import mongoose from 'mongoose';

// ✅ Define schema
const accountSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String },
}, { timestamps: true });

// ✅ Register model correctly (model name 'Account', collection name 'accounts')
const Account = mongoose.model('Account', accountSchema, 'accounts');

export default Account;
