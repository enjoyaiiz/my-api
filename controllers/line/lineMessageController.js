const LineMessage = require("../../models/LineMessage");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const axios = require("axios");
const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-southeast-1" });
const BUCKET = process.env.AWS_S3_BUCKET;
// GET: ดึงทุก message และคืน fileUrl
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await LineMessage.find().sort({ updatedAt: -1 }).lean();

    // base URL จาก request (เช่น https://your-domain.com)
    const baseUrl = req.protocol + "://" + req.get("host");

    const data = messages.map(user => ({
      ...user,
      messages: user.messages.map(msg => ({
        ...msg,
        fileUrl: msg.sourceFile
          ? `${baseUrl}/api/line-messages/file/${encodeURIComponent(msg.sourceFile)}`
          : undefined
          
      }))
    }));

    console.log(data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// GET: download file from S3 via backend
exports.downloadLineFile = async (req, res) => {
  try {
    const key = req.params.key;
    if (!key) return res.status(400).json({ message: "No key provided" });

    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const s3res = await s3.send(command);

    // บังคับให้ดาวน์โหลดไฟล์ (หรือจะแก้ Content-Type ก็ได้)
    res.setHeader('Content-Type', s3res.ContentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${key.split('/').pop()}"`);
    s3res.Body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "ไม่พบไฟล์หรือเกิดข้อผิดพลาด" });
  }
};

// PATCH: Mark ทุกข้อความใน record เป็นอ่านแล้ว
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await LineMessage.updateOne(
      { _id: id },
      { $set: { "messages.$[].isRead": true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "ไม่พบรายการนี้" });
    }

    res.json({ message: "อัปเดตเรียบร้อย" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดต" });
  }
};

exports.replyToUser = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const doc = await LineMessage.findById(id);
    if (!doc) return res.status(404).json({ error: "ไม่พบข้อมูลผู้ใช้" });

    const userId = doc.userId;

    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: userId,
        messages: [{ type: "text", text }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการส่งข้อความ" });
  }
};