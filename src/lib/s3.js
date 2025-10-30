'use strict';

import fs from 'fs-extra';
import logger from './logger.js';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config(); // ✅ Load environment variables

// ✅ Configure AWS SDK globally
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// ✅ Create S3 instance
const s3 = new AWS.S3();

/**
 * Upload a file to S3
 * @param {string} path - Local file path
 * @param {string} key - File key (S3 object name)
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const s3Upload = async (path, key) => {
  try {
    const uploadOptions = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      ACL: 'public-read',
      Body: fs.createReadStream(path),
    };

    // Perform upload
    const response = await s3.upload(uploadOptions).promise();

    logger.log(logger.INFO, `✅ Uploaded to S3: ${response.Location}`);

    // Remove local file after successful upload
    await fs.remove(path);

    return response.Location;
  } catch (err) {
    logger.log(logger.ERROR, `❌ S3 Upload Error: ${err.message}`);
    // Ensure file is removed even if upload fails
    await fs.remove(path).catch(() => {});
    throw err;
  }
};

/**
 * Remove a file from S3
 * @param {string} key - File key (S3 object name)
 * @returns {Promise<void>}
 */
export const s3Remove = async (key) => {
  try {
    const removeOptions = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    };

    await s3.deleteObject(removeOptions).promise();
    logger.log(logger.INFO, `🗑️ Removed from S3: ${key}`);
  } catch (err) {
    logger.log(logger.ERROR, `❌ S3 Delete Error: ${err.message}`);
    throw err;
  }
};
