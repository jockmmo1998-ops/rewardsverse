import React, { lazy, Suspense, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from './components/layouts/AppLayout';

const HomePage         = lazy(() => import('./pages/HomePage'));
const AuthPage         = lazy(() => import('./pages/AuthPage'));
const OnboardingPage   = lazy(() => import('./pages/OnboardingPage'));
const OfferWallPage    = lazy(() => import('./pages/OfferWallFullPage'));
const PasswordRecoveryPage = lazy(() => import('./pages/PasswordRecoveryPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const OfferwallsPage   = lazy(() => import('./pages/OfferWalls'));
const LeaderboardPage  = lazy(() => import('./pages/LeaderboardPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const HistoryPage      = lazy(() => import('./pages/HistoryPage'));
const ReferralsPage    = lazy(() => import('./pages/ReferralsPage'));
const WithdrawPage     = lazy(() => import('./pages/WithdrawPage'));
const WalletPage       = lazy(() => import('./pages/WalletPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const SettingsPage     = lazy(() => import('./pages/SettingsPage'));
const SupportPage      = lazy(() => import('./pages/SupportPage'));
const PreviewPage      = lazy(() => import('./pages/PreviewPage'));
const AdminPage        = lazy(() => import('./pages/AdminPage'));
const AdminAccessPage  = lazy(() => import('./pages/AdminAccessPage'));
const LegalPage        = lazy(() => import('./pages/LegalPage'));

const PageFallback = () => <div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

function withLayout(Page: React.ComponentType): ReactNode {
  return <AppLayout><Suspense fallback={<PageFallback />}><Page /></Suspense></AppLayout>;
}

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Root', path: '/', element: <Navigate to="/home" replace />, public: true },
  { name: 'Preview', path: '/preview/*', element: <Suspense fallback={<PageFallback />}><PreviewPage /></Suspense>, public: true },
  { name: 'Login', path: '/login', element: <AuthPage />, public: true },
  { name: 'Register', path: '/register', element: <AuthPage />, public: true },
  { name: 'Onboarding', path: '/onboarding', element: withLayout(OnboardingPage) },
  { name: 'OfferwallPage', path: '/offerwalls/:wallId', element: <Suspense fallback={<PageFallback />}><OfferWallPage /></Suspense> },
  { name: 'ForgotPassword', path: '/forgot-password', element: <PasswordRecoveryPage />, public: true },
  { name: 'ResetPassword', path: '/reset-password', element: <PasswordRecoveryPage />, public: true },
  { name: 'VerifyEmail', path: '/verify-email', element: <VerifyEmailPage />, public: true },
  { name: 'Home', path: '/home', element: withLayout(HomePage), public: true },
  { name: 'Dashboard', path: '/dashboard', element: withLayout(DashboardPage) },
  { name: 'Offerwalls', path: '/offerwalls', element: withLayout(OfferwallsPage) },
  { name: 'Leaderboard', path: '/leaderboard', element: withLayout(LeaderboardPage) },
  { name: 'Achievements', path: '/achievements', element: withLayout(AchievementsPage) },
  { name: 'History', path: '/history', element: withLayout(HistoryPage) },
  { name: 'Referrals', path: '/referrals', element: withLayout(ReferralsPage) },
  { name: 'Withdraw', path: '/withdraw', element: withLayout(WithdrawPage) },
  { name: 'Wallet', path: '/wallet', element: withLayout(WalletPage) },
  { name: 'Profile', path: '/profile', element: withLayout(ProfilePage) },
  { name: 'Settings', path: '/settings', element: withLayout(SettingsPage) },
  { name: 'Support', path: '/support', element: withLayout(SupportPage), public: true },
  { name: 'Admin', path: '/admin', element: withLayout(AdminPage) },
  { name: 'AdminAccess', path: '/admin/login', element: withLayout(AdminAccessPage) },
  { name: 'Privacy', path: '/privacy', element: withLayout(LegalPage), public: true },
  { name: 'Terms', path: '/terms', element: withLayout(LegalPage), public: true },
  { name: 'Cookies', path: '/cookies', element: withLayout(LegalPage), public: true },
  { name: 'RewardPolicy', path: '/reward-policy', element: withLayout(LegalPage), public: true },
  { name: 'WithdrawalPolicy', path: '/withdrawal-policy', element: withLayout(LegalPage), public: true },
  { name: 'FAQ', path: '/faq', element: withLayout(LegalPage), public: true },
];
