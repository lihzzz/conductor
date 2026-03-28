export {};

declare global {
  interface Window {
    conductorApi: {
      createTeam(input: {
        name: string;
        workspaceRoot: string;
      }): Promise<{ teamId: string; agentIds: string[] }>;
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
        teams: Array<{ id: string; name: string; workspace_root: string; created_at: string }>;
        agents: Array<{
          id: string;
          team_id: string;
          name: string;
          role: "lead" | "research" | "dev" | "review" | "test";
          status: "idle" | "busy" | "offline";
          pid: number | null;
        }>;
        messages: Array<{
          id: string;
          fromAgentId: string;
          toAgentId: string | null;
          type: "direct" | "broadcast";
          content: string;
          createdAt: string;
        }>;
        events: Array<{
          id: string;
          eventType: string;
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