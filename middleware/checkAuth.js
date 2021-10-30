import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET = process.env.SECRET;
export default async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (token) {
      const user = jwt.verify(token, SECRET);
      if (user) req.user = user;
    }
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") next();

    return res.status(500).json({
      errors: [error],
    });
  }
};
