import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { HrDirectoryPage } from '@/pages/HrDirectoryPage'
import { ProfileDetailPage } from '@/pages/ProfileDetailPage'
import { ProfileOnboardingPage } from '@/pages/ProfileOnboardingPage'
import { ProfileManagePage } from '@/pages/ProfileManagePage'
import { AvailabilityPage } from '@/pages/AvailabilityPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { BookingDetailPage } from '@/pages/BookingDetailPage'
import { RequireAuth, RequireRole, RedirectIfAuthed } from '@/components/auth/guards'
import { PlaceholderPage } from '@/components/shared/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'login',
        element: (
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        ),
      },
      {
        path: 'register',
        element: (
          <RedirectIfAuthed>
            <RegisterPage />
          </RedirectIfAuthed>
        ),
      },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      {
        path: 'forgot-password',
        element: (
          <RedirectIfAuthed>
            <ForgotPasswordPage />
          </RedirectIfAuthed>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <RedirectIfAuthed>
            <ResetPasswordPage />
          </RedirectIfAuthed>
        ),
      },
      { path: 'hr', element: <HrDirectoryPage /> },
      { path: 'hr/:id', element: <ProfileDetailPage /> },
      {
        path: 'profile',
        element: (
          <RequireAuth>
            <ProfileOnboardingPage />
          </RequireAuth>
        ),
      },
      {
        path: 'profile/manage',
        element: (
          <RequireAuth>
            <ProfileManagePage />
          </RequireAuth>
        ),
      },
      {
        path: 'profile/availability',
        element: (
          <RequireRole roles={['HR']}>
            <AvailabilityPage />
          </RequireRole>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/bookings',
        element: (
          <RequireAuth>
            <BookingsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/bookings/:id',
        element: (
          <RequireAuth>
            <BookingDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: 'about',
        element: (
          <PlaceholderPage title="About" description="Learn more about the HR Booking platform." />
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
