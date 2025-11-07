const { default: fastify } = require("fastify");
const blogcontroller = require("../controllers/BlogController");
const productcontroller = require("../controllers/ProductController");
const newscontroller = require("../controllers/NewsController");

async function adminRoute(fastify) {
  fastify.all("/news", newscontroller.news);
  fastify.all("/product", productcontroller.product);
  fastify.all("/blog", blogcontroller.blogs);
  fastify.all("/delete", blogcontroller.deleteBlog);
  fastify.all("/trash", blogcontroller.trashBlog);
  fastify.all("/recycle", blogcontroller.recycleBlog);
}
module.exports = adminRoute;
