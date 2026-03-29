import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TeamListPage } from './pages/TeamListPage';
import { TeamChatPage } from './pages/TeamChatPage';
import { AgentDetailPage } from './pages/AgentDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <TeamListPage />,
      },
      {
        path: 'team/:teamId',
        element: <TeamChatPage />,
      },
      {
        path: 'team/:teamId/agent/:agentId',
        element: <AgentDetailPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
