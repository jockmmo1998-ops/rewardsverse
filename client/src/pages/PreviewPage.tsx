import type { CSSProperties } from 'react';
import { ArrowDownToLine, ArrowRight, Award, Bell, CheckCircle2, CircleDollarSign, Clock3, Gift, LayoutDashboard, LifeBuoy, Menu, Settings, ShieldCheck, UserRound, WalletCards, Zap } from 'lucide-react';
import { BrandMark } from '@/components/shared/RewardUI';
import { OFFER_WALLS } from './OfferWalls';
import '../preview.css';

const sampleOffers = [
  ['Complete a quick survey', 'CPX Research', '$0.10–$5.00', 'Surveys'],
  ['Install and try a new app', 'Revtoo', '$0.25–$8.00', 'Apps'],
  ['Play a casual game', 'GemiWall', '$0.10–$5.00', 'Games'],
  ['Join a rewards program', 'Offerwall.me', '$0.10–$10.00', 'Tasks'],
  ['Answer a short questionnaire', 'TimeWall', '$0.10–$8.00', 'Surveys'],
  ['Try a premium mobile app', 'Moustache Leads', '$0.50–$10.00', 'Apps'],
  ['Finish an engagement task', 'Taskwall', '$0.15–$6.00', 'Tasks'],
  ['Complete a crypto offer', 'Cointo', '$0.20–$4.00', 'Apps'],
  ['Explore a new finance app', 'Klink Labs', '$0.30–$7.00', 'Apps'],
  ['Take a rewarded survey', 'TheoremReach', '$0.10–$5.00', 'Surveys'],
];

const sampleNav = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Earn rewards', icon: Gift },
  { label: 'Leaderboard', icon: Award },
  { label: 'Activity', icon: Clock3 },
  { label: 'Withdraw', icon: WalletCards },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
  { label: 'Support', icon: LifeBuoy },
];

export default function PreviewPage() {
  return (
    <div className="preview-shell">
      <aside className="preview-sidebar">
        <div className="preview-brand"><BrandMark /></div>
        <nav className="preview-nav" aria-label="Sample member navigation">
          <p>MEMBER WORKSPACE</p>
          {sampleNav.map(({ label, icon: Icon }, index) => (
            <span key={label} className={`preview-nav-item ${index === 0 ? 'active' : ''}`} aria-current={index === 0 ? 'page' : undefined}>
              <Icon className="h-4 w-4" aria-hidden="true" />{label}
            </span>
          ))}
        </nav>
        <div className="preview-user"><span className="preview-avatar">P</span><span><strong>Sample member</strong><small>Example account</small></span></div>
      </aside>

      <main className="preview-main">
        <header className="preview-topbar">
          <span className="preview-topbar-title">Workspace design preview</span>
          <span className="preview-menu" aria-hidden="true"><Menu className="h-4 w-4" /></span>
          <div className="preview-top-actions" aria-hidden="true">
            <span className="preview-icon-button"><Bell className="h-4 w-4" /></span>
            <span className="preview-balance"><CircleDollarSign className="h-4 w-4" /> $12.45</span>
            <span className="preview-avatar small">P</span>
          </div>
        </header>

        <div className="preview-content">
          <p className="preview-sample-note" role="note"><strong>Static design preview</strong><span>Sample balances, activity and offer cards below are illustrative only—not live account or provider data. Controls are shown for layout review and are not interactive.</span></p>

          <section className="preview-welcome">
            <div>
              <span className="preview-eyebrow"><span className="preview-dot" /> Member workspace · sample</span>
              <h1>Good to see you, <em>Jordan</em></h1>
              <p>Discover surveys, apps, games and tasks from offerwall partners, then follow verified rewards and payout updates in one clear place.</p>
              <div className="preview-actions" aria-hidden="true">
                <span className="preview-button"><Zap className="h-4 w-4" /> Start earning <ArrowRight className="h-4 w-4" /></span>
                <span className="preview-button secondary"><WalletCards className="h-4 w-4" /> Withdraw</span>
              </div>
            </div>
            <div className="preview-next">
              <span>THE REWARD FLOW</span><strong>Choose an offer</strong><p>Illustrative steps only. Current availability depends on configured providers.</p>
              <div><b>01</b> Browse partners</div><div><b>02</b> Complete and verify</div><div><b>03</b> Track your reward</div>
            </div>
          </section>

          <section className="preview-section featured-primary" aria-labelledby="preview-offers-title">
            <div className="preview-section-head"><div><span className="preview-eyebrow">Offer catalog · sample</span><h2 id="preview-offers-title">Featured offers</h2><p>Illustrative card content only; the live offer feed is separate.</p></div><span className="preview-search">Search offers</span></div>
            <div className="preview-filters" aria-hidden="true"><span className="selected">Featured</span><span>Highest reward</span><span>Surveys</span><span>Apps</span><span>Games</span><span>Easy tasks</span></div>
            <div className="preview-offer-grid">
              {sampleOffers.map(([title, provider, reward, category]) => (
                <article className="preview-offer-card" key={title}>
                  <div className="preview-card-top"><span className="preview-offer-logo">{provider.slice(0, 1)}</span><small>EXAMPLE</small></div>
                  <div><span className="preview-category">{category}</span><span className="preview-provider">{provider}</span><h3>{title}</h3><p>Sample description. The live provider page supplies the current requirements.</p></div>
                  <div className="preview-card-bottom"><span><small>SAMPLE REWARD</small><strong>{reward}</strong></span><span className="preview-card-action">Offer details <ArrowRight className="h-3 w-3" /></span></div>
                </article>
              ))}
            </div>
          </section>

          <section className="preview-stat-row" aria-label="Illustrative sample metrics">
            <div><WalletCards /><span>AVAILABLE BALANCE<strong>$12.45</strong><small>Sample value only</small></span><span className="preview-small-action">Withdraw</span></div>
            <div><CheckCircle2 /><span>OFFERS COMPLETED<strong>24</strong><small>Sample value only</small></span></div>
            <div><Award /><span>TOTAL EARNED<strong>$48.72</strong><small>Sample value only</small></span></div>
            <div><Clock3 /><span>PENDING REWARDS<strong>$3.20</strong><small>Sample value only</small></span></div>
          </section>

          <section className="provider-rail preview-provider-rail" aria-label="Offerwall provider brand preview">
            <div className="provider-rail-heading"><div><p className="rv-eyebrow">Reward network</p><h2>Offer wall partners</h2><p>Existing provider marks and names, shown as a static layout sample.</p></div><span className="provider-rail-count">{OFFER_WALLS.length} partners</span></div>
            <div className="provider-rail-grid">{OFFER_WALLS.map((wall) => {
              const ratingPercent = Math.round((wall.rating / 5) * 100);
              return <article key={wall.id} className="provider-mini-card provider-partner-card" style={{ '--provider-accent': wall.accent, '--provider-brand': wall.brandColor } as CSSProperties}>
                <span className="provider-partner-badge">{wall.tag}</span>
                <span className="provider-partner-main"><span className="provider-mini-logo">{wall.logo ? <img src={wall.logo} alt={`${wall.name} logo`} loading="lazy" /> : wall.name.slice(0, 1)}</span><span className="provider-mini-copy"><strong>{wall.name}</strong><span className="provider-partner-rating"><small>PARTNER RATING</small><i><b style={{ width: `${ratingPercent}%` }} /></i><em>{wall.rating.toFixed(1)}</em></span></span></span>
              </article>;
            })}</div>
          </section>

          <section className="preview-profile"><div><span className="preview-eyebrow">Profile rewards hub · sample</span><h2>Offers, rewards and payouts</h2><p>Example profile layout; no member account is loaded on this route.</p></div><div className="preview-profile-cards">
            <div><WalletCards /><span>Available balance<strong>$12.45</strong><small>Sample only</small></span></div>
            <div><Award /><span>Total earned<strong>$48.72</strong><small>24 sample offers</small></span></div>
            <div><Clock3 /><span>Pending rewards<strong>$3.20</strong><small>Sample only</small></span></div>
            <div><ArrowDownToLine /><span>Withdrawals<strong>2</strong><small>Sample only</small></span></div>
          </div></section>
        </div>
      </main>
    </div>
  );
}
