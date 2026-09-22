import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { LiveActivityBar } from './LiveActivityBar';
import { AppFooter } from './AppFooter';
import { WithdrawalStatusToast } from './WithdrawalStatusToast';

export function AppLayout({ children }: { children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const showDashboardTicker = location.pathname === '/home' || location.pathname === '/dashboard';

  return (
    <div className="app-shell flex min-h-screen w-full overflow-x-hidden">
      <div className="app-shell-background" aria-hidden="true" />
      <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 w-full max-w-full flex-1 flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        {showDashboardTicker && <LiveActivityBar />}
        <main className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden">
          <div key={location.pathname} className="min-h-full">
            {children}
          </div>
        </main>
        <AppFooter />
      </div>
      <WithdrawalStatusToast />
    </div>
  );
}
