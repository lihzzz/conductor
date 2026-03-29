export interface Team {
  id: string;
  name: string;
  workspaceRoot: string;
  createdAt: string;
  memberCount?: number;
  onlineCount?: number;
  lastMessage?: Message;
}

export interface Agent {
  id: string;
  teamId: string;
  name: string;
  role: 'lead' | 'research' | 'dev' | 'review' | 'test' | string;
  status: 'idle' | 'busy' | 'offline';
  pid?: number;
  avatar?: string;
  color?: string;
  description?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  teamId: string;
  fromAgentId: string;
  toAgentId?: string;
  type: 'direct' | 'broadcast';
  content: string;
  deliveryStatus: 'queued' | 'delivered' | 'read';
  tokenIn?: number;
  tokenOut?: number;
  cost?: number;
  createdAt: string;
  fromAgent?: Agent;
}

export interface Task {
  id: string;
  teamId: string;
  title: string;
  description: string;
  status: 'pending' | 'claimed' | 'running' | 'completed' | 'failed';
  priority: number;
  assigneeAgentId?: string;
  riskLevel: 'low' | 'medium' | 'high';
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  teamId: string;
  eventType: string;
  payload: string;
  createdAt: string;
}

export interface TeamSettings {
  teamId: string;
  theme: 'dark' | 'light';
  layout: 'chat' | 'split';
  terminalHeight: number;
}

export interface AgentProfile {
  agentId: string;
  avatarUrl?: string;
  description?: string;
  skills: string[];
  color: string;
}

export interface DashboardState {
  team: Team;
  agents: Agent[];
  messages: Message[];
  events: Event[];
}
