const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// GET /api/files/:type/:filename
router.get("/:type/:filename", (req, res) => {
  const { type, filename } = req.params;

  let folder;
  if (type === "images") {
    folder = path.join(__dirname, "../downloaded_files/images");
  } else if (type === "files") {
    folder = path.join(__dirname, "../downloaded_files/files");
  } else {
    return res.status(400).send("Invalid type.");
  }

  const filePath = path.join(folder, filename);
//   console.log("File path: " + filePath)
  // ตรวจสอบว่ามีไฟล์
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found.");
  }

  // ถ้าเป็นภาพ แสดงเลย
  if (type === "images") {
    res.sendFile(filePath);
  } else {
    // ไฟล์อื่น ให้ดาวน์โหลด
    res.download(filePath, filename);
  }
});

module.exports = router;
