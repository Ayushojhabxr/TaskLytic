import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    minlength: [2, "First name must be at least 2 characters long"],
    maxlength: [50, "First name must not exceed 50 characters"]
  },

  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    minlength: [2, "Last name must be at least 2 characters long"],
    maxlength: [50, "Last name must not exceed 50 characters"]
  },

  userName: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [30, "Username must not exceed 30 characters"],
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^(\+?91)?\d{10}$/, "Phone number must be 10 digits, optionally prefixed with 91"]
  },

  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
    minlength: [5, "Address must be at least 5 characters long"],
    maxlength: [255, "Address must not exceed 255 characters"]
  },

  role: {
    type: String,
    required: [true, "Role is required"],
    enum: {
      values: ["intern", "admin", "mentor"],
      message: "Role must be either 'intern', 'admin', or 'mentor'"
    }
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
    select: false // exclude by default from query results
  },

  token: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function (next) {
  if (this.firstName) {
    this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase();
  }

  if (this.lastName) {
    this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1).toLowerCase();
  }

  next();
});

export const User = mongoose.model("User", userSchema);
