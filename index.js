// Installed Packages imports
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import { Server } from "socket.io";
import cors from "cors";

// Local modules imports
import connectDB from "./src/config/db.js";
import socketHandler from "./src/utils/socketHandler.js";

//Routes imports
import userRoutes from "./src/routes/user.routes.js";
import periodRoutes from "./src/routes/period.routes.js";
import topicRoutes from "./src/routes/topic.routes.js";
import articleRoutes from "./src/routes/article.routes.js";
import taskRoutes from "./src/routes/task.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import { errorHandler, notFound } from "./src/middlewares/error.middleware.js";
import { generateIdHash } from "./src/services/notification.service.js";
import { protect } from "./src/middlewares/auth.middleware.js";
import {
  scheduleFeedNotifications,
  scheduleTaskNotifications,
} from "./src/services/schedule.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "/src", "/static")));

app.get("/", (req, res) => {
  res.send("Hello World!!");
});
app.get("/api/v1/generateIdHash", protect, (req, res) => {
  const hash = generateIdHash(req.user._id.toString());
  console.log(hash);
  res.json({ success: true, message: null, data: hash });
});

// app.get("/api/v1/scheduleFeed", (req, res) => {
//   scheduleFeedNotifications(42);
//   res.send("Success!!!");
// });
app.use("/api/v1", userRoutes);
app.use("/api/v1/periods", periodRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/messages", messageRoutes);

app.use(notFound);

app.use(errorHandler);

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", socketHandler);

connectDB(() => {
  server.listen(port, () => {
    scheduleTaskNotifications();
    console.log(`Server listening on port ${port}`);
  });
});
