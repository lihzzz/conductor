export const IPC_CHANNELS = {
  CREATE_TEAM: "team:create",
  GET_TEAMS: "team:list",
  START_AGENT: "agent:start",
  STOP_AGENT: "agent:stop",
  SEND_AGENT_INPUT: "agent:input",
  SEND_DIRECT_MESSAGE: "message:direct",
  SEND_BROADCAST_MESSAGE: "message:broadcast",
  GET_DASHBOARD_STATE: "dashboard:state",
  AGENT_OUTPUT: "agent:output",
  AGENT_EXIT: "agent:exit",
} as const;
