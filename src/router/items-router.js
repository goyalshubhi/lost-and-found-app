import express from 'express';
import Item from '../model/items.js';
import Account from '../model/account.js';
import { sendSMS } from '../lib/twilio.js';

const router = express.Router();

router.post('/match-items', async (req, res) => {
  try {
    console.log('🔍 Matching Lost/Found items...');

    const items = await Item.find();

    const lostItems = items.filter(i => i.postType === 'Lost');
    const foundItems = items.filter(i => i.postType === 'Found');

    let matches = [];

    for (const lost of lostItems) {
      for (const found of foundItems) {
        // ✅ Remove optional chaining — use safe checks
        const lostType = lost.itemType ? lost.itemType.toLowerCase() : '';
        const foundType = found.itemType ? found.itemType.toLowerCase() : '';
        const lostColor = lost.color ? lost.color.toLowerCase() : '';
        const foundColor = found.color ? found.color.toLowerCase() : '';

        if (lostType === foundType && lostColor === foundColor) {
          matches.push({ lost, found });

          // ✅ Fetch both users safely
          const user1 = await Account.findById(lost.accountId);
          const user2 = await Account.findById(found.accountId);

          const msg =
            '📢 Lost & Found Match!\n\n' +
            'A match was found for your ' +
            lost.itemType +
            ' (' +
            lost.color +
            ').\nCheck the Lost & Found app to contact the other user.';

          if (user1 && user1.phone) {
            console.log('📱 Sending SMS to Lost user:', user1.phone);
            await sendSMS({ to: user1.phone, message: msg });
          }

          if (user2 && user2.phone) {
            console.log('📱 Sending SMS to Found user:', user2.phone);
            await sendSMS({ to: user2.phone, message: msg });
          }

          console.log('✅ SMS sent for match:', lost.itemType, '(', lost.color, ')');
        }
      }
    }

    if (matches.length === 0) {
      console.log('⚠️ No matches found.');
      return res.json({ message: 'No matches found', matches: [] });
    }

    res.json({
      message: '✅ ' + matches.length + ' match(es) found and SMS sent.',
      matches,
    });
  } catch (err) {
    console.error('❌ Error in match-items route:', err);
    res.status(500).json({ error: 'Failed to process item matching' });
  }
});

export default router;
