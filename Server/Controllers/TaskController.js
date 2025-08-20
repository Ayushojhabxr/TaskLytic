
// Controllers/TaskController.js
import { User } from "../Models/User.js";
import Task from "../Models/Task.js";

// POST - Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, deadline, createdBy, internIds } = req.body;

    const assignedTo = internIds.map(({ internId, startDate }) => ({
      internId,
      startDate: startDate || new Date(),
    }));

    const newTask = new Task({
      title,
      description,
      createdBy,
      deadline,
      assignedTo,
    });

    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET - All tasks created by mentor
const getAllTasks = async (req, res) => {
  try {
    const { createdBy } = req.query;
    const tasks = await Task.find(createdBy ? { createdBy } : {}).populate(
      "assignedTo.internId",
      "name email"
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET - Tasks assigned to a specific intern
const getTasksForIntern = async (req, res) => {
  try {
    const { internId } = req.params;
   const tasks = await Task.find({ "assignedTo.internId": internId })
  .populate("createdBy", "firstName lastName") // ✅ mentor name
  .populate("assignedTo.internId", "name email"); // ✅ intern info
  


    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH - Intern submits task
// const submitTask = async (req, res) => {
//   try {
//     const { taskId, internId } = req.params;
//     const { attachments, comment } = req.body;

//     const task = await Task.findById(taskId);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const intern = task.assignedTo.find(
//       (i) => i.internId.toString() === internId
//     );
//     if (!intern) return res.status(404).json({ message: "Intern not assigned" });

//     intern.attachments = attachments || [];
//     intern.comment = comment || "";
//     intern.status = "Submitted";

//     await task.save();
//     res.json({ message: "Task submitted", task });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };




// PATCH - Intern submits task
const submitTask = async (req, res) => {
  try {
    const { taskId, internId } = req.params;
    const { comment } = req.body;
    const file = req.file; // Uploaded file

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const intern = task.assignedTo.find(
      (i) => i.internId.toString() === internId
    );
    if (!intern) return res.status(404).json({ message: "Intern not assigned" });

    intern.attachments = file ? [`/uploads/${file.filename}`] : [];
    intern.comment = comment || "";
    intern.status = "Submitted";

    await task.save();
    res.json({ message: "Task submitted", task });
  } catch (err) {
    console.error("Error in submitTask:", err);
    res.status(500).json({ error: err.message });
  }
};


// GET - Tasks assigned by a specific mentor
const getTasksByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const tasks = await Task.find({ createdBy: mentorId }).populate(
      "assignedTo.internId",
      "name email"
    );

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// PATCH - Mentor gives feedback
// PATCH - Mentor gives feedback
const giveFeedback = async (req, res) => {
  try {
    const { taskId, internId } = req.params;
    const { feedbackStatus, rating, comment } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const intern = task.assignedTo.find(
      (i) => i.internId.toString() === internId
    );
    if (!intern) return res.status(404).json({ message: "Intern not assigned" });

    // ✅ Update values
    intern.feedbackStatus = feedbackStatus || "Reviewed";
    intern.status = feedbackStatus === "Rework" ? "Assigned" : "completed";
    intern.rating = rating;
    intern.comment = comment;
    intern.feedbackDate = new Date();

    await task.save();
    res.json({ message: "Feedback updated", task });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: err.message });
  }
};


const updateTaskFeedbackStatus = async (req, res) => {
  try {
    const { taskId, internId, feedbackStatus } = req.body;

    const task = await Task.findById(taskId);
    if (task) {
      const internAssignment = task.assignedTo.find(a => a.internId.toString() === internId);
      if (internAssignment) {
        internAssignment.feedbackStatus = feedbackStatus;
        if (feedbackStatus === "Rework") {
          internAssignment.status = "Assigned";
        }
        await task.save();
        res.status(200).json({ message: "Feedback status updated" });
      } else {
        res.status(404).json({ message: "Intern not assigned to this task" });
      }
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




//  Export all as named exports
export {
  createTask,
  getAllTasks,
  getTasksForIntern,
  submitTask,
  giveFeedback,
  getTasksByMentor,
  updateTaskFeedbackStatus
};

