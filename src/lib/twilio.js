import Item from '../model/items.js';
import Account from '../model/account.js';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendMessage(phoneNum, imageUrl) {
  try {
    const message = await client.messages.create({
      body: 'Is this your lost item??',
      from: process.env.TWILIO_NUM,
      mediaUrl: imageUrl ? [imageUrl] : [],
      to: `+${phoneNum}`,
    });
    return message.sid;
  } catch (err) {
    console.error('❌ Error sending Twilio message:', err.message);
  }
}

// ✅ Proper pre-save hook using normal function syntax (not arrow)
async function itemPreHook(next) {
  try {
    const items = await Item.find({});
    if (!items.length) return next();

    for (let i = 0; i < items.length; i++) {
      const oldItem = items[i];

      // only send if postType is opposite (Lost vs Found) and same itemType
      if (oldItem.postType !== this.postType && oldItem.itemType === this.itemType) {
        const account = await Account.findById(oldItem.accountId);
        if (account && account.phoneNumber) {
          await sendMessage(account.phoneNumber, this.imageUrl);
        }
      }
    }

    next();
  } catch (err) {
    console.error('❌ itemPreHook error:', err.message);
    next(err);
  }
}

export default itemPreHook;
