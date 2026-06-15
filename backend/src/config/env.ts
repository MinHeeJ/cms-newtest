import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().default("./backend/data/idea-notebook.sqlite"),
  CORS_ORIGIN: z.string().default("http://localhost:5173")
});

export type Env = z.infer<typeof schema>;

export const env: Env = schema.parse(process.env);
