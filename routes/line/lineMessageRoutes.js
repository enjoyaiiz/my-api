const express = require("express");
const router = express.Router();
const lineMessageController = require("../../controllers/line/lineMessageController");

router.get("/", lineMessageController.getAllMessages);
router.patch("/:id/read", lineMessageController.markAsRead); // ✅ เพิ่ม API mark as read
router.post("/:id/reply", lineMessageController.replyToUser);
router.get("/file/:key", lineMessageController.downloadLineFile);
module.exports = router;
