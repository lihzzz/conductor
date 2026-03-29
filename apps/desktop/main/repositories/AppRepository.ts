import { randomUUID } from "node:crypto";
import { AppDatabase } from "../db/Database";
import { MessageRepository, RoutedMessage } from "../services/message/MessageRouterService";

type TeamRow = {
  id: string;
  name: string;
  workspace_root: string;
  created_at: string;
};

type AgentRow = {
  id: string;
  team_id: string;
  name: string;
  role: "lead" | "research" | "dev" | "review" | "test";
  status: "idle" | "busy" | "offline";
  pid: number | null;
  created_at: string;
};

export type AppEvent = {
  id: string;
  teamId: string;
  eventType: string;
  createdAt: string;
};

export class AppRepository implements MessageRepository {
  constructor(private readonly database: AppDatabase) {}

  createTeam(name: string, workspaceRoot: string): TeamRow {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    this.database.db
      .prepare(
        "INSERT INTO teams (id, name, workspace_root, created_at) VALUES (@id, @name, @workspaceRoot, @createdAt)"
      )
      .run({ id, name, workspaceRoot, createdAt });

    return {
      id,
      name,
      workspace_root: workspaceRoot,
      created_at: createdAt,
    };
  }

  listTeams(): TeamRow[] {
    return this.database.db.prepare("SELECT * FROM teams ORDER BY created_at DESC").all() as TeamRow[];
  }

  getTeam(teamId: string): TeamRow | undefined {
    return this.database.db.prepare("SELECT * FROM teams WHERE id = ? LIMIT 1").get(teamId) as TeamRow | undefined;
  }

  createAgent(teamId: string, name: string, role: AgentRow["role"]): AgentRow {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    this.database.db
      .prepare(
        "INSERT INTO agents (id, team_id, name, role, status, pid, created_at) VALUES (@id, @teamId, @name, @role, 'offline', NULL, @createdAt)"
      )
      .run({ id, teamId, name, role, createdAt });

    return {
      id,
      team_id: teamId,
      name,
      role,
      status: "offline",
      pid: null,
      created_at: createdAt,
    };
  }

  setAgentRuntime(agentId: string, patch: { status?: AgentRow["status"]; pid?: number | null }): void {
    const pairs: string[] = [];
    const values: Record<string, unknown> = { agentId };
    if (patch.status !== undefined) {
      pairs.push("status = @status");
      values.status = patch.status;
    }
    if (patch.pid !== undefined) {
      pairs.push("pid = @pid");
      values.pid = patch.pid;
    }
    if (pairs.length === 0) return;
    this.database.db.prepare(`UPDATE agents SET ${pairs.join(", ")} WHERE id = @agentId`).run(values);
  }

  listTeamAgents(teamId: string): AgentRow[] {
    return this.database.db
      .prepare("SELECT id, team_id, name, role, status, pid, created_at FROM agents WHERE team_id = ? ORDER BY created_at ASC")
      .all(teamId) as AgentRow[];
  }

  createMessage(message: RoutedMessage): Promise<void> {
    this.database.db
      .prepare(
        "INSERT INTO messages (id, team_id, from_agent_id, to_agent_id, type, content, delivery_status, created_at) VALUES (@id, @teamId, @fromAgentId, @toAgentId, @type, @content, @deliveryStatus, @createdAt)"
      )
      .run(message);
    return Promise.resolve();
  }

  markMessageStatus(messageId: string, status: RoutedMessage["deliveryStatus"]): Promise<void> {
    this.database.db
      .prepare("UPDATE messages SET delivery_status = ? WHERE id = ?")
      .run(status, messageId);
    return Promise.resolve();
  }

  listMessages(teamId: string): RoutedMessage[] {
    return this.database.db
      .prepare(
        "SELECT id, team_id as teamId, from_agent_id as fromAgentId, to_agent_id as toAgentId, type, content, delivery_status as deliveryStatus, created_at as createdAt FROM messages WHERE team_id = ? ORDER BY created_at ASC"
      )
      .all(teamId) as RoutedMessage[];
  }

  getAgentTeamId(agentId: string): string | null {
    const row = this.database.db
      .prepare("SELECT team_id FROM agents WHERE id = ? LIMIT 1")
      .get(agentId) as { team_id: string } | undefined;
    return row?.team_id ?? null;
  }

  createEvent(teamId: string, eventType: string, payload: Record<string, unknown>): AppEvent {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    this.database.db
      .prepare(
        "INSERT INTO events (id, team_id, event_type, payload, created_at) VALUES (@id, @teamId, @eventType, @payload, @createdAt)"
      )
      .run({
        id,
        teamId,
        eventType,
        payload: JSON.stringify(payload),
        createdAt,
      });
    return { id, teamId, eventType, createdAt };
  }

  listEvents(teamId: string): AppEvent[] {
    const rows = this.database.db
      .prepare(
        "SELECT id, team_id, event_type, created_at FROM events WHERE team_id = ? ORDER BY created_at DESC LIMIT 200"
      )
      .all(teamId) as Array<{
      id: string;
      team_id: string;
      event_type: string;
      created_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      teamId: row.team_id,
      eventType: row.event_type,
      createdAt: row.created_at,
    }));
  }
}