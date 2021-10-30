import { Router } from "express";
// import { publicPosts, privatePosts } from "../db.js";
import checkAuth from "../middleware/checkAuth.js";
import { Post } from "../models/index.js";
import Posts from "../models/Posts.js";

const router = Router();

router.get("/", checkAuth, async (req, res) => {
  try {
    const { user } = req;
    console.log("user: ", user);
    let foundPosts = [];
    if (user) foundPosts = await Posts.find();
    else foundPosts = await Posts.find({ free: true });
    return res.status(200).json(foundPosts);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/add", checkAuth, async (req, res) => {
  try {
    const { body, user } = req;
    console.log("user: ", user);

    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg: "Not authorized",
          },
        ],
      });
    }
    const { title, content, free } = body;
    if (!title)
      return res.status(400).json({
        errors: [
          {
            msg: "Title not provided",
          },
        ],
      });

    if (!content)
      return res.status(400).json({
        errors: [
          {
            msg: "Content not provided",
          },
        ],
      });
    if (free && typeof free !== "boolean")
      return res.status(400).json({
        errors: [
          {
            msg: `Parameter "Free" needs to be of type bool`,
          },
        ],
      });

    const newPost = new Post(body);
    const savedPost = await newPost.save();
    if (savedPost) return res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
