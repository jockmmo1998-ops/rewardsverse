import type { CSSProperties } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="rv-partner-grid rv-network-provider-grid unified-page">
        {partners.map((wall, index) => {
          const status = statuses?.find((item) => item.provider === wall.id);
          const configured = status?.configured !== false;
          return (
            <motion.button
              key={wall.id}
              type="button"
              disabled={!configured}
              aria-label={`${wall.name}. ${wall.desc}. Rating ${wall.rating} out of 5. Earn ${wall.reward}. ${configured ? 'Available' : 'Setup required'}`}
              title={`${wall.name} · ${wall.desc} · Earn ${wall.reward}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * .025 }}
              onClick={(event) => onSelect(wall.id, event.currentTarget)}
              className={`group w-full min-w-0 text-left ${!configured ? 'cursor-not-allowed opacity-65' : ''}`}
            >
              <div
                className="provider-card relative flex aspect-[1.76/1] min-h-[144px] w-full flex-col items-center overflow-hidden rounded-[15px] border p-3 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                style={{ borderColor: wall.border, '--provider-accent': wall.accent, '--provider-brand': wall.border } as CSSProperties}
              >
                <span className="provider-border-side provider-border-top" aria-hidden="true" />
                <span className="provider-border-side provider-border-right" aria-hidden="true" />
                <span className="provider-border-side provider-border-bottom" aria-hidden="true" />
                <span className="provider-border-side provider-border-left" aria-hidden="true" />
                <span className="provider-badge absolute right-2.5 top-2.5 z-[4] rounded-md px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide shadow-sm" style={{ '--provider-badge': wall.accent } as CSSProperties}>{wall.tag}</span>
                <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center pt-2">
                  <div className={`mb-2 flex h-10 w-full max-w-[148px] items-center justify-center ${wall.id === 'revtoo' ? 'provider-revtoo-logo rounded-md px-3 py-1' : ''}`}>
                    {wall.logo
                      ? <img src={wall.logo} alt={`${wall.name} official logo`} loading="lazy" decoding="async" width="148" height="40" className="max-h-full max-w-full object-contain" onError={(event) => { (event.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      : <span className="provider-logo-fallback text-xl font-black" style={{ color: wall.brandColor }}>{wall.name.slice(0, 1)}</span>}
                  </div>
                  <h3 className="provider-card-title max-w-full truncate text-[12px] font-semibold drop-shadow-sm">{wall.name}</h3>
                  <div className="provider-card-stars mt-1 flex items-center justify-center gap-0.5 drop-shadow-sm" aria-label={`Rating ${wall.rating} out of 5`} title={`${wall.rating} / 5`}>
                    {Array.from({ length: 5 }, (_, starIndex) => <Star key={starIndex} className="h-2.5 w-2.5 fill-current" aria-hidden="true" />)}
                    <span className="sr-only">{wall.rating} out of 5</span>
                  </div>
                </div>
                <p className="provider-card-description absolute bottom-1.5 left-2 right-2 z-[4] truncate text-[8px] font-medium uppercase tracking-[.08em] drop-shadow-sm">{wall.desc}</p>
              </div>
            </motion.button>
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
