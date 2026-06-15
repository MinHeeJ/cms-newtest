import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { env } from "../config/env";

let database: DatabaseSync | null = null;

const resolveDatabasePath = (databaseUrl: string) => {
  if (databaseUrl === ":memory:") {
    return databaseUrl;
  }

  const path = databaseUrl.startsWith("file:") ? databaseUrl.slice("file:".length) : databaseUrl;
  return resolve(process.cwd(), path);
};

export const getDatabase = () => {
  if (database) {
    return database;
  }

  const databasePath = resolveDatabasePath(env.DATABASE_URL);
  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON;");
  return database;
};
