import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import {
  Coins, Star, ChevronLeft, ExternalLink, X,
  Zap, Shield, TrendingUp, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

const OFFER_WALLS = [
  { id: "gemiwall",   name: "Gemiwall",   desc: "Top-paying offers, surveys & installs.", tags: ["POPULAR", "HIGH PAY"], stars: 4.8, min: "$0.05", max: "$15.00", color: "#7c3aed" },
  { id: "taskwall",   name: "Taskwall",   desc: "Easy daily micro-tasks and surveys.",      tags: ["EASY", "DAILY"],      stars: 4.6, min: "$0.02", max: "$5.00",  color: "#06b6d4" },
  { id: "revtoo",     name: "Revtoo",     desc: "App installs and game level completions.", tags: ["HIGH PAY"],            stars: 4.7, min: "$0.10", max: "$20.00", color: "#10b981" },
  { id: "adgatemedia",name: "AdGate",     desc: "Surveys, videos, and app testing.",        tags: ["POPULAR", "EASY"],    stars: 4.5, min: "$0.03", max: "$8.00",  color: "#f59e0b" },
  { id: "offertoro",  name: "OfferToro",  desc: "Premium surveys with high completion.",    tags: ["SURVEYS"],            stars: 4.4, min: "$0.05", max: "$10.00", color: "#ec4899" },
  { id: "lootably",   name: "Lootably",   desc: "Videos, polls, app trials & more.",        tags: ["EASY", "DAILY"],      stars: 4.3, min: "$0.01", max: "$3.00",  color: "#8b5cf6" },
];

const TAG_STYLE: Record<string, string> = {
  POPULAR:  "tag-primary",
  "HIGH PAY": "tag-green",
  EASY:     "tag-cyan",
  DAILY:    "tag-orange",
  SURVEYS:  "tag-primary",
};

export default function OfferWalls() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeWall, setActiveWall] = useState<string | null>(null);

  const urlQuery = trpc.offerwall.getUrl.useQuery(
    { provider: activeWall! },
    { enabled: !!activeWall }
  );

  if (activeWall) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="bg-white border-b border-border/60 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveWall(null)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-foreground">{OFFER_WALLS.find(w => w.id === activeWall)?.name}</h2>
              <p className="text-xs text-muted-foreground">Complete offers to earn rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-xl border border-violet-100">
            <Coins className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-bold text-violet-700">${parseFloat(user?.balance || "0").toFixed(2)}</span>
          </div>
        </div>
        <div className="flex-1">
          {urlQuery.isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm font-medium">Loading offers…</p>
              </div>
            </div>
          ) : urlQuery.data?.url ? (
            <iframe src={urlQuery.data.url} className="w-full h-full border-0" title={activeWall} />
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Offer Wall Unavailable</h3>
                <p className="text-muted-foreground text-sm">Please try again later or choose another wall.</p>
                <button onClick={() => setActiveWall(null)} className="btn-primary mt-5 px-6 py-2.5 rounded-xl text-sm font-bold">
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Offer Walls</h1>
              <p className="text-muted-foreground text-sm">Choose an offer wall and start earning</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Info row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Zap,        title: "Instant Tracking", desc: "Earnings credited within minutes.",   color: "#7c3aed" },
            { icon: Shield,     title: "Safe & Secure",    desc: "All partners are verified & trusted.", color: "#10b981" },
            { icon: TrendingUp, title: "Best Rates",       desc: "We offer the highest payout rates.",   color: "#06b6d4" },
          ].map((item) => (
            <div key={item.title} className="pc-card rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Offer wall grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFER_WALLS.map((wall, i) => (
            <motion.div key={wall.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="pc-card rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => setActiveWall(wall.id)}>
              {/* Top colour bar */}
              <div className="h-1.5 w-full" style={{ background: wall.color }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground mb-1">{wall.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-foreground">{wall.stars}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${wall.color}15` }}>
                    <Coins className="w-6 h-6" style={{ color: wall.color }} />
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{wall.desc}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {wall.tags.map((tag) => (
                    <span key={tag} className={`${TAG_STYLE[tag] || "tag-primary"} text-[10px]`}>{tag}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{wall.min}</span> – <span className="font-semibold text-foreground">{wall.max}</span> per offer
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-colors group-hover:text-white group-hover:bg-violet-600"
                    style={{ color: wall.color, background: `${wall.color}12` }}>
                    Open <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
