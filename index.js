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
import { errorHandler, notFound } from "./src/middlewares/error.middleware.js";

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

app.use("/api/v1", userRoutes);
app.use("/api/v1/periods", periodRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.use(notFound);

app.use(errorHandler);

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3001" } });

io.on("connection", socketHandler);

connectDB(() => {
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
