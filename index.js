const fastify = require("./app")

 module.exports = async (req, res) => {
              await fastify.ready(); // Ensure plugins and routes are loaded
              fastify.server.emit('request', req, res);
            };