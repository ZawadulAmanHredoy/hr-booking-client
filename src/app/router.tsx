import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/components/shared/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'hr',
        element: (
          <PlaceholderPage
            title="HR professionals"
            description="Browse and search verified HR consultants."
          />
        ),
      },
      {
        path: 'about',
        element: (
          <PlaceholderPage
            title="About"
            description="Learn more about the HR Booking platform."
          />
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
