import { Outlet } from 'react-router-dom';
import { TeamSidebar } from './TeamSidebar';
import './Layout.css';

export function Layout(): JSX.Element {
  return (
    <div className="layout">
      <TeamSidebar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
