import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Agent, Team } from '../types';
import './AgentDetailPage.css';

export function AgentDetailPage(): JSX.Element {
  const { teamId, agentId } = useParams<{ teamId: string; agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    messagesSent: 128,
    filesGenerated: 45,
    tokensConsumed: 45230,
    cost: 0.45,
  });

  const api = window.conductorApi;

  useEffect(() => {
    loadData();
  }, [teamId, agentId]);

  const loadData = async () => {
    if (!teamId || !agentId || !api) return;

    try {
      const state = await api.getDashboardState({ teamId });
      setTeam(state.team);
      setAgent(state.agents.find(a => a.id === agentId) || null);
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (!agent || !team || !api) return;
    await api.startAgent({ agentId: agent.id, workspace: team.workspaceRoot });
    await loadData();
  };

  const handleStop = async () => {
    if (!agent || !api) return;
    await api.stopAgent({ agentId: agent.id });
    await loadData();
  };

  const getAgentColor = (role?: string) => {
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

  const getStatusText = (status: Agent['status']) => {
    switch (status) {
      case 'idle':
        return '在线';
      case 'busy':
        return '忙碌';
      case 'offline':
        return '离线';
      default:
        return '未知';
    }
  };

  if (isLoading) {
    return (
      <div className="agent-detail-page loading">
        <div className="spinner-large" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="agent-detail-page error">
        <p>Agent 不存在</p>
        <button onClick={() => navigate(-1)}>返回</button>
      </div>
    );
  }

  return (
    <div className="agent-detail-page">
      {/* Header */}
      <header className="agent-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L6.06 7.5h7.19a.75.75 0 0 1 0 1.5H6.06l3.72 3.72a.75.75 0 0 1 0 1.06Z" />
          </svg>
        </button>

        <div className="agent-title">
          <h1>{agent.name}</h1>
          <span
            className="status-badge"
            style={{ color: getStatusColor(agent.status) }}
          >
            ● {getStatusText(agent.status)}
          </span>
        </div>
      </header>

      {/* Profile Section */}
      <section className="agent-profile">
        <div
          className="agent-avatar-large"
          style={{ backgroundColor: getAgentColor(agent.role) }}
        >
          {agent.name.charAt(0).toUpperCase()}
        </div>

        <div className="agent-info">
          <h2 className="agent-name">{agent.name}</h2>
          <p className="agent-role">{agent.role}</p>
          <p className="agent-status">
            状态: <span style={{ color: getStatusColor(agent.status) }}>{getStatusText(agent.status)}</span>
          </p>
          {team && (
            <p className="agent-workspace">
              工作目录: <code>{team.workspaceRoot}</code>
            </p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="agent-stats">
        <h3 className="section-title">
          <span className="section-icon">📊</span>
          今日统计
        </h3>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.messagesSent}</span>
            <span className="stat-label">消息发送</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.filesGenerated}</span>
            <span className="stat-label">代码生成</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.tokensConsumed.toLocaleString()}</span>
            <span className="stat-label">Token 消耗</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-value">${stats.cost.toFixed(2)}</span>
            <span className="stat-label">费用</span>
          </div>
        </div>
      </section>

      {/* Terminal Section */}
      <section className="agent-terminal-section">
        <h3 className="section-title">
          <span className="section-icon">🖥️</span>
          独立终端
        </h3>

        <div className="terminal-container-large">
          {agent.status === 'offline' ? (
            <div className="terminal-offline">
              <p>Agent 当前离线</p>
              <button className="btn-primary" onClick={handleStart}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
                </svg>
                启动 Agent
              </button>
            </div>
          ) : (
            <div className="terminal-mock-large">
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="command">claude</span>
              </div>
              <div className="terminal-line output">
                <span>正在初始化 Claude Code...</span>
              </div>
              <div className="terminal-line output">
                <span>工作目录: {team?.workspaceRoot}</span>
              </div>
              <div className="terminal-line">
                <span className="prompt">{'>'}</span>
                <span className="cursor">_</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <section className="agent-actions">
        {agent.status !== 'offline' ? (
          <>
            <button className="btn-action btn-stop" onClick={handleStop}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773a.75.75 0 0 0-1.06 1.06L6.94 8l-1.62 1.713a.75.75 0 1 0 1.06 1.06L8 9.06l1.713 1.713a.75.75 0 1 0 1.06-1.06L9.06 8l1.713-1.713a.75.75 0 0 0-1.06-1.06L8 6.94 6.287 5.227Z" />
              </svg>
              停止 Agent
            </button>
            <button className="btn-action btn-restart">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
              </svg>
              重启 Agent
            </button>
            <button className="btn-action btn-logs">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm12-1v14h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zm-1 0H2v14h9V1zM3 3.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
              </svg>
              查看日志
            </button>
          </>
        ) : (
          <button className="btn-action btn-restart" onClick={handleStart}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
            </svg>
            启动 Agent
          </button>
        )}
      </section>
    </div>
  );
}