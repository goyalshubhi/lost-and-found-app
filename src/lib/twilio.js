'use strict';

import twilio from 'twilio';

// ✅ Ensure all Twilio credentials exist
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error('❌ Missing Twilio environment variables.');
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * ✅ Send an SMS using Twilio
 * @param {Object} params
 * @param {string} params.to - The recipient phone number (in +countrycode format)
 * @param {string} params.message - The message body
 * @returns {Promise<string|null>} - The message SID or null if failed
 */
export const sendSMS = async ({ to, message }) => {
  if (!to || !message) {
    console.error('❌ Missing parameters for sendSMS:', { to, message });
    return null;
  }

  try {
    const msg = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`✅ SMS sent successfully to ${to}`);
    console.log(`📨 Twilio Message SID: ${msg.sid}`);
    return msg.sid;
  } catch (err) {
    console.error('❌ Twilio SMS Error:', err.message);
    if (err.code) console.error('🔍 Twilio Error Code:', err.code);
    return null;
  }
};

export default sendSMS;
