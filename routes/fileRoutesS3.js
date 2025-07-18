const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const fileController = require("../controllers/fileControllerS3");

const router = express.Router();

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/download/:key", fileController.downloadFile);
router.delete("/file/:key", fileController.deleteFile);

module.exports = router;
