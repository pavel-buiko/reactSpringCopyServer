import knex from "knex";

const postgres = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
});

export default postgres;
