import { useNavigate } from 'react-router-dom';
import type { Team, Agent } from '../../types';
import './ChatHeader.css';

interface ChatHeaderProps {
  team: Team;
  agents: Agent[];
  onStartAll: () => void;
  onStopAll: () => void;
  onAgentClick: (agentId: string) => void;
}

export function ChatHeader({
  team,
  agents,
  onStartAll,
  onStopAll,
  onAgentClick,
}: ChatHeaderProps): JSX.Element {
  const navigate = useNavigate();
  const onlineCount = agents.filter(a => a.status !== 'offline').length;
  const busyCount = agents.filter(a => a.status === 'busy').length;

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'idle':
        return 'var(--status-online)';
      case 'busy':
        return 'var(--status-busy)';
      case 'offline':
        return 'var(--status-offline)';
      default:
        return 'var(--status-offline)';
    }
  };

  const getAgentColor = (role: string) => {
    switch (role) {
      case 'lead':
        return 'var(--agent-claude)';
      case 'dev':
        return 'var(--agent-codex)';
      case 'research':
        return 'var(--agent-gemini)';
      case 'review':
        return 'var(--agent-opencode)';
      case 'test':
        return 'var(--agent-copilot)';
      default:
        return 'var(--agent-default)';
    }
  };

  return (
    <header className="chat-header">
      <div className="header-left">
        <button
          className="btn-back"
          onClick={() => navigate('/')}
          title="返回"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L6.06 7.5h7.19a.75.75 0 0 1 0 1.5H6.06l3.72 3.72a.75.75 0 0 1 0 1.06Z" />
          </svg>
        </button>

        <div className="team-info">
          <h2 className="team-name">{team.name}</h2>
          <div className="team-meta">
            <span className="member-count">
              {agents.length}成员
              {onlineCount > 0 && `·${onlineCount}在线`}
            </span>
            {busyCount > 0 && (
              <span className="busy-count">{busyCount}忙碌</span>
            )}
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="agent-avatars">
          {agents.slice(0, 5).map(agent => (
            <button
              key={agent.id}
              className="agent-avatar-btn"
              onClick={() => onAgentClick(agent.id)}
              title={`${agent.name} (${agent.role})`}
            >
              <div
                className="agent-avatar"
                style={{ backgroundColor: getAgentColor(agent.role) }}
              >
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <span
                className="status-dot"
                style={{ backgroundColor: getStatusColor(agent.status) }}
              />
            </button>
          ))}
          {agents.length > 5 && (
            <span className="more-agents">+{agents.length - 5}</span>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="control-buttons">
          <button
            className="btn-control btn-start"
            onClick={onStartAll}
            disabled={onlineCount === agents.length}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
            </svg>
            启动全部
          </button>
          <button
            className="btn-control btn-stop"
            onClick={onStopAll}
            disabled={onlineCount === 0}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773a.75.75 0 0 0-1.06 1.06L6.94 8l-1.62 1.713a.75.75 0 1 0 1.06 1.06L8 9.06l1.713 1.713a.75.75 0 1 0 1.06-1.06L9.06 8l1.713-1.713a.75.75 0 0 0-1.06-1.06L8 6.94 6.287 5.227Z" />
            </svg>
            停止全部
          </button>
        </div>

        <button className="btn-settings" title="设置">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
