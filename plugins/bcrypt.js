const bcrypt = require("bcrypt");

async function hash(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verify(password, storedHash) {
  return await bcrypt.compare(password, storedHash);
}

module.exports = { verify, hash };
