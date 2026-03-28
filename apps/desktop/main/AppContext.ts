import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { AppDatabase } from "./db/Database";
import { AppRepository } from "./repositories/AppRepository";
import { MessageRouterService } from "./services/message/MessageRouterService";
import { AgentRuntimeService } from "./services/runtime/AgentRuntimeService";
import { TeamService } from "./services/team/TeamService";

export type AppContext = {
  database: AppDatabase;
  repository: AppRepository;
  runtime: AgentRuntimeService;
  messages: MessageRouterService;
  teams: TeamService;
};

export function createAppContext(): AppContext {
  const dbDir = path.join(os.homedir(), ".conductor");
  fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, "conductor.db");
  const database = new AppDatabase(dbPath);
  const repository = new AppRepository(database);
  const runtime = new AgentRuntimeService();
  const messages = new MessageRouterService(repository);
  const teams = new TeamService(repository);

  return {
    database,
    repository,
    runtime,
    messages,
    teams,
  };
}