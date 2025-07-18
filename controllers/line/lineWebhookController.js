const axios = require("axios");
const LineMessage = require("../../models/LineMessage");
const { saveFileToS3 } = require("../../utils/saveFileToS3");
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

exports.handleWebhook = async (req, res) => {
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

    // ----- TEXT -----
    if (event.type === "message" && event.message.type === "text") {
      newMessage.text = event.message.text;
      newMessage.messageType = "text";
    }

    // ----- IMAGE -----
    else if (event.type === "message" && event.message.type === "image") {
      const messageId = event.message.id;
      const contentBuffer = await getContent(messageId);
      const fileName = `images/downloaded_${messageId}.jpg`;
      await saveFileToS3(contentBuffer, fileName, "image/jpeg");

      newMessage.text = "[image]";
      newMessage.messageType = "image";
      newMessage.sourceFile = fileName;
    }

    // ----- FILE -----
    else if (event.type === "message" && event.message.type === "file") {
      const messageId = event.message.id;
      const parts = event.message.fileName.split(".");
      const extension = parts.length > 1 ? parts.pop() : "";
      const fileName = `files/downloaded_${messageId}.${extension}`;
      const contentBuffer = await getContent(messageId);
      await saveFileToS3(contentBuffer, fileName, event.message.fileName.mimetype || "application/octet-stream");

      newMessage.text = event.message.fileName;
      newMessage.messageType = "file";
      newMessage.sourceFile = fileName;
    }

    // ----- SAVE TO MONGODB -----
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
        await LineMessage.create({
          userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
          messages: [newMessage]
        });
      }
    }
  }
  res.status(200).send("OK");
};

// --- helper สำหรับดาวน์โหลดไฟล์ LINE ---
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
