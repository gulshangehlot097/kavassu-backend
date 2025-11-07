const News = require("../models/News");
const env = require("../env");
const fs = require("fs");
const path = require("path");

async function news(request, reply) {
  try {
    const method = request.method;
    const { page = 1, limit = 1 } = request.query;
    const pageIndex = Math.max(Number(page) - 1, 0);
    const pageSize = Number(limit);
    if (method == "GET") {
      const data = await News.query()
        .orderBy("created_at", "desc")
        .page(pageIndex, pageSize);

      const recentnews = await News.query()
        .orderBy("created_at", "desc")
        .limit(4);

      const categoryCounts = await News.query()
        .select("category")
        .count("* as total")
        .groupBy("category");

      return reply.send({
        status: true,
        data: data.results,
        recentblog: recentnews,
        categoryCounts,
        totalCount: data.total,
        totalPages: Math.ceil(data.total / pageSize),
        page: Number(page),
        limit: pageSize,
      });
    }
    const parts = request.parts();
    const newsData = { images: [] };

    const uploadDir = path.join(__dirname, "../public/images/news");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for await (const part of parts) {
      if (part.file) {
        const fileName = `${Date.now()}_${part.filename}`;
        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, await part.toBuffer());

        newsData.images.push(`/images/news/${fileName}`);
      } else {
        newsData[part.fieldname] = part.value;
      }
    }

    if (newsData.id) {
      const updatedNews = await News.query().patchAndFetchById(newsData.id, {
        title: newsData.title,
        category: newsData.category,
        shortdes: newsData.shortdes,
        detaildes: newsData.detaildes,
        images: newsData.images,
        updated_at: new Date(),
      });

      return reply.send({
        status: true,
        message: "News updated successfully",
        news: updatedNews,
      });
    }

    const newNews = await News.query().insert({
      title: newsData.title,
      category: newsData.category,
      shortdes: newsData.shortdes,
      detaildes: newsData.detaildes,
      images: newsData.images,
      created_at: new Date(),
      updated_at: new Date(),
    });

    reply.send({
      status: true,
      message: "News created successfully",
      news: newNews,
    });
  } catch (error) {
    reply.status(500).send({ status: false, message: error.message });
  }
}

async function newsview(request, reply) {
  try {
    const method = request.method;
    const { page = 1, limit = 1 } = request.query;
    const pageIndex = Math.max(Number(page) - 1, 0);
    const pageSize = Number(limit);

    if (method === "GET") {
      // read query params ?page=1&limit=4
      const allNews = await News.query()
        .orderBy("created_at", "desc")
        .page(pageIndex, pageSize);

      return reply.send({
        status: true,
        data: allNews.results,
        totalCount: allNews.total,
        totalPages: Math.ceil(allNews.total / pageSize),
        page: Number(page),
        limit: pageSize,
      });
    }

    const { id, category } = request.body.data || {};

    if (id) {
      const news = await News.query().findById(id);
      return reply.send(
        news
          ? { status: true, data: news }
          : { status: false, message: "news not found." }
      );
    }

    if (category) {
      const news = await News.query()
        .where({ category })
        .orderBy("created_at", "desc")
        .page(pageIndex, pageSize);

      const categoryCounts = await News.query()
        .select("category")
        .count("* as total")
        .groupBy("category");

      return reply.send(
        news.results.length
          ? {
              status: true,
              data: news.results,
              categoryCounts,
              totalCount: news.total,
              totalPages: Math.ceil(news.total / pageSize),
              page: Number(page),
              limit: pageSize,
            }
          : {
              status: false,
              message: "No news found for this category.",
            }
      );
    }

    reply.send({ status: false, message: "Provide either an ID or category." });
  } catch (error) {
    reply.status(500).send({ status: false, message: error.message });
  }
}

module.exports = {
  news,
  newsview,
};
