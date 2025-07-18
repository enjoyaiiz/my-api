const express = require("express");
const router = express.Router();
const lineWebhookController = require("../../controllers/line/lineWebhookController_v1");

router.post("/", lineWebhookController.handleWebhook);

module.exports = router;
