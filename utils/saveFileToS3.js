// utils/saveFileToS3.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-southeast-1" });
const BUCKET = process.env.AWS_S3_BUCKET || "your-bucket-name";

async function saveFileToS3(buffer, key, mimetype) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));
  // จะได้ url แบบนี้ (ถ้า bucket private = ต้องใช้ signed url ตอนดึง)
  return `s3://${BUCKET}/${key}`;
}

module.exports = { saveFileToS3 };
