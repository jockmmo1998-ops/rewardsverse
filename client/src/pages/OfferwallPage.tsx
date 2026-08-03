import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import AppLayout from '@/components/layouts/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Search, Zap } from 'lucide-react';
import { getOffers } from '@/lib/api';
import type { Offer } from '@/types/types';
import { OFFER_CATEGORIES } from '@/types/types';

const CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  survey:  { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)'  },
  app:     { color: '#A855F7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.25)'  },
  video:   { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)'  },
  signup:  { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)'   },
  review:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'  },
  general: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.25)' },
};

function OfferCard({ offer, idx }: { offer: Offer; idx: number }) {
  const cat = CAT_COLORS[offer.category] ?? CAT_COLORS.general;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.35 }}
      whileHover={{ y: -4, boxShadow: `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)` }}
      className="rounded-2xl p-5 flex flex-col h-full cursor-default"
      style={{ background: 'rgba(16,20,31,0.95)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s ease' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
          style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color }}>
          {offer.category}
        </span>
        <span className="text-lg font-bold font-heading" style={{ color: '#22C55E' }}>
          ${offer.payout.toFixed(2)}
        </span>
      </div>
      <h3 className="font-semibold text-sm leading-snug mb-1.5 font-heading" style={{ color: '#F4F4F5' }}>{offer.name}</h3>
      {offer.description && (
        <p className="text-xs flex-1 mb-4 line-clamp-2" style={{ color: 'rgba(244,244,245,0.45)' }}>{offer.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: 'rgba(244,244,245,0.35)' }}>{offer.provider}</p>
        {offer.url ? (
          <a href={offer.url} target="_blank" rel="noopener noreferrer">
            <button className="btn-primary text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-semibold">
              Start <ExternalLink size={10} />
            </button>
          </a>
        ) : (
          <button disabled className="text-xs px-3 py-1.5 rounded-lg opacity-40 cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,244,245,0.4)' }}>
            Unavailable
          </button>
        )}
      </div>
    </motion.div>
  );
}

function OfferSkeleton() {
  return (
    <div className="rounded-2xl p-5 h-40 shimmer" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.05)' }} />
  );
}

const PAGE_SIZE = 20;

export default function OfferwallPage() {
  useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (cat: string, pg: number) => {
    setLoading(true);
    const result = await getOffers(cat, pg, PAGE_SIZE);
    setOffers(result.data);
    setTotal(result.count);
    setLoading(false);
  }, []);

  useEffect(() => { load(category, page); }, [category, page, load]);

  const filtered = search.trim()
    ? offers.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.provider.toLowerCase().includes(search.toLowerCase()))
    : offers;

  const handleCat = (val: string) => { setCategory(val); setPage(0); };

  return (
    <>
      <PageMeta title="Offerwall — RewardsVerse" description="Browse and complete offers to earn rewards" />
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold font-heading" style={{ color: '#F4F4F5' }}>Offerwall</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
              Complete offers from top providers and earn real cash.
            </p>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {OFFER_CATEGORIES.map(c => {
              const active = category === c.value;
              const cat = CAT_COLORS[c.value] ?? { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' };
              return (
                <button key={c.value} onClick={() => handleCat(c.value)}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all"
                  style={active
                    ? { background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(244,244,245,0.45)' }}>
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(244,244,245,0.3)' }} />
            <input
              placeholder="Search offers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-white/20"
              style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}
            />
          </div>

          {!loading && (
            <p className="text-xs" style={{ color: 'rgba(244,244,245,0.3)' }}>
              Showing {filtered.length} of {total} offers
            </p>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => <OfferSkeleton key={i} />)
              : filtered.length > 0
              ? filtered.map((o, i) => <OfferCard key={o.id} offer={o} idx={i} />)
              : (
                <div className="col-span-full py-16 text-center">
                  <Zap size={28} className="mx-auto mb-3" style={{ color: 'rgba(244,244,245,0.2)' }} />
                  <p className="text-sm font-semibold font-heading" style={{ color: 'rgba(244,244,245,0.4)' }}>No offers found</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(244,244,245,0.25)' }}>Try a different category or clear your search</p>
                </div>
              )}
          </div>

          {/* Pagination */}
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}>
                ← Previous
              </button>
              <span className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>
                Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
                className="text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}

