interface Message {
  id: string;
  type: "direct" | "broadcast";
  fromAgentId: string;
  toAgentId: string | null;
  content: string;
  createdAt: string;
}

interface Agent {
  id: string;
  role: string;
  status: "idle" | "busy" | "offline";
}

interface MessagePanelProps {
  messages: Message[];
  agents: Agent[];
  fromAgent: string;
  toAgent: string;
  messageText: string;
  onFromAgentChange: (value: string) => void;
  onToAgentChange: (value: string) => void;
  onMessageTextChange: (value: string) => void;
  onSendDirect: () => void;
  onSendBroadcast: () => void;
}

export function MessagePanel({
  messages,
  agents,
  fromAgent,
  toAgent,
  messageText,
  onFromAgentChange,
  onToAgentChange,
  onMessageTextChange,
  onSendDirect,
  onSendBroadcast,
}: MessagePanelProps): JSX.Element {
  return (
    <div className="message-panel">
      <h3>Messages</h3>

      <div className="message-list">
        {messages.length === 0 && <div className="empty-message">No messages yet</div>}
        {messages.map((msg) => (
          <div key={msg.id} className="message-item">
            <span className="message-type">{msg.type === "direct" ? "Direct" : "Broadcast"}</span>
            <span className="message-from">{msg.fromAgentId}</span>
            <span className="message-arrow">→</span>
            <span className="message-to">{msg.toAgentId ?? "ALL"}</span>
            <span className="message-content">{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="message-input-area">
        <div className="message-selects">
          <select value={fromAgent} onChange={(e) => onFromAgentChange(e.target.value)}>
            <option value="">From</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.id}</option>
            ))}
          </select>
          <select value={toAgent} onChange={(e) => onToAgentChange(e.target.value)}>
            <option value="">To</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.id}</option>
            ))}
          </select>
        </div>
        <input
          value={messageText}
          onChange={(e) => onMessageTextChange(e.target.value)}
          placeholder="Message content"
          onKeyDown={(e) => e.key === "Enter" && onSendDirect()}
        />
        <div className="message-buttons">
          <button onClick={onSendDirect} disabled={!fromAgent || !toAgent || !messageText.trim()}>
            Direct
          </button>
          <button className="secondary" onClick={onSendBroadcast} disabled={!fromAgent || !messageText.trim()}>
            Broadcast
          </button>
        </div>
      </div>
    </div>
  );
}