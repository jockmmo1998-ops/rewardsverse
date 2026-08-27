import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ExternalLink, Megaphone, RefreshCw, Star, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import { fetchOfferwalls } from "@/api";

const ADMAXFLOW_PLACEMENT_ID = "143";
const ADMAXFLOW_BASE_URL = "https://admaxflow.com/offerwall.php";

const GAINTWALL_PLACEMENT_KEY = "B3z5xyDiTNxzeLLdeZSp0NSFysfX9Z9x";
const GAINTWALL_BASE_URL = "https://gaintwall.com/offerwall";

function getStoredUserId(): string | null {
  const keys = ["user_id", "userId", "userid", "profile_id", "profileId"];
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value?.trim()) return value.trim();
  }
  return null;
}

function createAnonymousUserId(): string {
  const key = "rewardsverse_admaxflow_user_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `rv-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  localStorage.setItem(key, id);
  return id;
}

function AdmaxflowOfferwall() {
  const [userId, setUserId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const stored = getStoredUserId();
    setUserId(stored || createAnonymousUserId());
  }, []);

  const offerwallUrl = useMemo(() => {
    if (!userId) return "";
    const url = new URL(ADMAXFLOW_BASE_URL);
    url.searchParams.set("placement_id", ADMAXFLOW_PLACEMENT_ID);
    url.searchParams.set("user_id", userId);
    return url.toString();
  }, [userId]);

  return (
    <section className="rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-sm">
      <div className="p-5 md:p-6 border-b border-border bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground">
              AdMaxFlow Offer Wall
            </h2>
            <p className="text-sm text-muted-foreground">
              Surveys, apps and tasks from AdMaxFlow
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20 uppercase tracking-wider">
              Active
            </span>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="w-9 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors"
              title="Reload offer wall"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href={offerwallUrl || ADMAXFLOW_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {userId ? (
          <iframe
            key={`${offerwallUrl}-${reloadKey}`}
            src={offerwallUrl}
            title="AdMaxFlow Offer Wall"
            className="w-full min-h-[720px] md:min-h-[820px] rounded-xl border border-border bg-background"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-write"
          />
        ) : (
          <div className="min-h-[420px] flex items-center justify-center text-sm text-muted-foreground">
            Loading your offer wall...
          </div>
        )}
      </div>

      <div className="px-5 pb-5 text-[11px] text-muted-foreground">
        Placement ID: {ADMAXFLOW_PLACEMENT_ID}. The user ID is attached automatically.
      </div>
    </section>
  );
}

function GaintwallOfferwall() {
  const [userId, setUserId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const stored = getStoredUserId();
    setUserId(stored || createAnonymousUserId());
  }, []);

  const offerwallUrl = useMemo(() => {
    if (!userId) return "";
    const url = new URL(GAINTWALL_BASE_URL);
    url.searchParams.set("placement_key", GAINTWALL_PLACEMENT_KEY);
    url.searchParams.set("user_id", userId);
    return url.toString();
  }, [userId]);

  return (
    <section className="rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-sm">
      <div className="p-5 md:p-6 border-b border-border bg-gradient-to-r from-pink-500/10 via-transparent to-transparent">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-pink-500/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground">
              Gaintwall Offer Wall
            </h2>
            <p className="text-sm text-muted-foreground">
              Surveys, apps and tasks from Gaintwall
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20 uppercase tracking-wider">
              Active
            </span>
            <button
              type="button"
              onClick={() => setReloadKey((v) => v + 1)}
              className="w-9 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors"
              title="Reload offer wall"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href={offerwallUrl || GAINTWALL_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {userId ? (
          <iframe
            key={`${offerwallUrl}-${reloadKey}`}
            src={offerwallUrl}
            title="Gaintwall Offer Wall"
            className="w-full min-h-[720px] md:min-h-[820px] rounded-xl border border-border bg-background"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-write"
          />
        ) : (
          <div className="min-h-[420px] flex items-center justify-center text-sm text-muted-foreground">
            Loading your offer wall...
          </div>
        )}
      </div>

      <div className="px-5 pb-5 text-[11px] text-muted-foreground">
        Placement Key: {GAINTWALL_PLACEMENT_KEY}. The user ID is attached automatically.
      </div>
    </section>
  );
}

export default function OfferwallsPage() {
  const [offerwalls, setOfferwalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfferwalls()
      .then((data) => setOfferwalls(data))
      .catch((error) => console.error("[Offerwalls] Failed to load providers:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Offerwalls"
        subtitle="Choose a provider below to start earning with surveys and tasks."
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Zap className="w-4 h-4" />
          +50% Bonus Today!
        </div>
      </PageHeader>

      <AdmaxflowOfferwall />

      <GaintwallOfferwall />

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          Loading providers...
        </div>
      ) : offerwalls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {offerwalls.map((wall, index) => (
            <div
              key={wall.id ?? index}
              className="relative overflow-hidden flex flex-col rounded-2xl border border-border bg-card p-5 md:p-6 group transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {wall.badge && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    {wall.badge}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div
                  className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden bg-gradient-to-br",
                    wall.color_gradient || "from-white/10 to-white/5",
                  )}
                >
                  {wall.logo_url ? (
                    <img
                      src={wall.logo_url}
                      alt={wall.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    wall.logo_emoji
                  )}
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    {wall.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{wall.category}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Max Reward
                  </span>
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    Up to $50.00
                  </span>
                </div>

                <button
                  type="button"
                  className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                  aria-label={`Open ${wall.name}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
          No offerwalls available at the moment.
        </div>
      )}
    </div>
  );
}
