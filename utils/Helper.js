const Domain = require("../models/Domain");
async function Nanoid(count = 5, id = "") {
  const { nanoid } = await import("nanoid");
  return nanoid(count) + id;
}

async function domainChecker(domain) {
  try {
    const isExist = await Domain.query().findOne({ domain });
    if (isExist) {
      return { status: "false" };
    } else {
      return { status: "true" };
    }
  } catch (error) {
    return reply.send({ status: "false", error });
  }
}
module.exports = { Nanoid, domainChecker };
