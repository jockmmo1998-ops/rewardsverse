import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { LiveActivityBar } from './LiveActivityBar';
import { AppFooter } from './AppFooter';
import { WithdrawalStatusToast } from './WithdrawalStatusToast';
import { RegisterDialog } from './RegisterDialog';

export function AppLayout({ children }: { children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const isOfferLanding = location.pathname === '/home' || location.pathname === '/dashboard';
  const isSignedIn = Boolean(user);
  // Keep live social proof in the member workspace. Public visitors see a
  // focused landing page rather than a dense stream of repeated activity.
  const showLiveTicker = isSignedIn || isOfferLanding;

  const openRegister = useCallback(() => setRegisterOpen(true), []);
  const closeRegister = useCallback(() => setRegisterOpen(false), []);

  useEffect(() => {
    window.addEventListener('rv:open-register', openRegister);
    return () => window.removeEventListener('rv:open-register', openRegister);
  }, [openRegister]);

  useEffect(() => {
    if (!isOfferLanding || !isSignedIn) return;
    void utils.user.getFeaturedOffers.prefetch(undefined, {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: false,
    });
  }, [isOfferLanding, isSignedIn, utils]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [sidebarOpen]);

  return (
    <div className={`app-shell ${isOfferLanding ? 'app-shell-dashboard' : ''}`}>
      <div className="app-shell-background" aria-hidden="true" />
      <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main-column">
        <TopBar onMenuClick={() => setSidebarOpen((current) => !current)} sidebarOpen={sidebarOpen} />
        {showLiveTicker && <LiveActivityBar />}
        <main className="app-main-content">
          <div key={location.pathname} className="route-stage min-h-full">
            {children}
          </div>
        </main>
        <AppFooter />
      </div>
      <WithdrawalStatusToast />
      <RegisterDialog open={registerOpen} onClose={closeRegister} />
    </div>
  );
}
