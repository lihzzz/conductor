import { randomUUID } from "node:crypto";
import { BrowserWindow, IpcMain } from "electron";
import { AppContext } from "../AppContext";
import { IPC_CHANNELS } from "./channels";
import {
  createTeamRequestSchema,
  dashboardStateRequestSchema,
  sendAgentInputRequestSchema,
  sendBroadcastMessageRequestSchema,
  sendDirectMessageRequestSchema,
  startAgentRequestSchema,
  stopAgentRequestSchema,
} from "./contracts";

export function registerIpcHandlers(
  ipcMain: IpcMain,
  context: AppContext,
  getMainWindow: () => BrowserWindow | null
): void {
  context.runtime.onOutput((event) => {
    getMainWindow()?.webContents.send(IPC_CHANNELS.AGENT_OUTPUT, event);
  });

  context.runtime.onExit((event) => {
    void handleAgentExit(event.agentId, event.exitCode, event.signal);
    getMainWindow()?.webContents.send(IPC_CHANNELS.AGENT_EXIT, event);
  });

  ipcMain.handle(IPC_CHANNELS.CREATE_TEAM, async (_event, input: unknown) => {
    const parsed = parseInput(createTeamRequestSchema, input);
    const result = context.teams.createTeam(parsed);
    context.repository.createEvent(result.teamId, "team_created", {
      workspaceRoot: parsed.workspaceRoot,
    });
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.START_AGENT, async (_event, input: unknown) => {
    const parsed = parseInput(startAgentRequestSchema, input);
    const pid = await context.runtime.startAgent(parsed.agentId, parsed.workspace);
    context.repository.setAgentRuntime(parsed.agentId, { status: "idle", pid });
    const teamId = context.repository.getAgentTeamId(parsed.agentId);
    if (teamId) {
      context.repository.createEvent(teamId, "agent_started", {
        agentId: parsed.agentId,
        workspace: parsed.workspace,
        pid,
      });
    }
    return { pid };
  });

  ipcMain.handle(IPC_CHANNELS.STOP_AGENT, async (_event, input: unknown) => {
    const parsed = parseInput(stopAgentRequestSchema, input);
    await context.runtime.stopAgent(parsed.agentId);
    context.repository.setAgentRuntime(parsed.agentId, { status: "offline", pid: null });
    const teamId = context.repository.getAgentTeamId(parsed.agentId);
    if (teamId) {
      context.repository.createEvent(teamId, "agent_stopped", { agentId: parsed.agentId });
    }
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.SEND_AGENT_INPUT, async (_event, input: unknown) => {
    const parsed = parseInput(sendAgentInputRequestSchema, input);
    context.runtime.sendInput(parsed.agentId, parsed.text);
    const teamId = context.repository.getAgentTeamId(parsed.agentId);
    if (teamId) {
      context.repository.createEvent(teamId, "agent_input_sent", { agentId: parsed.agentId });
    }
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.SEND_DIRECT_MESSAGE, async (_event, input: unknown) => {
    const parsed = parseInput(sendDirectMessageRequestSchema, input);
    const message = await context.messages.sendDirect(
      randomUUID(),
      parsed.teamId,
      parsed.fromAgentId,
      parsed.toAgentId,
      parsed.content
    );
    context.repository.createEvent(parsed.teamId, "direct_message_sent", {
      messageId: message.id,
      fromAgentId: parsed.fromAgentId,
      toAgentId: parsed.toAgentId,
    });
    return message;
  });

  ipcMain.handle(IPC_CHANNELS.SEND_BROADCAST_MESSAGE, async (_event, input: unknown) => {
    const parsed = parseInput(sendBroadcastMessageRequestSchema, input);
    const message = await context.messages.broadcast(
      randomUUID(),
      parsed.teamId,
      parsed.fromAgentId,
      parsed.content
    );
    context.repository.createEvent(parsed.teamId, "broadcast_message_sent", {
      messageId: message.id,
      fromAgentId: parsed.fromAgentId,
    });
    return message;
  });

  ipcMain.handle(IPC_CHANNELS.GET_DASHBOARD_STATE, async (_event, input: unknown) => {
    const parsed = parseInput(dashboardStateRequestSchema, input);
    const agents = context.repository.listTeamAgents(parsed.teamId);
    const messages = context.repository.listMessages(parsed.teamId);
    const events = context.repository.listEvents(parsed.teamId);
    return {
      teams: context.repository.listTeams(),
      agents,
      messages,
      events,
    };
  });

  async function handleAgentExit(
    agentId: string,
    exitCode: number,
    signal?: number
  ): Promise<void> {
    context.repository.setAgentRuntime(agentId, { status: "offline", pid: null });
    const teamId = context.repository.getAgentTeamId(agentId);

    if (teamId) {
      context.repository.createEvent(teamId, "agent_exited", {
        agentId,
        exitCode,
        signal: signal ?? null,
      });
    }
  }
}

function parseInput<T>(schema: { parse: (value: unknown) => T }, input: unknown): T {
  return schema.parse(input);
}
