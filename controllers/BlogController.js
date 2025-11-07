const Blog = require("../models/Blog");
const env = require("../env");
const fs = require("fs");
const path = require("path");

async function blogs(request, reply) {
  try {
    const method = request.method;
    const { page = 1, limit = 1 } = request.query;
    const pageIndex = Math.max(Number(page) - 1, 0);
    const pageSize = Number(limit);

    if (method === "GET") {
      const data = await Blog.query()
        .whereNull("is_delete")
        .orderBy("created_at", "desc")
        .page(pageIndex, pageSize);

      const recentBlog = await Blog.query()
        .whereNull("is_delete")
        .orderBy("created_at", "desc")
        .limit(4);

      const categoryCounts = await Blog.query()
        .whereNull("is_delete")
        .select("category")
        .count("* as total")
        .groupBy("category");

      return reply.send({
        status: true,
        data: data,
        recentblog: recentBlog,
        categoryCounts,
        totalCount: data.total,
        totalPages: Math.ceil(data.total / pageSize),
        page: Number(page),
        limit: pageSize,
      });
    }

    const parts = request.parts();
    const blog = {};

    const uploadDir = path.join(__dirname, "../public/images/blog");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for await (const part of parts) {
      if (part.file) {
        const fileName = `${Date.now()}_${part.filename}`;
        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, await part.toBuffer());
        blog[part.fieldname] = `images/blog/${fileName}`;
      } else {
        blog[part.fieldname] = part.value;
      }
    }

    const {
      id,
      title,
      slug,
      shortdes,
      content,
      category,
      tags,
      author,
      publishdate,
      metadescription,
      metatitle,
      keywords,
      status,
      featured,
      featuredimage,
    } = blog;

    if (id) {
      const existingBlog = await Blog.query().findById(id);
      const updateData = {
        title,
        slug,
        shortdes,
        content,
        category,
        tags,
        author,
        publishdate,
        metadescription,
        metatitle,
        keywords,
        status,
        featured,
        updated_at: new Date(),
      };

      if (featuredimage) {
        updateData.image = featuredimage;
      }
      const updatedBlog = await Blog.query().patchAndFetchById(id, updateData);
      return reply.send({
        status: true,
        message: "Blog updated successfully",
        blog: updatedBlog,
      });
    }
    const newBlog = await Blog.query().insert({
      title,
      slug,
      shortdes,
      content,
      category,
      tags,
      author,
      publishdate,
      metadescription,
      metatitle,
      keywords,
      status,
      featured,
      image: blog.featuredimage || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return reply.send({
      status: true,
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      status: false,
      message: error.message,
    });
  }
}

async function edit(request, reply) {
  try {
    const { data } = request.body;
    const { id, category } = data;
    const { page = 1, limit = 1 } = request.query;
    const pageIndex = Math.max(Number(page) - 1, 0);
    const pageSize = Number(limit);

    if (id) {
      const blog = await Blog.query().findById(id);
      if (blog) {
        return reply.send({
          status: true,
          data: blog,
        });
      }

      return reply.send({
        status: false,
        message: "Blog not found.",
      });
    }

    if (category) {
      const blogs = await Blog.query()
        .where("category", category)
        .whereNull("is_delete")
        .orderBy("created_at", "desc")
        .page(pageIndex, pageSize);

      const categoryCounts = await Blog.query()
        .whereNull("is_delete")
        .select("category")
        .count("* as total")
        .groupBy("category");

      const recent = await Blog.query()
        .select("id", "title")
        .whereNull("is_delete")
        .orderBy("created_at", "desc")
        .limit(5);

      if (blogs.results.length > 0) {
        return reply.send({
          status: true,
          data: blogs.results,
          totalCount: blogs.total,
          totalPages: Math.ceil(blogs.total / pageSize),
          page: Number(page),
          limit: pageSize,
          categoryCounts,
          recent,
        });
      }

      return reply.send({
        status: false,
        message: "No blogs found for this category.",
      });
    }

    return reply.send({
      status: false,
      message: "Please provide either an ID or a category.",
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      status: false,
      message: error.message,
    });
  }
}

async function deleteBlog(request, reply) {
  try {
    const { data } = request.body;
    const { id } = data;

    if (!id) {
      return reply.status(400).send({
        status: false,
        message: "Blog ID is required.",
      });
    }

    const deletedCount = await Blog.query().deleteById(id);

    if (deletedCount) {
      return reply.send({
        status: true,
        message: "Blog deleted successfully.",
      });
    }

    return reply.send({
      status: false,
      message: "Blog not found or already deleted.",
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      status: false,
      message: error.message,
    });
  }
}

async function trashBlog(request, reply) {
  try {
    const { data } = request.body;
    const { id } = data;

    if (!id) {
      return reply.status(400).send({
        status: false,
        message: "Blog ID is required.",
      });
    }

    const blog = await Blog.query().findById(id);

    if (!blog) {
      return reply.status(404).send({
        status: false,
        message: "Blog not found.",
      });
    }

    const updatedBlog = await Blog.query().patchAndFetchById(id, {
      is_delete: new Date(),
      updated_at: new Date(),
    });

    return reply.send({
      status: true,
      message: "Blog moved to trash successfully.",
      data: updatedBlog,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      status: false,
      message: error.message,
    });
  }
}

async function recycleBlog(request, reply) {
  try {
    const { data } = request.body;
    const { id } = data;
    const blog = await Blog.query().findById(id);

    if (blog.is_delete === null) {
      return reply.send({
        status: false,
        message: "Blog is already active.",
      });
    }

    const updatedBlog = await Blog.query().patchAndFetchById(id, {
      is_delete: null,
      updated_at: new Date(),
    });

    return reply.send({
      status: true,
      message: "blog restored successfully.",
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      status: false,
      message: error.message,
    });
  }
}

module.exports = { blogs, deleteBlog, trashBlog, recycleBlog, edit };
