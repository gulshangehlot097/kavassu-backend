const fastify = require("fastify")({
  logger: true,
  bodyLimit: 100 * 1024 * 1024,
});

const env = require("./env");
const path = require("path");

const formbody = require("@fastify/formbody");
const fastifyStatic = require("@fastify/static");
const cors = require("@fastify/cors");
const corsMiddleware = require("./middleware/CorsMiddleware");
const helmet = require("@fastify/helmet");

const MAX_UPLOAD_SIZE_MB = 100;

fastify.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});
fastify.register(corsMiddleware, { origin: "" });

fastify.register(cors, {
  // origin: "http://192.168.1.50:3000",
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true,
});

fastify.register(formbody);
fastify.register(require("@fastify/multipart"), {
  limits: {
    fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  attachFieldsToBody: false,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastify.addHook("onSend", async (req, reply, payload) => {
  reply.header("Referrer-Policy", "no-referrer-when-downgrade");
  return payload;
});

fastify.setErrorHandler((error, request, reply) => {
  if (error.code === "FST_REQ_FILE_TOO_LARGE") {
    return reply.status(413).send({
      status: false,
      error: "File too large",
      maxAllowedSizeMB: MAX_UPLOAD_SIZE_MB,
    });
  }
  reply.status(500).send({
    status: false,
    error: error.message,
  });
});

fastify.register(require("./routes/apiRoute"), { prefix: "/api" });
fastify.register(require("./plugins/db"));

fastify.get("/hello", async (req, reply) => {
  reply.send("Hello, Fastify is running!");
});

const startServer = async () => {
  try {
    await fastify.listen({ port: parseInt(env.port, 10), host: "0.0.0.0" });
    console.log(`Server running at http://192.168.1.50:${env.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
