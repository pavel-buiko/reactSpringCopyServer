exports.up = function (knex) {
  return knex.schema.alterTable("users", function (table) {
    table.string("username").notNullable().unique();
    table.integer("age").notNullable();

    table.dropColumn("email");
  });
};

exports.down = function (knex) {};
