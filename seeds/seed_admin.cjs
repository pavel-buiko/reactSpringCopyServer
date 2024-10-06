/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  try {
    const adminPasswordHash = await bcrypt.hash("1234", 12);

    const adminUser = await knex("users").where({ username: "admin" }).first();
    if (!adminUser) {
      await knex("users").insert({
        id: 1,
        username: "admin",
        firstName: "admin",
        lastName: "adminovich",
        age: 27,
        password: adminPasswordHash,
      });
      console.log("Admin is created");
    } else {
      console.log("Admin user already created");
    }
  } catch (err) {
    console.log("The error: ", err);
  }
};
