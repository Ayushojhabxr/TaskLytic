import jwt from "jsonwebtoken";
import { User } from "../Models/User.js";

const createTokenAndSaveCookies = async (userId, res) => {
  const user = await User.findById(userId);
  const token = jwt.sign(
    { userId: user._id, role: user.role }, 
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  await User.findByIdAndUpdate(user._id, { token });

  return token;
};

export default createTokenAndSaveCookies;
