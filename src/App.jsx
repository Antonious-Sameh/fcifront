import React, { Suspense, lazy } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import { LanguageProvider } from '@/context/LanguageContext.jsx';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { NotificationsProvider } from '@/context/NotificationsContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';

// ── Student Pages ──────────────────────────────────────────────────
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import HomePage from '@/pages/HomePage.jsx';
import UniversityPage from '@/pages/UniversityPage.jsx';
import TermsPage from '@/pages/TermsPage.jsx';
import SubjectsListPage from '@/pages/SubjectsListPage.jsx';
import SubjectDetailPage from '@/pages/SubjectDetailPage.jsx';
import CoursesPage from '@/pages/CoursesPage.jsx';
import MyCoursesPage from '@/pages/MyCoursesPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import CareerQuizPage from '@/pages/CareerQuizPage.jsx';
import CareersPage from '@/pages/CareersPage.jsx';
import CareerDetailPage from '@/pages/CareerDetailPage.jsx';
import DepartmentsPage from '@/pages/DepartmentsPage.jsx';
import DepartmentDetailPage from '@/pages/DepartmentDetailPage.jsx';
import CourseContentPage from '@/pages/CourseContentPage.jsx';
import NotFoundPage from '@/pages/NotFoundPage.jsx';

// ── Admin Pages (lazy loaded — لا تُحمَّل إلا عند الحاجة) ──────────
const AdminOverviewPage    = lazy(() => import('@/pages/admin/AdminOverviewPage.jsx'));
const AdminUsersPage       = lazy(() => import('@/pages/admin/AdminUsersPage.jsx'));
const AdminCoursesPage     = lazy(() => import('@/pages/admin/AdminCoursesPage.jsx'));
const AdminActivationPage  = lazy(() => import('@/pages/admin/AdminActivationPage.jsx'));
const AdminRequestsPage    = lazy(() => import('@/pages/admin/AdminRequestsPage.jsx'));
const AdminContentPage     = lazy(() => import('@/pages/admin/AdminContentPage.jsx'));
const AdminCareersPage     = lazy(() => import('@/pages/admin/AdminCareersPage.jsx'));
const AdminDepartmentsPage = lazy(() => import('@/pages/admin/AdminDepartmentsPage.jsx'));

const PageLoader = () => (
  <div className="flex flex-col gap-4 p-8">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-48 w-full rounded-2xl" />
    <Skeleton className="h-32 w-full rounded-2xl" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ThemeProvider>
          <LanguageProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Routes */}
                <Route path="/" element={<ProtectedRoute requiredRole="student"><HomePage /></ProtectedRoute>} />
                <Route path="/university" element={<ProtectedRoute requiredRole="student"><UniversityPage /></ProtectedRoute>} />
                <Route path="/university/:year" element={<ProtectedRoute requiredRole="student"><TermsPage /></ProtectedRoute>} />
                <Route path="/university/:year/:term" element={<ProtectedRoute requiredRole="student"><SubjectsListPage /></ProtectedRoute>} />
                <Route path="/university/:year/:term/:subject" element={<ProtectedRoute requiredRole="student"><SubjectDetailPage /></ProtectedRoute>} />
                <Route path="/courses" element={<ProtectedRoute requiredRole="student"><CoursesPage /></ProtectedRoute>} />
                <Route path="/my-courses" element={<ProtectedRoute requiredRole="student"><MyCoursesPage /></ProtectedRoute>} />
                <Route path="/my-courses/:courseId" element={<ProtectedRoute requiredRole="student"><CourseContentPage /></ProtectedRoute>} />
                <Route path="/careers" element={<ProtectedRoute requiredRole="student"><CareersPage /></ProtectedRoute>} />
                <Route path="/careers/:careerPath" element={<ProtectedRoute requiredRole="student"><CareerDetailPage /></ProtectedRoute>} />
                <Route path="/departments" element={<ProtectedRoute requiredRole="student"><DepartmentsPage /></ProtectedRoute>} />
                <Route path="/departments/:departmentId" element={<ProtectedRoute requiredRole="student"><DepartmentDetailPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute requiredRole="student"><ProfilePage /></ProtectedRoute>} />
                <Route path="/career-quiz" element={<ProtectedRoute requiredRole="student"><CareerQuizPage /></ProtectedRoute>} />

                {/* Admin Routes — lazy loaded */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<PageLoader />}><AdminOverviewPage /></Suspense></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense></ProtectedRoute>} />
                <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<PageLoader />}><AdminCoursesPage /></Suspense></ProtectedRoute>} />
                <Route path="/admin/activation" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<PageLoader />}><AdminActivationPage /></Suspense></ProtectedRoute>} />
                <Route path="/admin/requests" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<PageLoader />}><AdminRequestsPage /></Suspense></ProtectedRoute>} />
                <Route path="/admin/content" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<PageLoader />}><AdminContentPage /></Suspense></ProtectedRoute>} />
                <Route path="/admin/careers" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<PageLoader />}><AdminCareersPage /></Suspense></ProtectedRoute>} />
                <Route path="/admin/departments" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<PageLoader />}><AdminDepartmentsPage /></Suspense></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <Toaster />
            </Router>
          </LanguageProvider>
        </ThemeProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;