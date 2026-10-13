import React, { lazy, Suspense, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from './components/layouts/AppLayout';

const CHUNK_RELOAD_KEY = 'rewardsverse:chunk-reload';

function lazyWithChunkRecovery<T extends React.ComponentType<any>>(loader: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const module = await loader();
      try { sessionStorage.removeItem(CHUNK_RELOAD_KEY); } catch { /* storage may be unavailable */ }
      return module;
    } catch (error) {
      let alreadyRetried = false;
      try { alreadyRetried = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1'; } catch { /* storage may be unavailable */ }
      if (!alreadyRetried) {
        try { sessionStorage.setItem(CHUNK_RELOAD_KEY, '1'); } catch { /* storage may be unavailable */ }
        window.location.reload();
      }
      throw error;
    }
  });
}

const HomePage         = lazyWithChunkRecovery(() => import('./pages/HomePage'));
const AuthPage         = lazyWithChunkRecovery(() => import('./pages/AuthPage'));
const OnboardingPage   = lazyWithChunkRecovery(() => import('./pages/OnboardingPage'));
const OfferWallPage    = lazyWithChunkRecovery(() => import('./pages/OfferWallFullPage'));
const PasswordRecoveryPage = lazyWithChunkRecovery(() => import('./pages/PasswordRecoveryPage'));
const VerifyEmailPage = lazyWithChunkRecovery(() => import('./pages/VerifyEmailPage'));
const DashboardPage    = lazyWithChunkRecovery(() => import('./pages/DashboardPage'));
const OfferwallsPage   = lazyWithChunkRecovery(() => import('./pages/OfferWalls'));
const LeaderboardPage  = lazyWithChunkRecovery(() => import('./pages/LeaderboardPage'));
const AchievementsPage = lazyWithChunkRecovery(() => import('./pages/AchievementsPage'));
const HistoryPage      = lazyWithChunkRecovery(() => import('./pages/HistoryPage'));
const ReferralsPage    = lazyWithChunkRecovery(() => import('./pages/ReferralsPage'));
const WithdrawPage     = lazyWithChunkRecovery(() => import('./pages/WithdrawPage'));
const WalletPage       = lazyWithChunkRecovery(() => import('./pages/WalletPage'));
const ProfilePage      = lazyWithChunkRecovery(() => import('./pages/ProfilePage'));
const SettingsPage     = lazyWithChunkRecovery(() => import('./pages/SettingsPage'));
const SupportPage      = lazyWithChunkRecovery(() => import('./pages/SupportPage'));
const PreviewPage      = lazyWithChunkRecovery(() => import('./pages/PreviewPage'));
const AdminPage        = lazyWithChunkRecovery(() => import('./pages/AdminPage'));
const AdminAccessPage  = lazyWithChunkRecovery(() => import('./pages/AdminAccessPage'));
const LegalPage        = lazyWithChunkRecovery(() => import('./pages/LegalPage'));

const PageFallback = () => <div className="rv-page-loader" role="status" aria-label="Loading"><span className="rv-loader" /></div>;

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
