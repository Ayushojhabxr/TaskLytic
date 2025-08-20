import express from "express";
import {
  login,
  logout,
  register,
  getAdmins,
  getMentors,
  getInterns,
  getAllUser,
  getMyProfile,
} from "../Controllers/user.controller.js";
import { isAuthenticated, isAuth } from "../Middleware/authuser.js";

const router = express.Router();

router.post("/register",  register);
router.post("/login", login);


router.get("/logout", isAuthenticated, logout);
router.get("/myprofile", isAuthenticated, getMyProfile);
router.get("/admin", getAdmins);
router.get("/mentor", getMentors);
router.get("/intern", getInterns);
router.get("/alluser", getAllUser);
router.get("/verify-token", isAuthenticated, (req, res) => {
  res.status(200).json({
    message: "Token valid",
    user: {
      id: req.user._id,
      role: req.user.role,
      email: req.user.email
    }
  });
});



export default router;