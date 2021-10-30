import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  title: String,
  content: String,
  free: { type: Boolean, default: false },
  _authorId: { type: mongoose.Schema.Types.ObjectId },
});

export default mongoose.model("Post", postSchema);
