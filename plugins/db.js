const fp = require("fastify-plugin");
const Knex = require("knex");
const { Model } = require("objection");

async function dbConnector(fastify, opts) {
  const knex = Knex({
    client:"mysql2",
    connection: {
      host: "localhost",
      user: "root",
      password: 'root',
      database: "kavassu_international",
    },
  });
  if (knex) {
    let data = await knex.raw("SELECT 1+1 as result");
    if(data)
    {
      console.log("Database connected");
    }else{
      console.log("Database not connected");
    }
  }
  Model.knex(knex);
  fastify.decorate("knex", knex);
}
module.exports = fp(dbConnector);
