import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useState, useRef, useCallback } from "react";
import { playBellSound } from "@/utils/bellSound";
import { useSSE } from "@/hooks/useSSE";
import {
  LayoutDashboard, Gift as OfferIcon, Wallet, History as HistoryIcon,
  LogOut, Coins, X, ExternalLink, Star,
  Sparkles, Shield, CheckCircle2, ArrowLeft, Zap, ChevronRight, Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const OFFER_WALLS = [
  { id: "gemiwall",    name: "Gemiwall",       desc: "Premium survey & offer wall",    reward: "$0.10–$5.00",  logo: "https://gemiwall.com/favicon.ico",                                              color: "from-yellow-500 to-orange-500", glow: "rgba(245,158,11,0.15)", tag: "POPULAR",  rating: 4.8 },
  { id: "revtoo",      name: "Revtoo",         desc: "High-paying mobile offers",      reward: "$0.25–$8.00",  logo: "https://revtoo.com/assets/offerwall/images/revtoo-dark.svg",                    color: "from-blue-500 to-cyan-500",     glow: "rgba(59,130,246,0.15)",  tag: "HIGH PAY", rating: 4.9 },
  { id: "clickwall",   name: "Clickwall",      desc: "Quick tasks & downloads",        reward: "$0.10–$3.00",  logo: "https://www.google.com/s2/favicons?domain=clickwall.com&sz=128",                color: "from-green-500 to-emerald-500", glow: "rgba(0,255,135,0.15)",   tag: "EASY",     rating: 4.5 },
  { id: "moustache",   name: "MoustacheLeads", desc: "CPI & CPA offers worldwide",     reward: "$0.50–$10.00", logo: "https://moustacheleads.com/logo.png",                                           color: "from-purple-500 to-pink-500",   glow: "rgba(168,85,247,0.15)",  tag: "PREMIUM",  rating: 4.7 },
  { id: "taskwall",    name: "Taskwall",       desc: "Sign-up & engagement tasks",     reward: "$0.15–$6.00",  logo: "https://taskwall.io/taskwall_theme/assets/images/logo/logo.svg",                color: "from-indigo-500 to-blue-500",   glow: "rgba(99,102,241,0.15)",  tag: "SIGN-UPS", rating: 4.6 },
  { id: "cointo",      name: "CoinToMedia",    desc: "Crypto-focused offers",          reward: "$0.20–$4.00",  logo: "https://cointomedia.com/asset/images/iframe-logo.webp",                         color: "from-amber-500 to-yellow-500",  glow: "rgba(245,158,11,0.12)",  tag: "CRYPTO",   rating: 4.4 },
  { id: "klink",       name: "Klink Finance",  desc: "Finance & trading offers",       reward: "$0.30–$7.00",  logo: "https://assets.klink.finance/CDN/opengraph.jpg",                                color: "from-teal-500 to-green-500",    glow: "rgba(20,184,166,0.15)",  tag: "FINANCE",  rating: 4.8 },
  { id: "adswedmedia", name: "AdsWedMedia",    desc: "CPA & incent offers worldwide",  reward: "$0.10–$6.00",  logo: "https://adswedmedia.com/asset/storage/photos/logo-img.png",                     color: "from-rose-500 to-pink-500",     glow: "rgba(244,63,94,0.15)",   tag: "NEW",      rating: 4.7 },
  { id: "admaxflow",   name: "AdMaxFlow",      desc: "Surveys, apps & tasks worldwide", reward: "$0.10–$5.00", logo: "https://www.google.com/s2/favicons?domain=www.admaxflow.com&sz=128",                color: "from-cyan-500 to-blue-500",     glow: "rgba(6,182,212,0.15)",   tag: "NEW",      rating: 4.6 },
  { id: "gaintwall",   name: "Gaintwall",      desc: "Earn with surveys & tasks worldwide", reward: "$0.10–$6.00", logo: "https://www.google.com/s2/favicons?domain=gaintwall.com&sz=128",             color: "from-pink-500 to-rose-500",     glow: "rgba(236,72,153,0.15)",  tag: "NEW",      rating: 4.7 },
  { id: "buckswall",   name: "BucksWall",       desc: "Mobile apps, surveys & gaming offers", reward: "$0.10–$6.00", logo: "https://www.google.com/s2/favicons?domain=buckswall.com&sz=128",                                       color: "from-sky-500 to-blue-500",      glow: "rgba(14,165,233,0.15)",   tag: "SETUP",    rating: 4.6 },
];


const tickerBadge = (type: string) => {
  const map: Record<string, string> = {
    offer_complete: "bg-green-500/10 text-green-400 border-green-500/30",
    withdrawal: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    daily_claim: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    referral: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };
  return map[type] || map.offer_complete;
};
const tickerLabel = (type: string) =>
  ({ offer_complete: "EARNED", withdrawal: "WITHDRAW", daily_claim: "BONUS", referral: "REFERRAL" }[type] || "EARNED");


export default function OfferWalls() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const [wallUrl, setWallUrl] = useState("");
  const [previousBalance, setPreviousBalance] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery(
    { wall: activeWall || "" },
    { enabled: !!activeWall && !!user?.id, retry: false },
  );
  const recordMutation = trpc.user.recordOfferComplete.useMutation({
    onSuccess: async (data) => { await playBellSound(); toast.success(`Reward credited! +$${data.reward}`); },
    onSettled: () => refreshProfile(),
  });

  useEffect(() => {
    if (wallUrlQuery.data?.url) setWallUrl(wallUrlQuery.data.url);
  }, [wallUrlQuery.data]);


  useEffect(() => {
    if (!wallUrlQuery.error) return;
    setWallUrl("");
    toast.error(wallUrlQuery.error.message || "This offer wall is not available yet.");
    setActiveWall(null);
