const { default: fastify } = require("fastify");
const blogcontroller = require("../controllers/BlogController");
const productcontroller = require("../controllers/ProductController");
const newscontroller = require("../controllers/NewsController");
const inquirycontroller = require("../controllers/InquiryController");
const helmet = require("@fastify/helmet");

async function userRoute(fastify) {
  await fastify.register(helmet);
  
  fastify.get("/hello", async (req, reply) => {
    return { message: "Hello" };
  });

  fastify.all("/inquiry", inquirycontroller.inquiry);

  fastify.all("/news-show", newscontroller.newsview);

  fastify.all("/blog-show", blogcontroller.edit);

  fastify.all("/product-details", productcontroller.productDetails);

  fastify.all("/product-show", productcontroller.productview);
  fastify.all("/product-view", productcontroller.productshow);
}
module.exports = userRoute;
