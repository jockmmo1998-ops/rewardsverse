import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
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
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        {showDashboardTicker && <LiveActivityBar />}
        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: .2, ease: [0.23, 1, 0.32, 1] }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <AppFooter />
      </div>
      <WithdrawalStatusToast />
    </div>
  );
}
