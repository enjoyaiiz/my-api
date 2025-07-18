const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// ไม่ต้องใส่ credentials ถ้ารันบน EC2/Lambda ที่มี IAM Role แล้ว
const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const BUCKET = process.env.AWS_S3_BUCKET || "your-bucket-name";

// Upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const key = Date.now() + "_" + req.file.originalname;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    res.json({ success: true, key });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Upload failed" });
  }
};

// Download (presigned url)
exports.downloadFile = async (req, res) => {
  try {
    const { key } = req.params;
    if (!key) return res.status(400).json({ message: "No file key provided" });

    const params = { Bucket: BUCKET, Key: key };
    const url = await getSignedUrl(s3, new GetObjectCommand(params), { expiresIn: 600 }); // 10 min
    res.json({ url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Get download url failed" });
  }
};

// Delete
exports.deleteFile = async (req, res) => {
  try {
    const { key } = req.params;
    if (!key) return res.status(400).json({ message: "No file key provided" });

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Delete failed" });
  }
};
