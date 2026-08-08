import { lazy, Suspense, useEffect, type ReactNode } from 'react';
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
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

function safeLazy<T extends { [key: string]: any }>(
  importFn: () => Promise<T>,
  exportName: keyof T
) {
  return lazy(() =>
    importFn()
      .then((m) => {
        sessionStorage.removeItem('chunk_reload_retry');
        return { default: m[exportName] };
      })
      .catch((err) => {
        console.warn(`Dynamic import failed for ${String(exportName)}, auto-reloading:`, err);
        const reloads = parseInt(sessionStorage.getItem('chunk_reload_retry') || '0');
        if (reloads < 3) {
          sessionStorage.setItem('chunk_reload_retry', (reloads + 1).toString());
          window.location.reload();
          return new Promise<any>(() => {});
        } else {
          console.error("Max chunk reloads reached. Halting.");
          setTimeout(() => sessionStorage.removeItem('chunk_reload_retry'), 5000);
          return Promise.reject(err);
        }
      })
  );
}

const BookingPage = safeLazy(() => import('./pages/BookingPage'), 'BookingPage');
const DashboardPage = safeLazy(() => import('./pages/DashboardPage'), 'DashboardPage');
const AdminDashboardPage = safeLazy(() => import('./pages/AdminDashboardPage'), 'AdminDashboardPage');
const ProfessionalDashboardPage = safeLazy(() => import('./pages/ProfessionalDashboardPage'), 'ProfessionalDashboardPage');
const TaxiBookingPage = safeLazy(() => import('./pages/TaxiBookingPage'), 'TaxiBookingPage');
const StorePage = safeLazy(() => import('./pages/StorePage'), 'StorePage');
const CateringPage = safeLazy(() => import('./pages/CateringPage'), 'CateringPage');
const MealsPage = safeLazy(() => import('./pages/MealsPage'), 'MealsPage');
const StoreMyOrdersPage = safeLazy(() => import('./pages/StoreMyOrdersPage'), 'StoreMyOrdersPage');
const StoreOrderTrackingPage = safeLazy(() => import('./pages/StoreOrderTrackingPage'), 'StoreOrderTrackingPage');
const PaymentSuccessPage = safeLazy(() => import('./pages/PaymentSuccessPage'), 'PaymentSuccessPage');
const PaymentFailedPage = safeLazy(() => import('./pages/PaymentFailedPage'), 'PaymentFailedPage');
const MembershipsPage = safeLazy(() => import('./pages/MembershipsPage'), 'MembershipsPage');
const MembershipsInfoPage = safeLazy(() => import('./pages/MembershipsInfoPage'), 'MembershipsInfoPage');

function RouteErrorBoundary() {
  useEffect(() => {
    // Automatically reload silently when module update is detected
    // Prevent infinite loops by checking sessionStorage
    const reloads = parseInt(sessionStorage.getItem('error_reload_count') || '0');
    if (reloads < 3) {
      sessionStorage.setItem('error_reload_count', (reloads + 1).toString());
      const timer = setTimeout(() => {
        window.location.reload();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      console.error("Max reloads reached. Halting auto-reload to prevent infinite loop.");
      // Reset after some time so they can try again later
      setTimeout(() => sessionStorage.removeItem('error_reload_count'), 5000);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Updating application with latest changes...</p>
      </div>
    </div>
  );
}

function SuspenseWrap({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/:slug', element: <ServiceDetailsPage /> },
      { path: 'memberships', element: <SuspenseWrap><MembershipsPage /></SuspenseWrap> },
      { path: 'memberships-info', element: <SuspenseWrap><MembershipsInfoPage /></SuspenseWrap> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'taxi', element: <SuspenseWrap><TaxiBookingPage /></SuspenseWrap> },
      { path: 'catering', element: <SuspenseWrap><CateringPage /></SuspenseWrap> },
      { path: 'meals', element: <SuspenseWrap><MealsPage /></SuspenseWrap> },
      { path: 'store', element: <SuspenseWrap><StorePage /></SuspenseWrap> },
      { path: 'store/orders', element: <SuspenseWrap><StoreMyOrdersPage /></SuspenseWrap> },
      { path: 'store/order/:orderId', element: <SuspenseWrap><StoreOrderTrackingPage /></SuspenseWrap> },
      { path: 'book/:slug', element: <SuspenseWrap><BookingPage /></SuspenseWrap> },
      { path: 'payment/success', element: <SuspenseWrap><PaymentSuccessPage /></SuspenseWrap> },
      { path: 'payment/failed', element: <SuspenseWrap><PaymentFailedPage /></SuspenseWrap> },
      {
        path: 'dashboard',
        element: <ProtectedRoute allowedRoles={['customer']}><SuspenseWrap><DashboardPage /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']}><SuspenseWrap><AdminDashboardPage /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: 'pro/dashboard',
        element: <ProtectedRoute allowedRoles={['professional']}><SuspenseWrap><ProfessionalDashboardPage /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
