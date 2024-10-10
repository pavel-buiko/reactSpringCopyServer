import bcrypt from "bcrypt";

export async function seed(knex) {
  try {
    const adminPasswordHash = await bcrypt.hash("1234", 12);

    const adminUser = await knex("users").where({ username: "admin" }).first();
    if (!adminUser) {
      await knex("users").insert({
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
}
