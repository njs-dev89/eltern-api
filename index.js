// Installed Packages imports
import express from "express";
import dotenv from "dotenv";
import path from "path";

// Local modules imports
import connectDB from "./src/config/db.js";

//Routes imports
import userRoutes from "./src/routes/user.routes.js";
import periodRoutes from "./src/routes/period.routes.js";
import topicRoutes from "./src/routes/topic.routes.js";
import { errorHandler, notFound } from "./src/middlewares/error.middleware.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "/src", "/static")));

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.use("/api/v1", userRoutes);
app.use("/api/v1/periods", periodRoutes);
app.use("/api/v1/topics", topicRoutes);

app.use(notFound);

app.use(errorHandler);

const port = process.env.PORT || 3000;

connectDB(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
