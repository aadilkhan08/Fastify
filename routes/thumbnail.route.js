import { createThumbnail } from '../controllers/thumbnail.controller'

export default async (fastify, opts) => {
  fastify.register(async fastify => {
    fastify.addHook('preHandler', fastify.authenticate)

    fastify.post('/', createThumbnail)
  })
}
