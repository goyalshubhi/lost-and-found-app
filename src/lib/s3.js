import fs from 'fs-extra';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const s3Upload = async (path, key) => {
  const uploadOptions = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    Body: fs.createReadStream(path),
    ContentType: 'image/jpeg', // optional, helps browser preview
  };

  try {
    const data = await s3.upload(uploadOptions).promise();
    await fs.remove(path);

    // Construct a public URL (for buckets with ACLs disabled)
    const imageUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return imageUrl;
  } catch (err) {
    console.error('❌ S3 Upload Error:', err.message);
    await fs.remove(path);
    throw err;
  }
};

export const s3Remove = async (key) => {
  const params = { Bucket: process.env.AWS_BUCKET, Key: key };
  return s3.deleteObject(params).promise();
};
