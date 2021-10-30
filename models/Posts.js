import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  title: String,
  content: String,
  free: { type: Boolean, default: false },
});

export default mongoose.model("Post", postSchema);
