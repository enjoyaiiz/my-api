const express = require("express");
const router = express.Router();
const lineWebhookController = require("../../controllers/line/lineWebhookController");

router.post("/", lineWebhookController.handleWebhook);

module.exports = router;
