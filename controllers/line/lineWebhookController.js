const axios = require("axios");
const LineMessage = require("../../models/LineMessage");
const { saveFile } = require("../../utils/saveFile");
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

exports.handleWebhook = async (req, res) => {
  // console.log("📦 Webhook Payload:", JSON.stringify(req.body, null, 2));

  const events = req.body.events || [];

  for (const event of events) {
    const userId = event.source.userId;
    const replyToken = event.replyToken;
    const messageTimestamp = new Date(event.timestamp);
    const profile = await getUserProfile(userId);

    let newMessage = {
      text: "",
      timestamp: messageTimestamp,
      isRead: false,
      messageType: "",
      sourceFile: "",
      messageSender: "customer"
    };

    // ------------------------------
    // 1) TEXT MESSAGE
    // ------------------------------
    if (event.type === "message" && event.message.type === "text") {
      newMessage.text = event.message.text;
      newMessage.messageType = "text";
    }

    // ------------------------------
    // 2) IMAGE MESSAGE
    // ------------------------------
    else if (event.type === "message" && event.message.type === "image") {
      const messageId = event.message.id;
      const contentBuffer = await getContent(messageId);
      const fileName = `downloaded_${messageId}.jpg`;
      const fullPath = saveFile("image", contentBuffer, fileName);

      newMessage.text = "[image]";
      newMessage.messageType = "image";
      newMessage.sourceFile = fileName;
    }

    // ------------------------------
    // 3) FILE MESSAGE
    // ------------------------------
    else if (event.type === "message" && event.message.type === "file") {
      const messageId = event.message.id;
      const parts = event.message.fileName.split(".");
      const extension = parts.length > 1 ? parts.pop() : "";
      const fileName = `downloaded_${messageId}.${extension}`;
      const contentBuffer = await getContent(messageId);
      const fullPath = saveFile("file", contentBuffer, fileName);

      newMessage.text = event.message.fileName;
      newMessage.messageType = "file";
      newMessage.sourceFile = fileName;
    }

    // ------------------------------
    // 4) บันทึกลง MongoDB
    // ------------------------------
    if (newMessage.messageType) {
      const result = await LineMessage.updateOne(
        { userId },
        {
          $set: {
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage
          },
          $push: {
            messages: newMessage
          }
        }
      );

      if (result.matchedCount === 0) {
        // ยังไม่มี record
        await LineMessage.create({
          userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
          messages: [newMessage]
        });
        // console.log(`🆕 สร้าง record ใหม่ของ ${profile.displayName}`);
      } else {
        // console.log(`✅ เพิ่มข้อความใหม่ของ ${profile.displayName}`);
      }
    }
  }

  res.status(200).send("OK");
};

// ดาวน์โหลดไฟล์
async function getContent(messageId) {
  const response = await axios.get(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
  return response.data;
}

// ดึงโปรไฟล์
async function getUserProfile(userId) {
  const res = await axios.get(
    `https://api.line.me/v2/bot/profile/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
  return res.data;
}

// ตอบกลับ
async function replyMessage(replyToken, text) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text }]
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
