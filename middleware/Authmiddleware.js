const jwt = require("jsonwebtoken");
const env = require("../env");
const TokenModel = require("../models/TokenBlockList");

const Authmiddleware = async (request, reply, done) => {
  // const authHeader = request.headers["authorization"];
  //const token = authHeader && authHeader.split(" ")[1];
  const token = request.headers["authorization"];
  const { userid } = request.body;
  //console.log("token:",token);
  if (!token) {
    return reply.send({
      status: "false",
      error: "Unauthorized",
      message: "not token",
    });
  }

  try {
    // const isToken = await TokenModel.query().findOne({ token });
    // if (isToken) {
    //   return reply.send({
    //     status: false,
    //     error: "Unauthorized",
    //     message: "Token blocked (logout)",
    //   });
    // }

    // Verify token
    const decoded = jwt.verify(token, env.TOKEN_SECRET);
    console.log("decoded:", decoded);
    // Check if userId in token matches request
    if (decoded && String(decoded.userid) === String(userid)) {
      request.user = decoded;
      return done();
    } else {
      return reply.status(401).send({
        status: false,
        error: "Unauthorized",
        errormsg: "User mismatch",
      });
    }
  } catch (error) {
    return reply
      .status(401)
      .send({ status: false, error: "Unauthorized", errormsg: error.message });
  }
};

module.exports = Authmiddleware;
