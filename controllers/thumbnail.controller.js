import thumbnailSchema from "../models/thumbnail.model.js";
import path from "path";
import fs from "fs";
import { pipeline } from "stream";
import utils from "util";

const pipelineAsync = utils.promisify(pipeline);

export const createThumbnail = async (request, reply) => {
  try {
    const parts = request.part();
    let fields = {};
    let filename;

    // file handle
    for await (const part of parts) {
      if (part.file) {
        const filename = `${Date.now()}-${part.filename}`;
        const saveTo = path.join(
          __dirname,
          "..",
          "uploads",
          "thumbnails",
          filename
        );
        await pipelineAsync(part.file, fs.createWriteStream(saveTo));
      } else {
        fields[part.filename] = part.value;
      }
    }

    const thumbnail = new thumbnailSchema({
      user: request.user.id,
      videoName: fields.videoName,
      version: fields.version,
      image: `/uploads/thumbnails/${filename}`,
      paid: fields.paid === "true",
    }); 

    await thumbnail.save();
    reply.code(201).send(thumbnail);

  } catch (error) {
    reply.send(error);
  }
};
