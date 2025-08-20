// controllers/feedbackController.js
import Feedback from "../Models/Feedback.js";
import Task from "../Models/Task.js";

// Create feedback
export const createFeedback = async (req, res) => {
  try {
    const { taskId, internId, mentorId, rating, comment, feedbackStatus } = req.body;

    // ✅ Validation (optional)
    if (!taskId || !internId || !mentorId || !feedbackStatus) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ Prevent duplicate feedback
    const existing = await Feedback.findOne({ taskId, internId });
    if (existing) {
      return res.status(409).json({ message: 'Feedback already exists for this task.' });
    }

    // ✅ Create new feedback
    const feedback = await Feedback.create({
      taskId,
      internId,
      mentorId,
      rating,
      comment,
      feedbackStatus
    });

    // ✅ Update task.assignedTo array
    const task = await Task.findById(taskId);
    if (task) {
      const internAssignment = task.assignedTo.find(a => a.internId.toString() === internId);
      if (internAssignment) {
        internAssignment.feedbackStatus = feedbackStatus;
        if (feedbackStatus === "Rework") {
          internAssignment.status = "Assigned";
        } else if (feedbackStatus === "completed") {
          internAssignment.feedbackStatus = "completed";
        }
        internAssignment.comment = comment;
        internAssignment.rating = rating;
        await task.save();
      }
    }

    res.status(201).json({ message: "Feedback created successfully", feedback });

  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('taskId', 'title')
      .populate('internId', 'firstName lastName')
      .populate('mentorId', 'firstName lastName');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback given to specific intern
export const getFeedbackByInternId = async (req, res) => {
  try {
    const { internId } = req.params;
    const feedbacks = await Feedback.find({ internId })
      .populate('taskId', 'title')
      .populate('mentorId', 'firstName lastName');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback given by a specific mentor
export const getFeedbackByMentorId = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const feedbacks = await Feedback.find({ mentorId })
      .populate('taskId', 'title')
      .populate('internId', 'firstName lastName');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const updates = req.body;

    const updated = await Feedback.findByIdAndUpdate(feedbackId, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // ✅ ALSO update task.assignedTo feedbackStatus
    const task = await Task.findById(updated.taskId);
    if (task) {
      const internAssignment = task.assignedTo.find(
        a => a.internId.toString() === updated.internId.toString()
      );
      if (internAssignment) {
        internAssignment.feedbackStatus = updates.feedbackStatus;
        internAssignment.comment = updates.comment;
        internAssignment.rating = updates.rating;

        if (updates.feedbackStatus === "Rework") {
          internAssignment.status = "Assigned";
        } else if (updates.feedbackStatus === "completed") {
          internAssignment.feedbackStatus  = "completed";
        }

        await task.save();
      }
    }

    res.status(200).json({ message: "Feedback and task updated", updated });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Get feedback for a specific intern and task
export const getFeedbackByInternAndTask = async (req, res) => {
    console.log("🔍 Route hit: /intern/:internId/task/:taskId");
  try {
    const { internId, taskId } = req.params;
    const feedback = await Feedback.findOne({ internId, taskId });
    
    if (!feedback) {
      return res.status(404).json({ message: 'No feedback found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching specific feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller: Update task-assignedTo status
export const updateTaskStatusForIntern = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { internId, status, feedbackStatus } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const assignment = task.assignedTo.find(a => a.internId.toString() === internId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.status = status;
    assignment.feedbackStatus = feedbackStatus;

    await task.save();
    res.json({ message: 'Task status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

