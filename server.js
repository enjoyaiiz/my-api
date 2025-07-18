const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");
const dotenv = require("dotenv");

// ✅ โหลด env ตาม NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({
  path: path.resolve(__dirname, envFile)
});
console.log(`✅ Loaded environment config from ${envFile}`);

const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const projectsRouter = require('./routes/projectsRoutes');
const lineWebhookRoutes = require("./routes/line/lineWebhook");
const lineMessageRoutes = require("./routes/line/lineMessageRoutes");
const fileRoutes = require("./routes/fileRoutes");
const fileRoutesS3 = require("./routes/fileRoutesS3");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/projects', projectsRouter);
app.use("/api/line-webhook", lineWebhookRoutes);
app.use("/api/line-messages", lineMessageRoutes);
app.use(
  "/downloaded_files",
  express.static(path.join(__dirname, "for_downloaded_file"))
);
app.use("/api/files", fileRoutes);
app.use("/api", fileRoutesS3);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const info = await admin.buildInfo();
    console.log(`✅ Connected to MongoDB version: ${info.version}`);

    app.listen(process.env.PORT, () =>
      console.log(`✅ Server running at http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error(err));
