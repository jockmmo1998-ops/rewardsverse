import { ArrowRight, Grid2X2 } from 'lucide-react';

interface OfferFeedShelfProps {
  eyebrow: string;
  title: string;
  description: string;
  offers: any[];
  loading: boolean;
  error: boolean;
  visualPreview: boolean;
  onSelect: (offer: any) => void;
  layout?: 'horizontal' | 'grid';
  emptyCount?: number;
}

function formatReward(value: unknown, currency = 'USD') {
  const raw = String(value ?? '').trim();
  if (!raw) return '—';
  const match = raw.match(/^([\d,]+(?:\.\d+)?)\s*(?:pts?|points?)?$/i);
  if (!match) return raw || '—';
  const parsed = Number(match[1].replaceAll(',', ''));
  if (!Number.isFinite(parsed)) return '—';
  return currency.toUpperCase() === 'USD'
    ? `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parsed)}`
    : `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parsed)} ${currency}`;
}

export function OfferCard({ offer, onSelect, compact = false }: { offer: any; onSelect: (offer: any, trigger?: HTMLButtonElement) => void; compact?: boolean }) {
  const title = String(offer.offerName || offer.title || 'Offer');
  const provider = String(offer.provider || 'Provider');
  const rawReward = offer.rewardLabel ?? offer.rewardText ?? offer.reward;
  const reward = rawReward && typeof rawReward === 'object'
    ? String(rawReward.label ?? rawReward.amount ?? '')
    : rawReward == null ? '' : String(rawReward);

  if (compact) {
    return (
      <button type="button" className="rv-offer-card rv-offer-card-compact" title={title} aria-label={`${title} from ${provider}; reward ${formatReward(reward, offer.currency || 'USD')}`} onClick={(event) => onSelect(offer, event.currentTarget)}>
        {offer.imageUrl && (
          <span className="rv-offer-card-art-glow" aria-hidden="true">
            <img src={offer.imageUrl} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          </span>
        )}
        <span className="rv-offer-card-image">
          {offer.imageUrl ? <img src={offer.imageUrl} alt={`${title} offer artwork`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <span className="rv-offer-card-image-empty">{provider}</span>}
        </span>
        <span className="rv-offer-card-points">{formatReward(reward, offer.currency || 'USD')}</span>
      </button>
    );
  }

  return (
    <button
      className="rv-offer-card"
      type="button"
      onClick={(event) => onSelect(offer, event.currentTarget)}
      aria-label={`View ${title} from ${provider}`}
    >
      <span className="rv-offer-card-image">
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <span className="rv-offer-card-image-empty">No image supplied</span>
        )}
      </span>
      <span className="rv-offer-card-meta">
        <span>{String(offer.category || 'Offer')}</span>
        <span>{provider}</span>
      </span>
      <strong>{title}</strong>
      <span className="rv-offer-card-description">
        {String(offer.description || 'Offer requirements will appear when provided by the live feed.')}
      </span>
      <span className="rv-offer-card-action"><span>{reward || 'Provider reward details'}</span><ArrowRight aria-hidden="true" /></span>
    </button>
  );
}

export function EmptySlot() {
  return (
    <div className="rv-offer-empty-slot" aria-hidden="true">
      <div className="rv-offer-empty-art"><Grid2X2 aria-hidden="true" /><span>AWAITING REAL OFFER</span></div>
      <div className="rv-offer-empty-lines"><i /><i /><b /></div>
    </div>
  );
}

export function OfferFeedShelf({
  eyebrow,
  title,
  description,
  offers,
  loading,
  error,
  visualPreview,
  onSelect,
  layout = 'horizontal',
  emptyCount = 5,
}: OfferFeedShelfProps) {
  const hasOffers = offers.length > 0;
  const stateLabel = loading && !hasOffers ? 'Checking live feed' : error && !hasOffers ? 'Feed unavailable' : `${offers.length} ${offers.length === 1 ? 'record' : 'records'}`;
  const stateDescription = loading && !hasOffers
    ? 'Checking the configured provider feed.'
    : error && !hasOffers
      ? visualPreview ? 'The live offer feed is not connected in this visual preview.' : 'The live provider feed is temporarily unavailable.'
      : !hasOffers
        ? 'No public offer records are available right now. Empty tiles do not represent offers.'
        : description;

  return (
    <section className={`rv-offer-shelf ${layout === 'horizontal' ? 'rv-offer-shelf-wide' : 'rv-offer-shelf-grid'}`}>
      <header className="rv-offer-shelf-heading">
        <div>
          <p className="rv-eyebrow"><span className="section-dot" /> {eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className={`rv-offer-shelf-count ${error && !hasOffers ? 'is-offline' : ''}`}>
          <i aria-hidden="true" />{stateLabel}
        </span>
      </header>
      {!hasOffers && <p className="rv-offer-shelf-state" role="status">{stateDescription}</p>}
      <div className="rv-offer-shelf-track" aria-label={hasOffers ? `${title}: ${offers.length} live offers` : `${title}: empty offer slots`}>
        {hasOffers
          ? offers.slice(0, layout === 'horizontal' ? 15 : 5).map((offer, index) => (
            <OfferCard key={`${offer.provider || 'offer'}-${offer.id || index}`} offer={offer} onSelect={onSelect} />
          ))
          : Array.from({ length: emptyCount }, (_, index) => <EmptySlot key={index} />)}
      </div>
    </section>
  );
}
