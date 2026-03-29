import { useState, useRef, useCallback } from 'react';
import type { Agent } from '../../types';
import './ChatInput.css';

interface ChatInputProps {
  agents: Agent[];
  onSendMessage: (content: string, mentions: string[]) => void;
}

export function ChatInput({ agents, onSendMessage }: ChatInputProps): JSX.Element {
  const [input, setInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setInput(value);
    setCursorPosition(position);

    // Check if we should show mention dropdown
    const textBeforeCursor = value.slice(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show if no space in query
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (agent: Agent) => {
    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textBeforeAt = textBeforeCursor.slice(0, lastAtIndex);
    const textAfterCursor = input.slice(cursorPosition);

    const newInput = `${textBeforeAt}@${agent.name} ${textAfterCursor}`;
    setInput(newInput);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    // Extract mentions
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(input)) !== null) {
      const agentName = match[1];
      const agent = agents.find(a => a.name === agentName);
      if (agent) {
        mentions.push(agent.id);
      }
    }

    onSendMessage(input, mentions);
    setInput('');
    setShowMentions(false);
  }, [input, agents, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    agent.role.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const onlineAgents = agents.filter(a => a.status !== 'offline');

  return (
    <div className="chat-input-container">
      {showMentions && (
        <div className="mention-dropdown">
          <div className="mention-header">
            <span>选择 Agent</span>
            <span className="mention-hint">按 Enter 选择</span>
          </div>
          {filteredAgents.length > 0 ? (
            <ul className="mention-list">
              {filteredAgents.map(agent => (
                <li
                  key={agent.id}
                  className="mention-item"
                  onClick={() => handleMentionSelect(agent)}
                >
                  <div
                    className="mention-avatar"
                    style={{ backgroundColor: getAgentColor(agent.role) }}
                  >
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="mention-info">
                    <span className="mention-name">{agent.name}</span>
                    <span className="mention-role">{agent.role}</span>
                  </div>
                  <span
                    className={`mention-status ${agent.status}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mention-empty">未找到匹配的 Agent</div>
          )}
        </div>
      )}

      <div className="chat-input-wrapper">
        <div className="input-actions">
          <button className="btn-action" title="添加附件">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z" />
            </svg>
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={`输入消息，使用 @ 提及 Agent (${onlineAgents.length} 在线)...`}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <button
          className="btn-send"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
          </svg>
        </button>
      </div>

      <div className="input-hint">
        <span>按 Enter 发送</span>
        <span className="hint-separator">·</span>
        <span>@ 提及 Agent</span>
      </div>
    </div>
  );
}

function getAgentColor(role: string): string {
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
}
