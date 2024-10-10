import knex from "../db.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.test" });

const globalTeardown = async () => {
  try {
    await knex.migrate.rollback(undefined, true);
    await knex.destroy();
  } catch (err) {
    console.error("Ошибка в globalTeardown:", err);
    process.exit(1);
  }
};

export default globalTeardown;
