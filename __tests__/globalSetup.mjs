import knex from "../db.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const globalSetup = async () => {
  try {
    await knex.migrate.rollback(undefined, true);
    await knex.migrate.latest();
    await knex.seed.run();
  } catch (err) {
    console.error("Ошибка в globalSetup:", err);
  }
};

export default globalSetup;
