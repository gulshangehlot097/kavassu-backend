const jwt = require("jsonwebtoken");
const env = require("../env");
const VerifyAuthmiddleware = async (request, reply, done) => {
  console.log("VerifyAuthmiddleware called:", request.method, request.url);

  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("No token provided");
    return done();
  }
  try {
    const decoded = jwt.verify(token, env.TOKEN_SECRET);
    console.log("Token verified:", decoded);
    request.user = decoded;
    return done();
  } catch (error) {
    console.log("Token verification failed");
    return done();
  }
};

module.exports = VerifyAuthmiddleware;
