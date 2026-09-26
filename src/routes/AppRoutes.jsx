import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import GuestsPage from '@/features/guests/GuestsPage'
import RoomsPage from '@/features/rooms/RoomsPage'
import ReservationsPage from '@/features/reservations/ReservationsPage'
import NfcManagementPage from '@/features/nfc/NfcManagementPage'
import PaymentsPage from '@/features/payments/PaymentsPage'
import TransactionsPage from '@/features/transactions/TransactionsPage'
import { NotificationsPage } from '@/features/notifications'
import ReportsPage from '@/features/reports/ReportsPage'
import SettingsPage from '@/features/settings/SettingsPage'
import { ROLES } from '@/lib/constants'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage />, handle: { title: 'Dashboard' } },
          { path: '/guests', element: <GuestsPage />, handle: { title: 'Guest Management' } },
          { path: '/rooms', element: <RoomsPage />, handle: { title: 'Room Management' } },
          { path: '/reservations', element: <ReservationsPage />, handle: { title: 'Reservations' } },
          { path: '/nfc', element: <NfcManagementPage />, handle: { title: 'NFC Management' } },
          { path: '/payments', element: <PaymentsPage />, handle: { title: 'Process Payment' } },
          { path: '/transactions', element: <TransactionsPage />, handle: { title: 'Transactions' } },
          { path: '/notifications', element: <NotificationsPage />, handle: { title: 'Notifications' } },
          {
            element: <ProtectedRoute roles={[ROLES.ADMIN]} />,
            children: [
              { path: '/reports', element: <ReportsPage />, handle: { title: 'Reports' } },
              { path: '/settings', element: <SettingsPage />, handle: { title: 'Settings' } },
            ],
          },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
