import cookie from "@fastify/cookie";
import fastify from "fastify";
import { snacksRoutes } from "./routes/snacks";

const app = fastify();

app.register(cookie);
app.register(snacksRoutes);

export default app;