import { User } from "../Models/User.js";
import bcrypt from "bcrypt";
import createTokenAndSaveCookies from "../JWT/authtoken.js";


export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      email,
      phone,
      address,
      password,
      role,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !userName ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !role
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    if (await User.findOne({ email }))
      return res.status(400).json({ field: "email", message: "Email already exists" });

    if (await User.findOne({ userName }))
      return res.status(400).json({ field: "userName", message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      userName,
      email,
      phone,
      address,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userName: newUser.userName,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        const e = error.errors[field];
        errors[field] = {
          kind: e.kind,          // required | minlength | maxlength | regexp …
          message: e.message,    // human‑readable message from your schema
          value: e.value,        // the offending value
        };
      }
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (error.code === 11000) {
      const dupField = Object.keys(error.keyValue)[0];
      return res
        .status(400)
        .json({ field: dupField, message: `${dupField} already exists` });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Please fill required fields" });

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({
        field: "email",
        message: "Please enter a valid email address",
      });

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = await createTokenAndSaveCookies(user._id, res);


     

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



// LOGOUT CONTROLLER
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};

//  GET CURRENT USER PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const user = await req.user;
    res.status(200).json({ user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};

//  GET ALL ADMINS AND INTERNS
export const getAllUser = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["mentor","admin","intern"] } });
    res.status(200).json({ admins });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};

//  GET ONLY ADMINS
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" });
    res.status(200).json({ admins });
  } catch (error) {
    console.error("Get Admins Error:", error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};

export const getMentors = async (req, res) => {
  try {
    const mentor = await User.find({ role: "mentor" });
    res.status(200).json({ mentor });
  } catch (error) {
    console.error("Get Admins Error:", error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};
export const getInterns = async (req, res) => {
  try {
    const intern = await User.find({ role: "intern" });
    res.status(200).json({ intern });
  } catch (error) {
    console.error("Get Admins Error:", error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};

