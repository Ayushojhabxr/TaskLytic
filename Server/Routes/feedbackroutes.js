// routes/feedbackRoutes.js
import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackByInternId,
  getFeedbackByMentorId,
  updateFeedback,
  getFeedbackByInternAndTask ,
  updateTaskStatusForIntern,
  
} from '../Controllers/feedbackController.js';
import {isAuthenticated} from '../Middleware/authuser.js';

const router = express.Router();

router.post('/submit', isAuthenticated, createFeedback); // Submit feedback
router.get('/allfeedback', isAuthenticated, getAllFeedback); // Get all feedback

router.get('/intern/:internId/task/:taskId', isAuthenticated, getFeedbackByInternAndTask);
router.get('/intern/:internId', isAuthenticated, getFeedbackByInternId); // Intern’s feedback
router.get('/mentor/:mentorId', isAuthenticated, getFeedbackByMentorId); // Mentor’s feedback
router.patch('/:feedbackId', isAuthenticated, updateFeedback); // Update feedback
// Get feedback for a specific intern and task

// PATCH /api/tasks/:taskId/status
router.patch('/:taskId/status', isAuthenticated, updateTaskStatusForIntern);
// PATCH feedback and status in one call




export default router;
