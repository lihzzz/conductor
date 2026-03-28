import { useCallback } from "react";
import { Terminal } from "./Terminal";

interface Agent {
  id: string;
  role: string;
  status: "idle" | "busy" | "offline";
}

interface AgentCardProps {
  agent: Agent;
  workspace?: string;
  onStart: (agentId: string) => void;
  onStop: (agentId: string) => void;
  onSendInput: (agentId: string, text: string) => void;
}

export function AgentCard({
  agent,
  workspace,
  onStart,
  onStop,
  onSendInput,
}: AgentCardProps): JSX.Element {
  // 稳定的输入处理函数
  const handleInput = useCallback(
    (data: string) => {
      onSendInput(agent.id, data);
    },
    [agent.id, onSendInput]
  );

  const statusColor = {
    idle: "#22c55e",
    busy: "#f59e0b",
    offline: "#94a3b8",
  }[agent.status];

  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <div className="agent-info">
          <span className="agent-name">{agent.id}</span>
          <span className="agent-role">({agent.role})</span>
        </div>
        <div className="agent-status-row">
          <span className="agent-status-dot" style={{ backgroundColor: statusColor }} />
          <span className="agent-status-text">{agent.status}</span>
        </div>
      </div>

      <div className="agent-card-actions">
        <button onClick={() => onStart(agent.id)} disabled={agent.status !== "offline"}>
          Start
        </button>
        <button className="secondary" onClick={() => onStop(agent.id)} disabled={agent.status === "offline"}>
          Stop
        </button>
      </div>

      <div className="terminal-wrapper">
        <Terminal
          agentId={agent.id}
          onInput={handleInput}
        />
      </div>
    </div>
  );
}