import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/shared/RewardUI';
import { EmptySlot, OfferCard } from '@/components/dashboard/OfferFeedShelf';

const OFFERS_PER_PAGE = 60;

interface OfferCatalogResultsProps {
  allOffers: any[];
  offers: any[];
  loading: boolean;
  error: boolean;
  visualPreview: boolean;
  onSelect: (offer: any, trigger?: HTMLButtonElement) => void;
  onRetry: () => void;
}

export function OfferCatalogResults({
  allOffers,
  offers,
  loading,
  error,
  visualPreview,
  onSelect,
  onRetry,
}: OfferCatalogResultsProps) {
  const [visibleCount, setVisibleCount] = useState(OFFERS_PER_PAGE);

  useEffect(() => {
    setVisibleCount(OFFERS_PER_PAGE);
  }, [offers]);

  if (offers.length > 0) {
    const visibleOffers = offers.slice(0, visibleCount);
    return (
      <div className="space-y-5">
        <div
          className="rv-catalog-offer-grid rv-catalog-offer-grid-compact"
          role="region"
          tabIndex={0}
          aria-label={`${offers.length} verified offers; showing ${visibleOffers.length}`}
        >
          {visibleOffers.map((offer, index) => (
            <OfferCard
              key={`${offer.provider || 'offer'}-${offer.id || index}`}
              offer={offer}
              onSelect={onSelect}
              compact
            />
          ))}
        </div>
        {visibleCount < offers.length && (
          <div className="flex justify-center">
            <button
              type="button"
              className="rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-primary transition hover:bg-primary/20"
              onClick={() => setVisibleCount((current) => Math.min(current + OFFERS_PER_PAGE, offers.length))}
            >
              Show more offers <span className="ml-1 opacity-70">({offers.length - visibleCount} remaining)</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (allOffers.length > 0) {
    return (
      <EmptyState
        title="No matching offers"
        description="Try another category or search. The offer catalog only displays records returned by the live provider feed."
        icon={Search}
        action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Open earn center <ArrowRight className="ml-1 inline h-4 w-4" /></Link>}
      />
    );
  }

  const headline = loading
    ? 'Checking the live provider feed.'
    : error
      ? 'Live offer records are unavailable.'
      : 'No live offer records.';
  const note = loading
    ? 'Loading verified offers from the configured feed.'
    : error
      ? visualPreview
        ? 'The real offer API is not connected in this visual preview. No sample offers are substituted.'
        : 'The provider feed is temporarily unavailable. Retry when it responds.'
      : 'The feed returned no public offers. Empty frames do not represent offers or rewards.';

  return (
    <div className="rv-catalog-empty" role="status">
      <div className="rv-catalog-empty-copy">
        <p className="rv-catalog-empty-meta"><span>PUBLIC FEED</span><i>/</i><strong>{loading ? 'CHECKING' : error ? 'UNAVAILABLE' : '0 OFFERS'}</strong></p>
        <h3>{headline}</h3>
        <p>{note}</p>
        {error && !visualPreview && <button type="button" onClick={onRetry} className="rv-catalog-retry">Retry <ArrowRight aria-hidden="true" /></button>}
      </div>
      <div className="rv-catalog-empty-slots" aria-label="Five empty offer placeholders">
        {Array.from({ length: 5 }, (_, index) => <EmptySlot key={index} />)}
      </div>
    </div>
  );
}
