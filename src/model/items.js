'use strict';

import mongoose from 'mongoose';
import itemPreHook from '../lib/twilio.js';

const itemsSchema = new mongoose.Schema(
  {
    postType: {
      type: String,
      required: [true, 'Post type is required'], // e.g. Lost / Found / anything
      trim: true,
    },
    itemType: {
      type: String,
      required: [true, 'Item type is required'], // any string accepted
      trim: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'locations',
      required: false,
    },
    color: { type: String, trim: true },
    material: { type: String, trim: true },
    imageUrl: { type: String },
    imageFileName: { type: String },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'accounts',
      required: [true, 'Account ID is required'],
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Pre-save Twilio hook
itemsSchema.pre('save', itemPreHook);

const Item = mongoose.model('items', itemsSchema);
export default Item;
