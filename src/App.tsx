import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { PageLoader } from './components/ui/Loader';
import { useAuth } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

const BookingPage = lazy(() => import('./pages/BookingPage').then((m) => ({ default: m.BookingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const ProfessionalDashboardPage = lazy(() => import('./pages/ProfessionalDashboardPage').then((m) => ({ default: m.ProfessionalDashboardPage })));

function SuspenseWrap({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/:slug', element: <ServiceDetailsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'book/:slug', element: <SuspenseWrap><BookingPage /></SuspenseWrap> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><SuspenseWrap><DashboardPage /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: 'admin',
        element: <ProtectedRoute><SuspenseWrap><AdminDashboardPage /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: 'pro/dashboard',
        element: <ProtectedRoute><SuspenseWrap><ProfessionalDashboardPage /></SuspenseWrap></ProtectedRoute>,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/login',
    element: <SuspenseWrap><LoginPage /></SuspenseWrap>,
  },
  {
    path: '/register',
    element: <SuspenseWrap><RegisterPage /></SuspenseWrap>,
  },
  {
    path: '/forgot-password',
    element: <SuspenseWrap><ForgotPasswordPage /></SuspenseWrap>,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
