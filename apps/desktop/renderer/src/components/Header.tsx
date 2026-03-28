interface HeaderProps {
  workspace: string;
  teamId: string | null;
  hasAgents: boolean;
  onWorkspaceChange: (value: string) => void;
  onCreateTeam: () => void;
  onStartAll: () => void;
  onStopAll: () => void;
}

export function Header({
  workspace,
  teamId,
  hasAgents,
  onWorkspaceChange,
  onCreateTeam,
  onStartAll,
  onStopAll,
}: HeaderProps): JSX.Element {
  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>Conductor</h1>
      </div>
      <div className="header-controls">
        <input
          value={workspace}
          onChange={(e) => onWorkspaceChange(e.target.value)}
          placeholder="Workspace path"
          className="workspace-input"
        />
        <button onClick={onCreateTeam} disabled={!workspace.trim() || !!teamId}>
          Create Team
        </button>
        <button onClick={onStartAll} disabled={!hasAgents}>
          Start All
        </button>
        <button className="secondary" onClick={onStopAll} disabled={!hasAgents}>
          Stop All
        </button>
      </div>
    </header>
  );
}