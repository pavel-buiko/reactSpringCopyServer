exports.up = function (knex) {
  return knex.schema.createTable("projects", function (table) {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.text("description");
    table.string("img_src");
    table.string("link");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("projects");
};
