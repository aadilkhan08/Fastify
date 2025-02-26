import thumbnailSchema from '../models/thumbnail.model.js'
import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream'
import utils from 'util'
import fastify from 'fastify'

const pipelineAsync = utils.promisify(pipeline)

export const createThumbnail = async (request, reply) => {
  try {
    const parts = request.part()
    let fields = {}
    let filename

    // file handle
    for await (const part of parts) {
      if (part.file) {
        const filename = `${Date.now()}-${part.filename}`
        const saveTo = path.join(
          __dirname,
          '..',
          'uploads',
          'thumbnails',
          filename
        )
        await pipelineAsync(part.file, fs.createWriteStream(saveTo))
      } else {
        fields[part.filename] = part.value
      }
    }

    const thumbnail = new thumbnailSchema({
      user: request.user.id,
      videoName: fields.videoName,
      version: fields.version,
      image: `/uploads/thumbnails/${filename}`,
      paid: fields.paid === 'true'
    })

    await thumbnail.save()
    reply.code(201).send(thumbnail)
  } catch (error) {
    reply.send(error)
  }
}

export const getThumbnails = async (request, reply) => {
  try {
    const thumbnails = await thumbnailSchema.find({ user: request.user.id })
    reply.send(thumbnails)
  } catch (error) {
    reply.send(error)
  }
}

export const getThumbnail = async (request, reply) => {
  try {
    // validate user
    const thumbnail = await thumbnailSchema.findOne({
      _id: request.params.id,
      user: request.user.id
    })

    if (!thumbnail) {
      reply.code(404).send({ message: 'Thumbnail not found' })
    } else {
      reply.send(thumbnail)
    }
  } catch (error) {
    reply.send(error)
  }
}

export const updateThumbnail = async (request, reply) => {
  try {
    const updatedData = request.body
    const thumbnail = await thumbnailSchema.findByIdAndUpdate(
      {
        _id: request.params.id,
        user: request.user.id
      },
      updatedData,
      { new: true }
    )
    if (!thumbnail) {
      reply.code(404).send({ message: 'Thumbnail not found' })
    } else {
      reply.send(thumbnail)
    }
  } catch (error) {
    reply.send(error)
  }
}

export const deleteThumbnail = async (request, reply) => {
  try {
    const thumbnail = await thumbnailSchema.findByIdAndUpdate({
      _id: request.params.id,
      user: request.user.id
    })

    if (!thumbnail) {
      reply.code(404).send({ message: 'Thumbnail not found' })
    } else {
      reply.send(thumbnail)
    }

    const filePath = path.join(
      __dirname,
      '..',
      'uploads',
      'thumbnails',
      path.basename(thumbnail.image)
    )

    fs.unlink(filePath, err => {
      if (err) {
        fastify.log.error(err)
      }
    })

    await thumbnail.remove()

    reply.send({ message: 'Thumbnail deleted' })
  } catch (error) {
    reply.send(error)
  }
}
