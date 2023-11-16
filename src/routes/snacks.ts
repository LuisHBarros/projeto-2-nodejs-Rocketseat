import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { CheckSessionIdExists } from "../middleware/check-session-id-exists";
import { z } from "zod";

export async function snacksRoutes(app: FastifyInstance) {
  //route for list a user snacks
  app.get("/", { preHandler: [CheckSessionIdExists] }, async (req, res) => {
    const { sessionId } = req.cookies;
    const snacks = await knex("snacks").where("session_id", sessionId);

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
  app.post("/", { preHandler: [CheckSessionIdExists] }, async (req, res) => {
    const createSnackBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_and_time: z.string(),
      In_Diet: z.boolean(),
    });
    cosnt { name, description, date_and_time, in_dietcreateSnackBodySchema.parse(req.body);
  });
}
