import { fastifyPlugin as fp } from "fastify-plugin";
import mongoose from "mongoose";

export default fp(async (fastify, opts) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    fastify.decorate("mongoose", mongoose);
    fastify.log.info("MongoDB connected!");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }

  
});
