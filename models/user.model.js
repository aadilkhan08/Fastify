import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  country: String,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
},{timestamps: true});

export default mongoose.model("User", userSchema);