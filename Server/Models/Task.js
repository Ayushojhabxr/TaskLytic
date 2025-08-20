// const mongoose = require("mongoose");
import mongoose from "mongoose";

const InternSubSchema = new mongoose.Schema({
  internId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Assigned", "Submitted"],
    default: "Assigned",
  },
  attachments: [String],
  comment: {
    type: String,
    default: "",
  },
  rating: { type: Number }, // ✅ Add this
  feedbackStatus: {
    type: String,
    enum: ["Pending", "Rework" , "completed"],
    default: "Pending",
  },
});

const TaskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    deadline: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: [InternSubSchema],
  },
  { timestamps: true }
);

// module.exports = mongoose.model("Task", TaskSchema);
const Task = mongoose.model("Task", TaskSchema);

export default Task; 