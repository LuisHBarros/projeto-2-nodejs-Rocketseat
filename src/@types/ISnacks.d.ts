// eslint-disable-next-line
import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    snacks: {
      id: string;
      name: string;
      description: string;
      date_and_time: string;
      in_diet: boolean;
      session_id?: string;
    };
  }
}
