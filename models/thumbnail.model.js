import mongoose from "mongoose";

const thumbnailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  videoName: {
    type: String,
    required: true,
  },
  version: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Thumbnail", thumbnailSchema);
