import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { AppLayout } from './components/layouts/AppLayout';
import { Navigate } from 'react-router-dom';

const HomePage         = lazy(() => import('./pages/HomePage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
// const EarnPage         = lazy(() => import('./pages/EarnPage'));
const OfferwallsPage   = lazy(() => import('./pages/OfferwallsPage'));
const LeaderboardPage  = lazy(() => import('./pages/LeaderboardPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const HistoryPage      = lazy(() => import('./pages/HistoryPage'));
const ReferralsPage    = lazy(() => import('./pages/ReferralsPage'));
const WithdrawPage     = lazy(() => import('./pages/WithdrawPage'));
const WalletPage       = lazy(() => import('./pages/WalletPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const SettingsPage     = lazy(() => import('./pages/SettingsPage'));
const SupportPage      = lazy(() => import('./pages/SupportPage'));
const AdminPage        = lazy(() => import('./pages/AdminPage'));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

function withLayout(Page: React.ComponentType): ReactNode {
  return (
    <AppLayout>
      <Suspense fallback={<PageFallback />}>
        <Page />
      </Suspense>
    </AppLayout>
  );
}

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Root',         path: '/',             element: <Navigate to="/home" replace />,            public: true },
  { name: 'Home',         path: '/home',         element: withLayout(HomePage),                       public: true },
  { name: 'Dashboard',    path: '/dashboard',    element: withLayout(DashboardPage),                  public: true },
// { name: 'Earn',         path: '/earn',         element: withLayout(EarnPage),                       public: true },
  { name: 'Offerwalls',   path: '/offerwalls',   element: withLayout(OfferwallsPage),                 public: true },
  { name: 'Leaderboard',  path: '/leaderboard',  element: withLayout(LeaderboardPage),                public: true },
  { name: 'Achievements', path: '/achievements', element: withLayout(AchievementsPage),               public: true },
  { name: 'History',      path: '/history',      element: withLayout(HistoryPage),                    public: true },
  { name: 'Referrals',    path: '/referrals',    element: withLayout(ReferralsPage),                  public: true },
  { name: 'Withdraw',     path: '/withdraw',     element: withLayout(WithdrawPage),                   public: true },
  { name: 'Wallet',       path: '/wallet',       element: withLayout(WalletPage),                     public: true },
  { name: 'Profile',      path: '/profile',      element: withLayout(ProfilePage),                    public: true },
  { name: 'Settings',     path: '/settings',     element: withLayout(SettingsPage),                   public: true },
  { name: 'Support',      path: '/support',      element: withLayout(SupportPage),                    public: true },
  { name: 'Admin',        path: '/admin',        element: withLayout(AdminPage),                      public: true },
];
