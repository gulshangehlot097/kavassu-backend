const Product = require("../models/Product");
const env = require("../env");
const fs = require("fs");
const path = require("path");

async function product(request, reply) {
  try {
    const method = request.method;
    if (method === "GET") {
      const data = await Product.query()
        .whereNull("is_delete")
        .orderBy("created_at", "desc")
        .page(0, 5);

      const categoryCounts = await Product.query()
        .whereNull("is_delete")
        .select("category")
        .count("* as total")
        .groupBy("category");

      return reply.send({
        status: true,
        data: data,
        categoryCounts,
      });
    }
    const parts = request.parts();
    const product = { images: [] };
    let imageIndex = 0;

    const imageDir = path.join(__dirname, "../public/images/product");
    const pdfDir = path.join(__dirname, "../public/images/docs/product");

    [imageDir, pdfDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    for await (const part of parts) {
      if (part.file) {
        const fileName = `${Date.now()}_${part.filename}`;
        const isPdf = path.extname(part.filename).toLowerCase() === ".pdf";
        const savePath = isPdf ? pdfDir : imageDir;

        await fs.promises.writeFile(
          path.join(savePath, fileName),
          await part.toBuffer()
        );

        if (isPdf) {
          product.datasheet = `/images/docs/product/${fileName}`;
        } else {
          product.images.push({
            [`image${imageIndex || ""}`]: `/images/product/${fileName}`,
          });
          imageIndex++;
        }
      } else {
        product[part.fieldname] = part.value;
      }
    }

    if (product.id) {
      const updatedProduct = await Product.query().patchAndFetchById(
        product.id,
        {
          title: product.title,
          category: product.category,
          shortdes: product.shortdes,
          content: product.content,
          technicalData: product.technicalData,
          datasheet: product.datasheet || null,
          images: JSON.stringify(product.images),
          updated_at: new Date(),
        }
      );

      return reply.send({
        status: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
    }

    const newProduct = await Product.query().insert({
      title: product.title,
      category: product.category,
      shortdes: product.shortdes,
      content: product.content,
      technicalData: product.technicalData,
      datasheet: product.datasheet || null,
      images: JSON.stringify(product.images),
      created_at: new Date(),
      updated_at: new Date(),
    });

    reply.send({
      status: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    reply.status(500).send({ status: false, message: error.message });
  }
}

async function productview(request, reply) {
  try {
    const { page = 1, limit = 1 } = request.query;
    const pageIndex = Math.max(Number(page) - 1, 0);
    const pageSize = Number(limit);
    const { data } = request.body;
    const { id, category } = data;

    if (id) {
      const product = await Product.query().findById(id);
      if (product) {
        return reply.send({
          status: true,
          data: product,
        });
      }

      return reply.send({
        status: false,
        message: "product not found.",
      });
    }

    if (category) {
      const product = await Product.query()
        .where("category", category)
        .whereNull("is_delete")
        .orderBy("created_at", "desc")
        .page(pageIndex, pageSize);

      const categoryCounts = await Product.query()
        .whereNull("is_delete")
        .select("category")
        .count("* as total")
        .groupBy("category");

      if (product.results.length > 0) {
        return reply.send({
          status: true,
          data: product.results,
          categoryCounts,
          totalCount: product.total,
          totalPages: Math.ceil(product.total / pageSize),
          page: Number(page),
          limit: pageSize,
        });
      }

      return reply.send({
        status: false,
        message: "No product found for this category.",
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



async function productshow(request, reply) {
  try {
    const { page = 1, limit = 1 } = request.query;
    const pageIndex = Math.max(Number(page) - 1, 0);
    const pageSize = Number(limit);

    
    const categoryList = await Product.query()
      .whereNull("is_delete")
      .groupBy("category")
      .select("category");

    const categories = categoryList.map(item => item.category);

    const categoryData = {};
    for (const cat of categories) {
      categoryData[cat] = await Product.query()
        .where("category", cat)
        .whereNull("is_delete")
        .page(pageIndex, pageSize);
    }

    const allproduct = await Product.query()
      .whereNull("is_delete")
      .page(pageIndex, pageSize);

    return reply.send({
      status: true,
      message: "Products fetched successfully",
      categories: categoryData,
      allproduct,
      totalCount: allproduct.total,
      totalPages: Math.ceil(allproduct.total / pageSize),
      page: Number(page),
      limit: pageSize,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      status: false,
      message: error.message,
    });
  }
}


async function productDetails(request, reply) {
  try {
    const categories = await Product.query()
      .whereNull("is_delete")
      .groupBy("category")
      .select("category");

    const result = await Promise.all(
      categories.map(async ({ category }) => ({
        category,
        products: await Product.query()
          .where({ category })
          .whereNull("is_delete")
          .select("id", "title"),
      }))
    );

    const allProducts = await Product.query()
      .whereNull("is_delete")
      .select("id", "title", "images", "shortdes", "category");

    reply.send({ status: true, categories: result, products: allProducts });
  } catch (error) {
    reply.send({ status: false, message: error.message });
  }
}

module.exports = { product, productview, productshow, productDetails };
