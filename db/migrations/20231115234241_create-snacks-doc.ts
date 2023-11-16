import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("snacks", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("session_id").index();
    table.string("name").notNullable();
    table.string("description").notNullable();
    table.boolean("in_diet").notNullable();
    table.timestamp("date_and_time").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("snacks");
}
