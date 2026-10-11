import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/shared/RewardUI';
import { EmptySlot, OfferCard } from '@/components/dashboard/OfferFeedShelf';

interface OfferCatalogResultsProps {
  allOffers: any[];
  offers: any[];
  loading: boolean;
  error: boolean;
  visualPreview: boolean;
  onSelect: (offer: any) => void;
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
  if (offers.length > 0) {
    return (
      <div className="rv-catalog-offer-grid" aria-label={`${offers.length} verified offers`}>
        {offers.slice(0, 20).map((offer, index) => (
          <OfferCard
            key={`${offer.provider || 'offer'}-${offer.id || index}`}
            offer={offer}
            onSelect={onSelect}
          />
        ))}
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
