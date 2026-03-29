import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeamListPage.css';

export function TeamListPage(): JSX.Element {
  const [workspace, setWorkspace] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateTeam = async () => {
    if (!workspace.trim()) return;

    setIsCreating(true);
    try {
      const result = await window.conductorApi?.createTeam?.({
        name: '新团队',
        workspaceRoot: workspace,
      });

      if (result?.teamId) {
        navigate(`/team/${result.teamId}`);
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('创建团队失败，请检查 workspace 路径');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="team-list-page">
      <div className="welcome-section">
        <h1 className="welcome-title">欢迎来到 Conductor</h1>
        <p className="welcome-subtitle">
          创建你的第一个 AI 协作团队，让多个 Agent 像群聊一样协同工作
        </p>
      </div>

      <div className="create-team-card">
        <div className="card-header">
          <span className="card-icon">🚀</span>
          <h2 className="card-title">创建新团队</h2>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="workspace">
            工作目录路径
          </label>
          <input
            id="workspace"
            type="text"
            className="form-input"
            placeholder="/Users/username/projects/my-project"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
          />
          <p className="form-hint">
            输入项目所在的绝对路径，Agent 将在此目录下工作
          </p>
        </div>

        <button
          className="btn-create"
          onClick={handleCreateTeam}
          disabled={!workspace.trim() || isCreating}
        >
          {isCreating ? (
            <>
              <span className="spinner" />
              创建中...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
              </svg>
              创建团队
            </>
          )}
        </button>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <span className="feature-icon">💬</span>
          <h3 className="feature-title">群组协作</h3>
          <p className="feature-desc">
            像群聊一样与多个 AI Agent 交流，支持 @提及指定成员
          </p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🖥️</span>
          <h3 className="feature-title">终端集成</h3>
          <p className="feature-desc">
            内置终端实时查看每个 Agent 的执行过程和输出
          </p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">👥</span>
          <h3 className="feature-title">角色分工</h3>
          <p className="feature-desc">
            为 Agent 分配不同角色：架构师、开发、测试等
          </p>
        </div>
      </div>
    </div>
  );
}
