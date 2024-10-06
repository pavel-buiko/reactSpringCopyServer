exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};

table.increments("id").primary();
table.string("firstName").notNullable();
table.string("lastName").notNullable();
table.string("password").notNullable();
table.timestamps(true, true);
table.string("username").notNullable().unique();
table.integer("age").notNullable();
