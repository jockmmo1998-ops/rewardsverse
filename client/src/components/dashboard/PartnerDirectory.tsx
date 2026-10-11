import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OFFER_WALLS } from '@/pages/OfferWalls';

interface PartnerDirectoryProps {
  statuses?: Array<{ provider: string; configured: boolean }>;
  onSelect: (wallId: string, trigger?: HTMLButtonElement) => void;
}

export function PartnerDirectory({ statuses, onSelect }: PartnerDirectoryProps) {
  const partners = OFFER_WALLS;

  return (
    <section className="rv-partner-directory" aria-label="All offerwall partners">
      <header className="rv-partner-heading">
        <div>
          <p className="rv-eyebrow"><span className="section-dot" /> REWARD NETWORK</p>
          <h2>One network. More ways to explore.</h2>
          <p>Every provider in the Offerwall catalog, gathered in one place.</p>
        </div>
        <span className="rv-partner-count">{partners.length} offerwall partners</span>
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
              onClick={(event) => onSelect(wall.id, event.currentTarget)}
              className={`rv-partner-card ${!configured ? 'is-disabled' : ''}`}
              style={{ '--partner-accent': wall.accent } as CSSProperties}
              aria-label={`${configured ? 'Open' : 'Unavailable'} ${wall.name}. Rewards ${wall.reward}.`}
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
              <span className="rv-partner-reward">Rewards {wall.reward}</span>
              <span className="rv-partner-description">{wall.desc}</span>
              {!configured && <span className="rv-partner-unavailable">Not configured</span>}
            </button>
          );
        })}
      </div>
      <footer className="rv-partner-footer">
        <span>Select a configured provider to open its offerwall.</span>
        <Link to="/offerwalls">Open Offerwall catalog <ArrowRight aria-hidden="true" /></Link>
      </footer>
    </section>
  );
}
