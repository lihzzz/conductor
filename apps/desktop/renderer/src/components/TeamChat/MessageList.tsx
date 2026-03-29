import type { Message, Agent } from '../../types';
import { MessageBubble } from './MessageBubble';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  agents: Agent[];
  onAgentClick: (agentId: string) => void;
}

export function MessageList({
  messages,
  agents,
  onAgentClick,
}: MessageListProps): JSX.Element {
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString('zh-CN');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="welcome-message">
          <span className="welcome-icon">👋</span>
          <h3>开始协作</h3>
          <p>在下方输入消息，使用 @ 提及 Agent</p>
          <div className="quick-tips">
            <div className="tip">
              <span className="tip-icon">@</span>
              <span>提及指定 Agent</span>
            </div>
            <div className="tip">
              <span className="tip-icon">▶</span>
              <span>点击底部终端查看执行</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="message-group">
          <div className="date-divider">
            <span className="date-label">{date}</span>
          </div>
          {dateMessages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              agent={agents.find(a => a.id === message.fromAgentId)}
              onAgentClick={onAgentClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
