import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { Team } from '../types';
import './TeamSidebar.css';

export function TeamSidebar(): JSX.Element {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await window.conductorApi?.getTeams?.();
      if (response) {
        setTeams(response.teams || []);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleCreateTeam = () => {
    navigate('/');
    // TODO: Trigger create team modal
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTeams = filteredTeams.filter(t => !t.lastMessage);
  const archivedTeams: Team[] = []; // TODO: Add archived flag to Team model

  return (
    <aside className="team-sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Conductor</h1>
        <button
          className="btn-new-team"
          onClick={handleCreateTeam}
          title="新建团队"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
          </svg>
        </button>
      </div>

      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.7422 10.3439C12.5329 9.2673 13 7.9382 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C7.9382 13 9.2673 12.5329 10.3439 11.7422L14.1464 15.5446C14.3417 15.7399 14.6583 15.7399 14.8536 15.5446C15.0488 15.3493 15.0488 15.0328 14.8536 14.8375L11.7422 10.3439ZM6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5Z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="搜索群组..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-content">
        {activeTeams.length > 0 && (
          <div className="team-section">
            <div className="section-header">
              <span className="section-icon">📁</span>
              <span className="section-title">我的团队</span>
            </div>
            <ul className="team-list">
              {activeTeams.map(team => (
                <li key={team.id}>
                  <NavLink
                    to={`/team/${team.id}`}
                    className={({ isActive }) =>
                      `team-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <div className="team-avatar">
                      <span className="team-icon">💬</span>
                      {team.onlineCount && team.onlineCount > 0 && (
                        <span className="online-badge">{team.onlineCount}</span>
                      )}
                    </div>
                    <div className="team-info">
                      <div className="team-name-row">
                        <span className="team-name">{team.name}</span>
                        <span className="team-time">
                          {team.lastMessage?.createdAt
                            ? formatTime(team.lastMessage.createdAt)
                            : ''}
                        </span>
                      </div>
                      <div className="team-meta">
                        <span className="team-members">
                          {team.memberCount || 0}成员
                          {team.onlineCount ? `·${team.onlineCount}在线` : ''}
                        </span>
                        {team.lastMessage && (
                          <span className="team-preview truncate">
                            {team.lastMessage.content.slice(0, 30)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {archivedTeams.length > 0 && (
          <div className="team-section">
            <div className="section-header">
              <span className="section-icon">📁</span>
              <span className="section-title">归档团队</span>
            </div>
            <ul className="team-list">
              {archivedTeams.map(team => (
                <li key={team.id}>
                  <NavLink
                    to={`/team/${team.id}`}
                    className="team-item archived"
                  >
                    <div className="team-avatar">
                      <span className="team-icon">💬</span>
                    </div>
                    <div className="team-info">
                      <span className="team-name">{team.name}</span>
                      <span className="team-status">已停止</span>
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {filteredTeams.length === 0 && (
          <div className="empty-state">
            <p>暂无团队</p>
            <p className="empty-hint">点击右上角 + 创建新团队</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
