import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    // Whether it's a lost or found item
    postType: {
      type: String,
      enum: ['Lost', 'Found'],
      required: true,
    },

    // Type of item, e.g., wallet, phone, bag
    itemType: { type: String, required: true },

    // Optional fields for details
    color: String,
    material: String,
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location', // optional if you have a Location model
    },

    // Image data
    imageUrl: String,
    imageFileName: String,

    // 🔗 Link to the Account who posted it
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',  // ✅ Matches your Account model name
      required: true,
    },

    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Register model (collection name = 'items')
const Item = mongoose.model('Item', itemSchema, 'items');

export default Item;
