import { contextBridge, ipcRenderer } from "electron";

const IPC_CHANNELS = {
  CREATE_TEAM: "team:create",
  START_AGENT: "agent:start",
  STOP_AGENT: "agent:stop",
  SEND_AGENT_INPUT: "agent:input",
  SEND_DIRECT_MESSAGE: "message:direct",
  SEND_BROADCAST_MESSAGE: "message:broadcast",
  GET_DASHBOARD_STATE: "dashboard:state",
  AGENT_OUTPUT: "agent:output",
  AGENT_EXIT: "agent:exit",
} as const;

const api = {
  createTeam: (input: { name: string; workspaceRoot: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.CREATE_TEAM, input),
  startAgent: (input: { agentId: string; workspace: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.START_AGENT, input),
  stopAgent: (input: { agentId: string }) => ipcRenderer.invoke(IPC_CHANNELS.STOP_AGENT, input),
  sendAgentInput: (input: { agentId: string; text: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.SEND_AGENT_INPUT, input),
  sendDirectMessage: (input: {
    teamId: string;
    fromAgentId: string;
    toAgentId: string;
    content: string;
  }) => ipcRenderer.invoke(IPC_CHANNELS.SEND_DIRECT_MESSAGE, input),
  sendBroadcastMessage: (input: { teamId: string; fromAgentId: string; content: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.SEND_BROADCAST_MESSAGE, input),
  getDashboardState: (input: { teamId: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_DASHBOARD_STATE, input),
  onAgentOutput: (listener: (event: { agentId: string; chunk: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { agentId: string; chunk: string }) =>
      listener(payload);
    ipcRenderer.on(IPC_CHANNELS.AGENT_OUTPUT, handler);
    return () => ipcRenderer.off(IPC_CHANNELS.AGENT_OUTPUT, handler);
  },
  onAgentOutputById: (agentId: string, listener: (chunk: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { agentId: string; chunk: string }) => {
      if (payload.agentId === agentId) {
        listener(payload.chunk);
      }
    };
    ipcRenderer.on(IPC_CHANNELS.AGENT_OUTPUT, handler);
    return () => ipcRenderer.off(IPC_CHANNELS.AGENT_OUTPUT, handler);
  },
  onAgentExit: (
    listener: (event: { agentId: string; exitCode: number; signal?: number }) => void
  ) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: { agentId: string; exitCode: number; signal?: number }
    ) => listener(payload);
    ipcRenderer.on(IPC_CHANNELS.AGENT_EXIT, handler);
    return () => ipcRenderer.off(IPC_CHANNELS.AGENT_EXIT, handler);
  },
};

contextBridge.exposeInMainWorld("conductorApi", api);
