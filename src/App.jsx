import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import { captureAttribution } from '@/lib/attribution';

const PageNotFound = lazy(() => import('./lib/PageNotFound'));
const Home = lazy(() => import('@/pages/Home'));
const Memberships = lazy(() => import('@/pages/Memberships'));
const Passes = lazy(() => import('@/pages/Passes'));
const PassDetail = lazy(() => import('@/pages/PassDetail'));
const Trainers = lazy(() => import('@/pages/Trainers'));
const TrainerDetail = lazy(() => import('@/pages/TrainerDetail'));
const ClassSchedule = lazy(() => import('@/pages/ClassSchedule'));
const PersonalTraining = lazy(() => import('@/pages/PersonalTraining'));
const Facilities = lazy(() => import('@/pages/Facilities'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const ArticleList = lazy(() => import('@/pages/ArticleList'));
const ArticleDetail = lazy(() => import('@/pages/ArticleDetail'));
const Admin = lazy(() => import('@/pages/Admin'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const LanguageEditionPage = lazy(() => import('@/pages/LanguageEditionPage'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-obsidian text-sm text-white/45">Loading…</div>}><Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/memberships" element={<Memberships />} />
        <Route path="/passes" element={<Passes />} />
        <Route path="/passes/:slug" element={<PassDetail />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/trainers/:slug" element={<TrainerDetail />} />
        <Route path="/classes/schedule" element={<ClassSchedule />} />
        <Route path="/personal-training" element={<PersonalTraining />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<ArticleList section="blog" />} />
        <Route path="/blog/:slug" element={<ArticleDetail section="blog" />} />
        <Route path="/fitness-guides" element={<ArticleList section="fitness-guides" />} />
        <Route path="/fitness-guides/:slug" element={<ArticleDetail section="fitness-guides" />} />
        <Route path="/workouts" element={<ArticleList section="workouts" />} />
        <Route path="/workouts/:slug" element={<ArticleDetail section="workouts" />} />
        <Route path="/fitness-tips" element={<ArticleList section="fitness-tips" />} />
        <Route path="/fitness-tips/:slug" element={<ArticleDetail section="fitness-tips" />} />
        <Route path="/privacy" element={<LegalPage slug="privacy" />} />
        <Route path="/terms" element={<LegalPage slug="terms" />} />
        <Route path="/:locale" element={<LanguageEditionPage pageKey="home" />} />
        <Route path="/:locale/memberships" element={<LanguageEditionPage pageKey="memberships" />} />
        <Route path="/:locale/passes" element={<LanguageEditionPage pageKey="passes" />} />
        <Route path="/:locale/personal-training" element={<LanguageEditionPage pageKey="personal_training" />} />
        <Route path="/:locale/classes/schedule" element={<LanguageEditionPage pageKey="class_schedule" />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes></Suspense>
  );
};


function App() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
