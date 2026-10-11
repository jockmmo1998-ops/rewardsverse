import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { TopBar } from './TopBar';
import { LiveActivityBar } from './LiveActivityBar';
import { AppFooter } from './AppFooter';
import { WithdrawalStatusToast } from './WithdrawalStatusToast';

export function AppLayout({ children }: { children?: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const isOfferLanding = location.pathname === '/home' || location.pathname === '/dashboard';
  const isSignedIn = Boolean(user);
  const showLiveTicker = isSignedIn || isOfferLanding;
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const toggleMobileNav = useCallback(() => setMobileNavOpen((open) => !open), []);

  useEffect(() => {
    if (!isOfferLanding || !isSignedIn) return;
    void utils.user.getFeaturedOffers.prefetch(undefined, {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: false,
    });
  }, [isOfferLanding, isSignedIn, utils]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileNav();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [closeMobileNav, mobileNavOpen]);

  return (
    <div className={`app-shell ${isOfferLanding ? 'app-shell-dashboard' : ''}`}>
      <div className="app-shell-background" aria-hidden="true" />
      <div className="app-shell-content">
        <a className="rv-skip-link" href="#main-content">Skip to content</a>
        <TopBar
          onMenuClick={toggleMobileNav}
          onMenuClose={closeMobileNav}
          sidebarOpen={mobileNavOpen}
        />
        {showLiveTicker && <LiveActivityBar />}
        <WithdrawalStatusToast />
        <main id="main-content" tabIndex={-1} className="rv-main-content">
          <div key={location.pathname} className="route-stage min-h-full">
            {children}
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
