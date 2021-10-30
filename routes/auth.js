import { Router } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/Users.js";
// import { users } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET = process.env.SECRET;
const router = Router();

router.post(
  "/signup",
  [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Please provide a password that is greater than 5 characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { password, email } = req.body;

      //validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //validate if user doesnt already exist
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg: "User with this email already exists",
            },
          ],
        });
      }

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
          expiresIn: 60 * 60,
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
  }
);

router.post(
  "/login",
  [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Please provide a password that is greater than 5 characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { password, email } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid credentials",
            },
          ],
        });
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        const token = jwt.sign({ email }, SECRET, {
          expiresIn: 3600000,
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
      res.status(500).json(JSON.stringify(error));
    }
  }
);

export default router;
