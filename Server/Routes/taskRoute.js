



import {
  createTask,
  getAllTasks,
  getTasksForIntern,
  submitTask,
  giveFeedback,
  getTasksByMentor
} from "../Controllers/TaskController.js";
import upload from "../Middleware/Upload.js"
import {isAuthenticated} from '../Middleware/authuser.js';
import express from "express";
const router = express.Router();

router.post("/create", isAuthenticated, createTask);
router.get("/alltasks", isAuthenticated, getAllTasks);
router.get("/mentor/:mentorId", isAuthenticated, getTasksByMentor);
router.get("/intern/:internId", isAuthenticated, getTasksForIntern);
router.patch("/:taskId/submit/:internId",
  upload.single("attachment"), // only one file allowed
  isAuthenticated,
  submitTask);
// PATCH feedback and status in one call
router.patch('/tasks/:taskId/intern/:internId/feedback', isAuthenticated, giveFeedback);




export default router;
