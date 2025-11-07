const Inquiry = require("../models/Inquiry");
const env = require("../env");
const fs = require("fs");
const path = require("path");

async function inquiry(request, reply) {
  try {
    const req = request.body.data;
    const newInquiry = await Inquiry.query().insert({
      name: req.name,
      email: req.email,
      mobile: req.mobile,
      city: req.city,
      zipcode: req.zipcode,
      company: req.company,
      product_category: req.product_category,
      product_interest: req.product_interest,
      subject: req.subject,
      message: req.message,
      created_at: new Date(),
      updated_at: new Date(),
    });

    reply.send({
      status: true,
      message: "Inquiry submitted successfully",
    //   data: newInquiry,
    });
  } catch (error) {
    reply.status(500).send({
      status: false,
      message: error.message || "Server error",
    });
  }
}

module.exports = {
  inquiry,
};
