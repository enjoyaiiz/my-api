const mongoose = require("mongoose");

const lineMessageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    displayName: String,
    pictureUrl: String,
    statusMessage: String,
    messages: [
      {
        text: String,
        timestamp: Date,
        isRead: { type: Boolean, default: false },
        messageType: { type: String, default: "text" },  // ✅ เพิ่ม field
        sourceFile: String,                               // ✅ เพิ่ม field
        messageSender: {                                  // ✅ เพิ่ม field
          type: String,
          enum: ["customer", "admin"],
          default: "customer"
        }
      }
    ]
  },
  {
    timestamps: true,
    collection: "line_messages"
  }
);

// ถ้าอยากกัน userId ซ้ำ ให้เพิ่ม index แทน unique ที่ schema level
lineMessageSchema.index({ userId: 1 });

module.exports = mongoose.model("LineMessage", lineMessageSchema);
