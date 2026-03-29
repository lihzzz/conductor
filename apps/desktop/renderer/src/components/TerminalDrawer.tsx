import { useState, useRef, useEffect } from 'react';
import type { Agent, Team } from '../types';
import './TerminalDrawer.css';

interface TerminalDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  agents: Agent[];
  activeAgentId: string | null;
  onAgentChange: (agentId: string) => void;
  team: Team;
  onStartAgent: (agentId: string) => void;
  onStopAgent: (agentId: string) => void;
}

export function TerminalDrawer({
  isOpen,
  onToggle,
  agents,
  activeAgentId,
  onAgentChange,
  team,
  onStartAgent,
  onStopAgent,
}: TerminalDrawerProps): JSX.Element {
  const [height, setHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const activeAgent = agents.find(a => a.id === activeAgentId);
  const onlineAgents = agents.filter(a => a.status !== 'offline');

  useEffect(() => {
    if (!activeAgentId && onlineAgents.length > 0) {
      onAgentChange(onlineAgents[0].id);
    }
  }, [agents, activeAgentId, onlineAgents, onAgentChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = startYRef.current - e.clientY;
      const newHeight = Math.max(150, Math.min(600, startHeightRef.current + delta));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, height]);

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

  return (
    <div
      ref={drawerRef}
      className={`terminal-drawer ${isOpen ? 'open' : ''}`}
      style={{ height: isOpen ? height : 'auto' }}
    >
      {/* Resize Handle */}
      {isOpen && (
        <div
          className={`resize-handle ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Toggle Bar */}
      <button className="terminal-toggle" onClick={onToggle}>
        <div className="toggle-icon">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M6 8L1 3h10L6 8z" />
          </svg>
        </div>
        <div className="toggle-content">
          {activeAgent ? (
            <>
              <span
                className="agent-indicator"
                style={{ backgroundColor: getAgentColor(activeAgent.role) }}
              />
              <span className="toggle-text">
                工作空间终端 关联 {activeAgent.name}，目录 {team.workspaceRoot}
              </span>
            </>
          ) : (
            <span className="toggle-text">工作空间终端（无在线 Agent）</span>
          )}
        </div>
      </button>

      {/* Terminal Content */}
      {isOpen && (
        <div className="terminal-content">
          {/* Agent Tabs */}
          <div className="terminal-tabs">
            {agents.map(agent => (
              <button
                key={agent.id}
                className={`terminal-tab ${agent.id === activeAgentId ? 'active' : ''}`}
                onClick={() => onAgentChange(agent.id)}
              >
                <span
                  className="tab-indicator"
                  style={{ backgroundColor: getAgentColor(agent.role) }}
                />
                <span className="tab-name">{agent.name}</span>
                <span
                  className="tab-status"
                  style={{ backgroundColor: getStatusColor(agent.status) }}
                />
                {agent.status === 'offline' && (
                  <span
                    className="tab-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartAgent(agent.id);
                    }}
                    title="启动"
                  >
                    ▶
                  </span>
                )}
                {agent.status !== 'offline' && (
                  <span
                    className="tab-action stop"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStopAgent(agent.id);
                    }}
                    title="停止"
                  >
                    ⏹
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Terminal Area */}
          <div className="terminal-area">
            {activeAgent?.status === 'offline' ? (
              <div className="terminal-placeholder">
                <p>Agent 已离线</p>
                <button
                  className="btn-start-agent"
                  onClick={() => activeAgentId && onStartAgent(activeAgentId)}
                >
                  启动 {activeAgent?.name}
                </button>
              </div>
            ) : (
              <div className="terminal-container">
                {/* TODO: Integrate xterm.js here */}
                <div className="terminal-mock">
                  <div className="terminal-line">
                    <span className="prompt">$</span>
                    <span className="command">claude</span>
                  </div>
                  <div className="terminal-line output">
                    <span>正在初始化 Claude Code...</span>
                  </div>
                  <div className="terminal-line output">
                    <span>工作目录: {team.workspaceRoot}</span>
                  </div>
                  <div className="terminal-line">
                    <span className="prompt">{'>'}</span>
                    <span className="cursor">_</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
