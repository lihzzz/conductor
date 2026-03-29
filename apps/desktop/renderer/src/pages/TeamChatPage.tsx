import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Team, Agent, Message, DashboardState } from '../types';
import { ChatHeader } from '../components/TeamChat/ChatHeader';
import { MessageList } from '../components/TeamChat/MessageList';
import { ChatInput } from '../components/TeamChat/ChatInput';
import { TerminalDrawer } from '../components/TerminalDrawer';
import './TeamChatPage.css';

export function TeamChatPage(): JSX.Element {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState([]);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const api = window.conductorApi;

  const loadTeamData = useCallback(async () => {
    if (!teamId || !api) return;

    try {
      const state = await api.getDashboardState({ teamId });
      setTeam(state.team);
      setAgents(state.agents);
      setMessages(state.messages);
      setEvents(state.events);

      // Set first online agent as active for terminal
      const onlineAgent = state.agents.find(a => a.status !== 'offline');
      if (onlineAgent && !activeAgentId) {
        setActiveAgentId(onlineAgent.id);
      }
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, api, activeAgentId]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, mentions: string[]) => {
    if (!teamId || !content.trim() || !api) return;

    try {
      if (mentions.length > 0) {
        // Send direct message to first mentioned agent
        await api.sendDirectMessage({
          teamId,
          fromAgentId: 'user',
          toAgentId: mentions[0],
          content,
        });
      } else {
        // Broadcast to all
        await api.sendBroadcastMessage({
          teamId,
          fromAgentId: 'user',
          content,
        });
      }
      await loadTeamData();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleStartAgent = async (agentId: string) => {
    if (!team || !api) return;

    try {
      await api.startAgent({ agentId, workspace: team.workspaceRoot });
      await loadTeamData();
    } catch (error) {
      console.error('Failed to start agent:', error);
    }
  };

  const handleStopAgent = async (agentId: string) => {
    if (!api) return;

    try {
      await api.stopAgent({ agentId });
      await loadTeamData();
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  const handleStartAll = async () => {
    if (!team || !api) return;

    for (const agent of agents) {
      if (agent.status === 'offline') {
        await api.startAgent({ agentId: agent.id, workspace: team.workspaceRoot });
      }
    }
    await loadTeamData();
  };

  const handleStopAll = async () => {
    if (!api) return;

    for (const agent of agents) {
      if (agent.status !== 'offline') {
        await api.stopAgent({ agentId: agent.id });
      }
    }
    await loadTeamData();
  };

  const handleAgentClick = (agentId: string) => {
    navigate(`/team/${teamId}/agent/${agentId}`);
  };

  if (isLoading) {
    return (
      <div className="team-chat-page loading">
        <div className="spinner-large" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-chat-page error">
        <p>团队不存在或已被删除</p>
        <button onClick={() => navigate('/')}>返回首页</button>
      </div>
    );
  }

  return (
    <div className="team-chat-page">
      <ChatHeader
        team={team}
        agents={agents}
        onStartAll={handleStartAll}
        onStopAll={handleStopAll}
        onAgentClick={handleAgentClick}
      />

      <div className="chat-main">
        <MessageList
          messages={messages}
          agents={agents}
          onAgentClick={handleAgentClick}
        />
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        agents={agents}
        onSendMessage={handleSendMessage}
      />

      <TerminalDrawer
        isOpen={terminalOpen}
        onToggle={() => setTerminalOpen(!terminalOpen)}
        agents={agents}
        activeAgentId={activeAgentId}
        onAgentChange={setActiveAgentId}
        team={team}
        onStartAgent={handleStartAgent}
        onStopAgent={handleStopAgent}
      />
    </div>
  );
}
