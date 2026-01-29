import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Guards
import { AuthGuard, GuestGuard, RoleGuard } from './guards';

// Templates/Layouts
import { MainLayout, AdminLayout, AuthLayout } from './components/templates';

// Auth Hook
import useAuth from './hooks/useAuth';

// Loading component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress />
  </Box>
);

// Lazy load pages for code splitting

// Public Pages
const HomePage = lazy(() => import('./components/pages/public/HomePage/HomePage'));
const AboutPage = lazy(() => import('./components/pages/public/AboutPage/AboutPage'));
const DoctrinePage = lazy(() => import('./components/pages/public/DoctrinePage/DoctrinePage'));
const ContactPage = lazy(() => import('./components/pages/public/ContactPage/ContactPage'));
const ChurchesPage = lazy(() => import('./components/pages/public/ChurchesPage/ChurchesPage'));
const ChurchDetailPage = lazy(() => import('./components/pages/public/ChurchDetailPage/ChurchDetailPage'));
const EventsPage = lazy(() => import('./components/pages/public/EventsPage/EventsPage'));
const EventDetailPage = lazy(() => import('./components/pages/public/EventDetailPage/EventDetailPage'));
const SermonsPage = lazy(() => import('./components/pages/public/SermonsPage/SermonsPage'));
const SermonDetailPage = lazy(() => import('./components/pages/public/SermonDetailPage/SermonDetailPage'));
const MinistriesPage = lazy(() => import('./components/pages/public/MinistriesPage/MinistriesPage'));

// Auth Pages
const LoginPage = lazy(() => import('./components/pages/auth/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./components/pages/auth/RegisterPage/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./components/pages/auth/ForgotPasswordPage/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('./components/pages/auth/VerifyEmailPage/VerifyEmailPage'));

// User Pages
const ProfilePage = lazy(() => import('./components/pages/user/ProfilePage/ProfilePage'));
const MyChurchesPage = lazy(() => import('./components/pages/user/MyChurchesPage/MyChurchesPage'));
const UserSettingsPage = lazy(() => import('./components/pages/user/SettingsPage/SettingsPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./components/pages/admin/DashboardPage/DashboardPage'));
const AdminUsersPage = lazy(() => import('./components/pages/admin/UsersPage/UsersPage'));
const AdminChurchesPage = lazy(() => import('./components/pages/admin/ChurchesPage/ChurchesPage'));
const AdminEventsPage = lazy(() => import('./components/pages/admin/EventsPage/EventsPage'));
const AdminSermonsPage = lazy(() => import('./components/pages/admin/SermonsPage/SermonsPage'));
const AdminMinistriesPage = lazy(() => import('./components/pages/admin/MinistriesPage/MinistriesPage'));
const AdminQuestionsPage = lazy(() => import('./components/pages/admin/QuestionsPage/QuestionsPage'));
const AdminMembershipsPage = lazy(() => import('./components/pages/admin/MembershipsPage/MembershipsPage'));
const AdminSettingsPage = lazy(() => import('./components/pages/admin/SettingsPage/SettingsPage'));

// Not Found Page
const NotFoundPage = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 2,
    }}
  >
    <Box component="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: 'text.secondary', m: 0 }}>
      404
    </Box>
    <Box component="p" sx={{ fontSize: '1.25rem', color: 'text.secondary' }}>
      Page not found
    </Box>
  </Box>
);

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  // Initialize auth listener
  const { isInitialized } = useAuth();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="doctrine" element={<DoctrinePage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="churches" element={<ChurchesPage />} />
            <Route path="churches/:slug" element={<ChurchDetailPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="sermons" element={<SermonsPage />} />
            <Route path="sermons/:id" element={<SermonDetailPage />} />
            <Route path="ministries" element={<MinistriesPage />} />
          </Route>

          {/* Auth Routes with AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route
              path="login"
              element={
                <GuestGuard>
                  <LoginPage />
                </GuestGuard>
              }
            />
            <Route
              path="register"
              element={
                <GuestGuard>
                  <RegisterPage />
                </GuestGuard>
              }
            />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* User Routes - Protected */}
          <Route element={<MainLayout />}>
            <Route
              path="profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />
            <Route
              path="my-churches"
              element={
                <AuthGuard>
                  <MyChurchesPage />
                </AuthGuard>
              }
            />
            <Route
              path="settings"
              element={
                <AuthGuard>
                  <UserSettingsPage />
                </AuthGuard>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['system_admin', 'admin', 'pastor', 'leader']}>
                  <AdminLayout />
                </RoleGuard>
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="churches" element={<AdminChurchesPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="sermons" element={<AdminSermonsPage />} />
            <Route path="ministries" element={<AdminMinistriesPage />} />
            <Route path="questions" element={<AdminQuestionsPage />} />
            <Route path="memberships" element={<AdminMembershipsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <MainLayout>
                <NotFoundPage />
              </MainLayout>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
