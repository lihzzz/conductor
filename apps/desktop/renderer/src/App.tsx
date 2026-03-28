import { useEffect, useState, useCallback } from "react";
import { Header } from "./components/Header";
import { AgentCard } from "./components/AgentCard";
import { MessagePanel } from "./components/MessagePanel";
import { EventLog } from "./components/EventLog";

type DashboardState = Awaited<ReturnType<typeof window.conductorApi.getDashboardState>>;

export function App(): JSX.Element {
  const api = window.conductorApi;

  const [workspace, setWorkspace] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [state, setState] = useState<DashboardState | null>(null);

  const [fromAgent, setFromAgent] = useState("");
  const [toAgent, setToAgent] = useState("");
  const [messageText, setMessageText] = useState("");

  if (!api) {
    return (
      <div className="app-container">
        <section className="error-panel">
          <h2>Renderer Boot Error</h2>
          <p>window.conductorApi is missing. Preload script likely failed to load.</p>
        </section>
      </div>
    );
  }

  useEffect(() => {
    const unbindExit = api.onAgentExit(() => {
      if (teamId) refresh(teamId);
    });

    return () => {
      unbindExit();
    };
  }, [api, teamId]);

  const refresh = useCallback(async (id: string = teamId ?? "") => {
    if (!id || !api) return;
    const next = await api.getDashboardState({ teamId: id });
    setState(next);
    if (!fromAgent && next.agents[0]?.id) setFromAgent(next.agents[0].id);
    if (!toAgent && next.agents[1]?.id) setToAgent(next.agents[1].id);
  }, [api, teamId, fromAgent, toAgent]);

  const handleCreateTeam = useCallback(async () => {
    if (!workspace.trim() || !api) return;
    const result = await api.createTeam({
      name: "Team",
      workspaceRoot: workspace,
    });
    setTeamId(result.teamId);
    await refresh(result.teamId);
  }, [api, workspace, refresh]);

  const handleStartAgent = useCallback(async (agentId: string) => {
    if (!api) return;
    await api.startAgent({ agentId, workspace });
    await refresh();
  }, [api, workspace, refresh]);

  const handleStopAgent = useCallback(async (agentId: string) => {
    if (!api) return;
    await api.stopAgent({ agentId });
    await refresh();
  }, [api, refresh]);

  const handleSendInput = useCallback((agentId: string, text: string) => {
    if (!api) return;
    api.sendAgentInput({ agentId, text });
  }, [api]);

  const handleStartAll = useCallback(async () => {
    if (!state?.agents || !api) return;
    for (const agent of state.agents) {
      if (agent.status === "offline") {
        await api.startAgent({ agentId: agent.id, workspace });
      }
    }
    await refresh();
  }, [api, state, workspace, refresh]);

  const handleStopAll = useCallback(async () => {
    if (!state?.agents || !api) return;
    for (const agent of state.agents) {
      if (agent.status !== "offline") {
        await api.stopAgent({ agentId: agent.id });
      }
    }
    await refresh();
  }, [api, state, refresh]);

  const handleSendDirect = useCallback(async () => {
    if (!teamId || !fromAgent || !toAgent || !messageText.trim() || !api) return;
    await api.sendDirectMessage({
      teamId,
      fromAgentId: fromAgent,
      toAgentId: toAgent,
      content: messageText,
    });
    setMessageText("");
    await refresh();
  }, [api, teamId, fromAgent, toAgent, messageText, refresh]);

  const handleSendBroadcast = useCallback(async () => {
    if (!teamId || !fromAgent || !messageText.trim() || !api) return;
    await api.sendBroadcastMessage({
      teamId,
      fromAgentId: fromAgent,
      content: messageText,
    });
    setMessageText("");
    await refresh();
  }, [api, teamId, fromAgent, messageText, refresh]);

  const agents = state?.agents ?? [];
  const messages = state?.messages ?? [];
  const events = state?.events ?? [];

  return (
    <div className="app-container">
      <Header
        workspace={workspace}
        teamId={teamId}
        hasAgents={agents.length > 0}
        onWorkspaceChange={setWorkspace}
        onCreateTeam={handleCreateTeam}
        onStartAll={handleStartAll}
        onStopAll={handleStopAll}
      />

      <main className="app-main">
        {!teamId && (
          <div className="empty-state-full">Enter workspace path and click "Create Team" to start.</div>
        )}

        {teamId && (
          <>
            <div className="terminals-row">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  workspace={workspace}
                  onStart={handleStartAgent}
                  onStop={handleStopAgent}
                  onSendInput={handleSendInput}
                />
              ))}
            </div>

            <div className="sidebar">
              <MessagePanel
                messages={messages}
                agents={agents}
                fromAgent={fromAgent}
                toAgent={toAgent}
                messageText={messageText}
                onFromAgentChange={setFromAgent}
                onToAgentChange={setToAgent}
                onMessageTextChange={setMessageText}
                onSendDirect={handleSendDirect}
                onSendBroadcast={handleSendBroadcast}
              />
              <EventLog events={events} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}