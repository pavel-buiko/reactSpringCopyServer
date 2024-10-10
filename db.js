import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const postgres = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
});

export default postgres;
