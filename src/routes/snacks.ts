import { FastifyInstance } from "fastify";
import { knex } from "../database";
import crypto from "node:crypto";
import { CheckSessionIdExists } from "../middleware/check-session-id-exists";
import { z } from "zod";
import { Tables } from "knex/types/tables";

export async function snacksRoutes(app: FastifyInstance) {
  //route for list a user snacks
  app.get("/", { preHandler: [CheckSessionIdExists] }, async (req, res) => {
    const { sessionId } = req.cookies;
    const snacks = await knex("snacks").where("session_id", sessionId);
    console.log(snacks);
    return res.status(200).send({ snacks });
  });

  //route for get a snack
  app.get("/:id", { preHandler: [CheckSessionIdExists] }, async (req, res) => {
    const { sessionId } = req.cookies;
    const getSnackParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getSnackParamsSchema.parse(req.params);
    const snack = await knex("snacks")
      .where({ id, session_id: sessionId })
      .first();
    return res.status(200).send({ snack });
  });

  //route for create a snack
  app.post("/", async (req, res) => {
    const createSnackBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_and_time: z.string(),
      in_diet: z.boolean(),
    });
    const { name, description, date_and_time, in_diet } =
      createSnackBodySchema.parse(req.body);

    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      const new_id = crypto.randomUUID();
      res.cookie("sessionId", new_id, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
      sessionId = new_id;
    }
    await knex("snacks").insert({
      id: crypto.randomUUID(),
      session_id: sessionId,
      name,
      description,
      in_diet,
      date_and_time,
    });
    return res.status(201).send();
  });

  //route for update a snack
  app.put("/:id", { preHandler: [CheckSessionIdExists] }, async (req, res) => {
    const { sessionId } = req.cookies;

    const getSnackParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getSnackParamsSchema.parse(req.params);

    const createSnackBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_and_time: z.string(),
      in_diet: z.boolean(),
    });
    const { name, description, date_and_time, in_diet } =
      createSnackBodySchema.parse(req.body);

    await knex("snacks")
      .where({ id, session_id: sessionId })
      .update({ name, description, date_and_time, in_diet });

    return res.status(200).send();
  });

  //route for delete a snack
  app.delete(
    "/:id",
    { preHandler: [CheckSessionIdExists] },
    async (req, res) => {
      const { sessionId } = req.cookies;

      const getSnackParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getSnackParamsSchema.parse(req.params);

      knex("snacks").where({ id, session_id: sessionId }).delete();

      return res.status(200).send();
    }
  );

  //route for summary
  app.get(
    "/summary",
    { preHandler: [CheckSessionIdExists] },
    async (req, res) => {
      const { sessionId } = req.cookies;
      const snacks = await knex("snacks").where({ session_id: sessionId });
      gemSummary(snacks);
      const { snacks_total, snacksInDiet, snacksOutDiet, bestSequence } =
        gemSummary(snacks);
      res.status(200).send({
        summary: {
          snacks_total,
          snacksInDiet,
          snacksOutDiet,
          bestSequence,
        },
      });
    }
  );
}

function gemSummary(data: Array<Tables["snacks"]>) {
  data.sort(compararPorData);

  let snacks_total = 0;
  let snacksInDiet = 0;
  let aux = 0;
  let snacksOutDiet = 0;
  let bestSequence = 0;
  data.map((snack) => {
    snacks_total++;
    if (snack.in_diet) {
      snacksInDiet++;
      aux++;
      if (aux > bestSequence) {
        bestSequence = aux;
      }
    } else {
      snacksOutDiet++;
      aux = 0;
    }
  });
  return { snacks_total, snacksInDiet, snacksOutDiet, bestSequence };
}

function compararPorData(a: Tables["snacks"], b: Tables["snacks"]) {
  const DateA = new Date(a.date_and_time);
  const DateB = new Date(b.date_and_time);

  if (DateA.getTime() < DateB.getTime()) {
    return -1;
  } else if (DateA.getTime() > DateB.getTime()) {
    return 1;
  }
  return 0;
}
