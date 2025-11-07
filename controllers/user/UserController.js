const User = require("../../models/User");
const Token = require("../../models/TokenBlockList");
const jwt = require("jsonwebtoken");
const env = require("../../env");
const { verify, hash } = require("../../plugins/bcrypt");
const { Model } = require("objection");

async function login(req, reply) {
  try {
    const { email, password } = req.body;
    if (!email || email.trim() === "") {
      return reply.send({ status: "false", message: "Mobile is required" });
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      const isToken = await Token.query().findOne({ token });
      if (!isToken) {
        return reply.send({ status: "true", token: token });
      } else {
        return reply.send({ status: "false", message: "Unauthorized" });
      }
    }
    const key = env.TOKEN_SECRET;
    const user = await User.query().findOne({ email });
    if (user) {
      console.log(user);
      if (await verify(password, user.password)) {
        console.log("password matched");
        const token = jwt.sign({ userid: user.id, email: email }, key);
        return reply.send({ status: "true", token: token, userid: user.id });
      }
      return reply.send({ status: "false", message: "Wrong Password" });
    }
    return reply.send({ status: "false", message: "User not exists." });
  } catch (error) {
    console.log(error);
    return reply.send({ status: "false", error: error });
  }
}

async function signup(req, reply) {
  console.log("sign up:");
  const { email, password, mobile, name, role, country } = req.body;
  console.log("Signup called for mobile", email, password);
  const { nanoid } = await import("nanoid");
  try {
    //await User.transaction(async (trx) => {
    const existingUser = await User.query().findOne({ email: email });
    if (existingUser) {
      const key = env.TOKEN_SECRET;
      const token = jwt.sign({ userid: existingUser.id, email: email }, key);
      reply.send({
        status: "false",
        keyword: "exist",
        message: "User exists.",
        userid: existingUser.id,
        token: token,
      });
      return;
    }
    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
    const uniqueId = nanoid(5);
    const userid = `${uniqueId}_${formattedDateTime}`;
    //const userid = useriduniqueId;
    const userdata = {
      id: userid,
      username: email,
      password: await hash(password),
      mobile: mobile,
      country,
      role,
      first_name: name ? name : " ",
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    //reply.send({ status: false, message:userdata});
    const insertedUser = await User.query().insert(userdata);
    if (insertedUser) {
      console.log("sign up:", insertedUser);
    }
    //const key = env.TOKEN_SECRET;
    //const token = jwt.sign({ userid: insertedUser.id, mobile: mobile }, key);
    reply.send({
      status: "true",
      //user: insertedUser,
      token: "",
      message: "User signed up successfully.",
    });
    //});
  } catch (error) {
    console.error("Error during signup:", error);
    reply.status(500).send({
      status: "false",
      message: "Signup failed. Please try again later.",
      error: error,
    });
  }
}

async function verifyotp(req, reply) {
  try {
    console.log("verify token up:");
    const { otp, mobile } = req.body;
    const existingUser = await User.query().findOne({ mobile: mobile });
    if (otp != "123456") {
      reply.send({ status: false, message: "Wrong OTP", type: "otp" });
    }
    if (existingUser) {
      const key = env.TOKEN_SECRET;
      const token = jwt.sign({ userid: existingUser.id, mobile: mobile }, key);
      reply.send({
        status: true,
        message: "existing user",
        existinguser: true,
        token: token,
        user: existingUser,
        type: "user",
      });
    }
    reply.send({
      status: false,
      message: "not existing user",
      existinguser: false,
      type: "user",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    reply.status(500).send({
      status: false,
      message: "OTP verification failed",
      type: "error",
    });
  }
}

async function UserInfo(req, reply) {
  try {
    const {userid} = req.body;
    const info  = await User.query().findById(userid);
    return reply.send({status:"true",data:info})
  } catch (error) {
    console.error("Error during signup:", error);
    reply.status(500).send({
      status: false,
      message: "",
      type: "error",
    });
  }
}


async function verifyToken(req, reply) {
  return reply.send({ status: "true" });
}
async function logout(request, reply) {
  // const authHeader = request.headers["authorization"];
  // const token = authHeader;
  // await Token.query().insert({ token });
  reply.send({ status: "true", message: "Logout successfully", token: "" });
}

module.exports = {
  UserInfo,
  verifyToken,
  login,
  logout,
  signup,
  verifyotp,
};
