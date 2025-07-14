const LineMessage = require("../../models/LineMessage");
const axios = require("axios");
// GET: ดึงทั้งหมด
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await LineMessage.find().sort({ updatedAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
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