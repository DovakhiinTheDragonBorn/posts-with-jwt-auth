import { Router } from "express";
import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { isEmail, isPassword } from "../utils/validations.js";

dotenv.config();
const SECRET = process.env.SECRET;
const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { password, email } = req.body;

    //validate input
    let errors = [];
    if (!isEmail(email)) errors.push({ msg: "invalid email" });
    if (!isPassword(password)) errors.push({ msg: "invalid password" });

    if (errors.length) return res.status(400).json({ errors });

    //validate if user doesnt already exist
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({
        errors: [
          {
            msg: "User with this email already exists",
          },
        ],
      });

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //add user to db
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    //generate jwt and send to user
    if (savedUser) {
      const token = jwt.sign({ id: savedUser._id }, SECRET, {
        expiresIn: "4h",
      });
      return res.status(201).json({ token, user: savedUser });
    } else
      return res.status(400).json({
        errors: [
          {
            msg: "Invalid credentials",
          },
        ],
      });
  } catch (error) {
    res.status(500).json(JSON.stringify(error));
    console.log("Error caught: ", error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { password, email } = req.body;

    //validate input
    let errors = [];
    if (!isEmail(email)) errors.push({ msg: "invalid email" });
    if (!isPassword(password)) errors.push({ msg: "invalid password" });

    if (errors.length) return res.status(400).json({ errors });
    let user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        errors: [
          {
            msg: "Invalid credentials",
          },
        ],
      });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      const token = jwt.sign({ id: user._id }, SECRET, {
        expiresIn: "4h",
      });

      return res.status(200).json({ token });
    } else {
      return res.status(400).json({
        errors: [
          {
            msg: "Invalid credentials",
          },
        ],
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
