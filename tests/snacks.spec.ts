import { afterAll, beforeAll, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { execSync } from "node:child_process";
import app from "../src/app";

describe("Snacks routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a new snack", async () => {
    await request(app.server)
      .post("/")
      .send({
        name: "Test",
        description: "test",
        date_and_time: "2023-11-16T12:34:00",
        in_diet: false,
      })
      .expect(201);
  });

  it("should be able to list the snacks", async () => {
    const createUserResponse = await request(app.server)
      .post("/")
      .send({
        name: "Test",
        description: "test",
        date_and_time: "2023-11-16T12:34:00",
        in_diet: false,
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    const listSnacksResponse = await request(app.server)
      .get("/")
      .set("Cookie", cookies)
      .expect(200);

    expect(listSnacksResponse.body["snacks"]).toEqual([
      expect.objectContaining({
        name: "Test",
        description: "test",
        date_and_time: "2023-11-16T12:34:00",
        in_diet: 0,
      }),
    ]);
  });

  it("should be able to get a specific transaction", async () => {
    const createUserResponse = await request(app.server)
      .post("/")
      .send({
        name: "Test",
        description: "test",
        date_and_time: "2023-11-16T12:34:00",
        in_diet: false,
      })
      .expect(201);
    const cookies = createUserResponse.get("Set-Cookie");

    const listSnacksResponse = await request(app.server)
      .get("/")
      .set("Cookie", cookies)
      .expect(200);

    const { id } = listSnacksResponse.body["snacks"][0];
    console.log("id", id);

    const getSnackResponse = await request(app.server)
      .get(`/${id}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(getSnackResponse.body["snack"]).toEqual(
      expect.objectContaining({
        name: "Test",
        description: "test",
        date_and_time: "2023-11-16T12:34:00",
        in_diet: 0,
        id,
      })
    );
  });
});
