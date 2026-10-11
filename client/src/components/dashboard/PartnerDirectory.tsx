import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OFFER_WALLS } from '@/pages/OfferWalls';

interface PartnerDirectoryProps {
  statuses?: Array<{ provider: string; configured: boolean }>;
  onSelect: (wallId: string) => void;
}

export function PartnerDirectory({ statuses, onSelect }: PartnerDirectoryProps) {
  const partners = OFFER_WALLS.slice(0, 6);

  return (
    <section className="rv-partner-directory" aria-label="Offer wall partners">
      <header className="rv-partner-heading">
        <div>
          <p className="rv-eyebrow"><span className="section-dot" /> REWARD NETWORK</p>
          <h2>One network. More ways to explore.</h2>
          <p>Configured providers from the live RewardsVerse partner list.</p>
        </div>
        <span className="rv-partner-count">{partners.length} featured partners</span>
      </header>
      <div className="rv-partner-grid">
        {partners.map((wall) => {
          const status = statuses?.find((item) => item.provider === wall.id);
          const configured = status?.configured !== false;
          return (
            <button
              key={wall.id}
              type="button"
              disabled={!configured}
              onClick={() => onSelect(wall.id)}
              className={`rv-partner-card ${!configured ? 'is-disabled' : ''}`}
              style={{ '--partner-accent': wall.accent } as CSSProperties}
              aria-label={`${configured ? 'Open' : 'Unavailable'} ${wall.name}`}
            >
              <span className="rv-partner-card-top">
                <span className="rv-partner-logo">
                  {wall.logo
                    ? <img src={wall.logo} alt="" loading="lazy" decoding="async" />
                    : <Layers3 aria-hidden="true" />}
                </span>
                <ArrowUpRight className="rv-partner-arrow" aria-hidden="true" />
              </span>
              <strong>{wall.name}</strong>
              <span className="rv-partner-category">{wall.tag || 'Offer partner'}</span>
              <span className="rv-partner-description">{wall.desc}</span>
              {!configured && <span className="rv-partner-unavailable">Not configured</span>}
            </button>
          );
        })}
      </div>
      <footer className="rv-partner-footer">
        <span>Provider descriptions are sourced from the current configuration.</span>
        <Link to="/offerwalls">Explore all {OFFER_WALLS.length} partners <ArrowRight aria-hidden="true" /></Link>
      </footer>
    </section>
  );
}
