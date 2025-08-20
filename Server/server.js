

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./Routes/user.js";
import taskRoutes from "./Routes/taskRoute.js"
import feedbackRoutes from "./Routes/feedbackroutes.js"
import forumPostRoutes from "./Routes/ForumRoutes.js"

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "https://task-lytic.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// MongoDB Connection (Updated)
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send(" Backend is running");
});


app.use("/api/users", userRoute);
app.use("/api/tasks", taskRoutes);
app.use("/uploads", express.static("uploads"));
app.use('/api/feedback', feedbackRoutes);
app.use('/api/posts', forumPostRoutes);



// Start server
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});

