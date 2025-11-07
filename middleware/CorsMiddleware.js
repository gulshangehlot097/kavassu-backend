async function CorsMiddleware(fastify, options) {
  fastify.addHook("onSend", async (request, reply, payload) => {
    reply.header("Access-Control-Allow-Origin", options.origin || "*");
    reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    reply.header("Access-Control-Allow-Credentials", "true");

    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }

    return payload;
  });
}

module.exports = CorsMiddleware;
