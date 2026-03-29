import type { Message, Agent } from '../../types';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  agent?: Agent;
  onAgentClick: (agentId: string) => void;
}

export function MessageBubble({
  message,
  agent,
  onAgentClick,
}: MessageBubbleProps): JSX.Element {
  const isUser = message.fromAgentId === 'user';
  const isBroadcast = message.type === 'broadcast';

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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Code block
      if (line.startsWith('```')) {
        return (
          <pre key={index} className="code-block">
            <code>{line.replace(/```/g, '')}</code>
          </pre>
        );
      }
      // Inline code
      if (line.includes('`')) {
        const parts = line.split(/(`[^`]+`)/);
        return (
          <p key={index}>
            {parts.map((part, i) =>
              part.startsWith('`') && part.endsWith('`') ? (
                <code key={i} className="inline-code">
                  {part.slice(1, -1)}
                </code>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      // Tool call indicator
      if (line.startsWith('⚙️')) {
        return (
          <div key={index} className="tool-call">
            <span className="tool-icon">⚙️</span>
            <span className="tool-name">{line.replace('⚙️', '').trim()}</span>
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index}>{line}</p>;
    });
  };

  if (isUser) {
    return (
      <div className="message-bubble user">
        <div className="message-content">
          <div className="message-text">{renderContent(message.content)}</div>
          <div className="message-meta">
            <span className="message-time">{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-bubble agent ${isBroadcast ? 'broadcast' : ''}`}>
      <button
        className="agent-avatar-btn"
        onClick={() => onAgentClick(message.fromAgentId)}
      >
        <div
          className="agent-avatar"
          style={{ backgroundColor: getAgentColor(agent?.role) }}
        >
          {agent?.name.charAt(0).toUpperCase() || '?'}
        </div>
      </button>

      <div className="message-wrapper">
        <div className="message-header">
          <span className="agent-name">{agent?.name || 'Unknown'}</span>
          <span className="agent-role">{agent?.role || 'Agent'}</span>
          {isBroadcast && <span className="broadcast-badge">所有人</span>}
        </div>

        <div className="message-content">
          <div className="message-text">{renderContent(message.content)}</div>

          {(message.tokenIn || message.tokenOut || message.cost) && (
            <div className="token-info">
              {message.tokenIn && (
                <span className="token-stat">
                  in: {message.tokenIn.toLocaleString()}
                </span>
              )}
              {message.tokenOut && (
                <span className="token-stat">
                  out: {message.tokenOut.toLocaleString()}
                </span>
              )}
              {message.cost && (
                <span className="token-stat cost">
                  ${message.cost.toFixed(4)}
                </span>
              )}
            </div>
          )}

          <div className="message-meta">
            <span className="message-time">{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
