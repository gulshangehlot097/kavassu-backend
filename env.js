const HOST = "http://127.0.0.1";
const env = {
  port: "3000",
  HOST: HOST,
  TOKEN_SECRET: "aderty$3h667",
  MINIO_URL: HOST + ":9000/uploads/",
  FRPS_PORT: "3000",
  FOLLOWTYPE: { one: "Disconnect", zero: "Requested", null: "Connect" },
  RULES: [
    ".*ads.*",
    ".*banner.*",
    ".*popup.*",
    ".*[?&]ads=.*",
    ".*pagead.*",
    ".*adview.*",
    ".*googlesyndication.*",
    ".*googleadservices.*",
    ".*[?&]oad=.*",
    ".*[?&]adformat=.*",
    ".*[?&]ctier=.*",
    ".*[?&]ad_id=.*",
  ],
};
module.exports = env;
