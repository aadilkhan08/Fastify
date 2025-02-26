import userSchema from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const register = async (request, reply) => {
  try {
    // take data from body
    const { name, email, password, country } = request.body;

    // validate the data
    if (!name || !email || !password || !country) {
      return reply.send("Please provide all the details");
    }

    // check if user is already exists
    const existedUser = await userSchema.findOne({ email });
    if (existedUser) {
      return reply.send("User already exists");
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // save the user
    const user = new userSchema({
      name,
      email,
      password: hashedPassword,
      country,
    });

    // save the user
    await user.save();

    reply.code(201).send({ message: "User registered successfully" });
  } catch (error) {
    reply.send(error);
  }
};

export const login = async (request, reply) => {
  try {
    // take data from body
    const { email, password } = request.body;

    // check if email and password are valid
    if (!email || !password) {
      return reply.send("Please provide email and password");
    }

    // find the user
    const user = await userSchema.findOne({ email });

    // check if user exists
    if (!user) {
      return reply.send("User not found");
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.send("Invalid credentials");
    }

    const token = await request.server.jwt.sign({
      id: user._id,
    });

    reply.send({ message: "Login successful", token });
  } catch (error) {
    reply.send(error);
  }
};

export const forgotPassword = async (request, reply) => {
  try {
    // take data from body
    const { email } = request.body;

    // validate that email it there
    if (!email) {
      return reply.send("Please provide email");
    }

    const user = await userSchema.findOne({ email });

    // check if user exists
    if (!user) {
      return reply.notFound("User not found");
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetPasswordToken}`;
    reply.send({ message: "Reset password link sent to your email", resetUrl });
  } catch (error) {
    reply.send(error);
  }
};

export const resetPassword = async (request, reply) => {
  const token = request.params.token;
  const { newPassword } = request.body;

  // validate the data
  if (!token || !newPassword) {
    return reply.send("Please provide all the details");
  }

  const user = await userSchema.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiry: { $gt: Date.now() },
  });

  // check if user exists
  if (!user) {
    return reply.badRequest("Invalid token or expired token");
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // update the password
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  reply.send({ message: "Password reset successfully" });
};

export const logout = async (request, reply) => {
  // jwt is stateless,use strategy like refresh token or blacklist token for more
  reply.send({ message: "Logged out successfully" });
};
