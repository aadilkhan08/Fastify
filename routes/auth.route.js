import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

export default async (fastify, opts) => {
  fastify.post("/register", register);
  fastify.post("/login", login);
  fastify.post(
    "/logout",
    {
      preHandler: [fastify.authenticate],
    },
    logout
  );
  fastify.post("/forgot-password", forgotPassword);
  fastify.post("/reset-password/:token", resetPassword);
};
