import dotenv from "dotenv";
dotenv.config();
import path from "path";
import Fastify from "fastify";
const fastify = Fastify({
  logger: true,
});

fastify.register(import("@fastify/cors"));
fastify.register(import("@fastify/sensible"));
fastify.register(import("@fastify/env"), {
  dotenv: true,
  schema: {
    type: "object",
    required: ["PORT", "MONGODB_URI", "JWT_TOKEN"],
    properties: {
      PORT: { type: "string", default: 3000 },
      MONGODB_URI: { type: "string" },
      JWT_TOKEN: { type: "string" },
    },
  },
});

// Custom plugin
fastify.register(import("./plugins/mongodb.js"));

fastify.get("/", function (request, reply) {
  reply.notFound();
});

// test database
fastify.get("/test", function (request, reply) {
  try {
    const mongoose = fastify.mongoose;
    const connectionStatus = mongoose.connection.readyState;

    let status = "";

    switch (connectionStatus) {
      case 0:
        status = "disconnected";
        break;

      case 1:
        status = "connected";
        break;

      case 2:
        status = "connecting";
        break;

      case 3:
        status = "disconnecting";
        break;

      default:
        status = "unknown";
        break;
    }

    reply.send({ databases: status });

    reply.send({ status });
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send(error);
    process.exit(1);
  }
});

const start = async () => {
  try {
    fastify.listen({ port: process.env.PORT || 5174 });
    fastify.log.info(
      `server listening on http://localhost:${process.env.PORT} `
    );
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
