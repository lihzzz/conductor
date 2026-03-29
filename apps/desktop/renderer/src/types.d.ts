export {};

declare global {
  interface Window {
    conductorApi: {
      createTeam(input: {
        name: string;
        workspaceRoot: string;
      }): Promise<{ teamId: string; agentIds: string[] }>;
      getTeams(): Promise<{ teams: Array<{
        id: string;
        name: string;
        workspaceRoot: string;
        createdAt: string;
        memberCount?: number;
        onlineCount?: number;
      }> }>;
      startAgent(input: { agentId: string; workspace: string }): Promise<{ pid: number }>;
      stopAgent(input: { agentId: string }): Promise<{ ok: true }>;
      sendAgentInput(input: { agentId: string; text: string }): Promise<{ ok: true }>;
      sendDirectMessage(input: {
        teamId: string;
        fromAgentId: string;
        toAgentId: string;
        content: string;
      }): Promise<unknown>;
      sendBroadcastMessage(input: {
        teamId: string;
        fromAgentId: string;
        content: string;
      }): Promise<unknown>;
      getDashboardState(input: { teamId: string }): Promise<{
        team: { id: string; name: string; workspaceRoot: string; createdAt: string };
        agents: Array<{
          id: string;
          teamId: string;
          name: string;
          role: string;
          status: "idle" | "busy" | "offline";
          pid: number | null;
        }>;
        messages: Array<{
          id: string;
          teamId: string;
          fromAgentId: string;
          toAgentId: string | null;
          type: "direct" | "broadcast";
          content: string;
          tokenIn?: number;
          tokenOut?: number;
          cost?: number;
          createdAt: string;
        }>;
        events: Array<{
          id: string;
          teamId: string;
          eventType: string;
          payload: string;
          createdAt: string;
        }>;
      }>;
      onAgentOutput(listener: (event: { agentId: string; chunk: string }) => void): () => void;
      onAgentExit(
        listener: (event: { agentId: string; exitCode: number; signal?: number }) => void
      ): () => void;
    };
  }
}