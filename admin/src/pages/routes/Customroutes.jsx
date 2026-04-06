import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../../Layouts/Mainlayout';
import Notfound from '../Notfound';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminDashboardPage from '../admin/AdminDashboardPage';
import ChildrenPage from '../admin/ChildrenPage';
import EventsPage from '../admin/EventsPage';
import ExpensesPage from '../admin/ExpensesPage';
import VolunteersPage from '../admin/VolunteersPage';
import DonationsPage from '../admin/DonationsPage';
import BlockchainRecordsPage from '../admin/BlockchainRecordsPage';
import ReportsPage from '../admin/ReportsPage';

const protectedLayout = (
  <ProtectedRoute>
    <MainLayout />
  </ProtectedRoute>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/home',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: protectedLayout,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'children', element: <ChildrenPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'volunteers', element: <VolunteersPage /> },
      { path: 'donations', element: <DonationsPage /> },
      { path: 'blockchain-records', element: <BlockchainRecordsPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
  {
    path: '*',
    element: <Notfound />,
  },
]);

export default router;
