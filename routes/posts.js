import { Router } from "express";
import checkAuth from "../middleware/checkAuth.js";
import Post from "../models/Posts.js";

const router = Router();

router.get("/", checkAuth, async (req, res) => {
  try {
    const { user } = req;
    let foundPosts = [];
    if (user) foundPosts = await Post.find();
    else foundPosts = await Post.find({ free: true });
    return res.status(200).json(foundPosts);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:id", checkAuth, async (req, res) => {
  try {
    const { user, params } = req;
    const { id } = params;
    const foundPost = await Post.findById(id);
    if (foundPost) {
      if (!foundPost.free && !user)
        return res.status(200).json({
          errors: [
            {
              msg: "Not authorized",
            },
          ],
        });
      return res.status(200).json(foundPost);
    }
    return res.status(400).json({
      errors: [
        {
          msg: "post not found",
        },
      ],
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/myposts", checkAuth, async (req, res) => {
  try {
    const { user } = req;
    if (user) {
      const foundPosts = await Post.find({ _authorId: user.id });
      return res.status(200).json(foundPosts);
    } else
      return res.status(200).json({
        errors: [
          {
            msg: "Not authorized",
          },
        ],
      });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/add", checkAuth, async (req, res) => {
  try {
    const { body, user } = req;

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

    const newPost = new Post({ ...body, _authorId: user.id });
    const savedPost = await newPost.save();
    if (savedPost) return res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const { user, params } = req;
    const { id } = params;
    if (user) {
      //Only author of the post can delete it
      const foundPost = await Post.findOneAndDelete({
        _authorId: user.id,
        _id: id,
      });
      if (!foundPost)
        return res.status(200).json({
          errors: [
            {
              msg: "Failed to delete",
            },
          ],
        });
      return res.status(200).json(foundPost);
    } else
      return res.status(200).json({
        errors: [
          {
            msg: "Not authorized",
          },
        ],
      });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/:id", checkAuth, async (req, res) => {
  try {
    const { user, params, body } = req;
    const { id } = params;
    if (user) {
      //Only author of the post can update it
      const foundPost = await Post.findOneAndUpdate(
        {
          _authorId: user.id,
          _id: id,
        },
        { $set: body }
      );
      if (!foundPost)
        return res.status(200).json({
          errors: [
            {
              msg: "Failed to delete",
            },
          ],
        });
      return res.status(200).json(foundPost);
    } else
      return res.status(200).json({
        errors: [
          {
            msg: "Not authorized",
          },
        ],
      });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
