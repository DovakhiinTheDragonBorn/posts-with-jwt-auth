import express from "express";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

//app config
dotenv.config();
const app = express();
const port = process.env.PORT || 9000;
const mongoUrl = process.env.MONGO_URL;

//database
mongoose.connect(mongoUrl);
const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDb");
});

//middleware
app.use(express.json());

//endpoints
app.get("/", (req, res) => {
  res.status(200).send("Server is running fine");
});

//routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

//start app
app.listen(port, () =>
  console.log(`App started on: http://localhost:${port}/`)
);
