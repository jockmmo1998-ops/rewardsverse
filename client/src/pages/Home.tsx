import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Shield, Clock, Coins, Trophy, CheckCircle2, Star, Users,
  Smartphone, Gamepad2, Wallet, MousePointer2, Eye, EyeOff,
  TrendingUp, Gift, ArrowRight, Lock, User, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { user, loading, register, login, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  useEffect(() => {
    if (user && !loading) setLocation("/dashboard");
  }, [user, loading]);

  const handleAuth = async () => {
    if (!username.trim() || username.length < 3) return;
    if (!password.trim() || password.length < 6) return;
    setIsSubmitting(true);
    try {
      if (activeTab === "register") await register(username.trim(), password.trim(), refCode.trim() || undefined);
      else await login(username.trim(), password.trim());
    } finally { setIsSubmitting(false); }
  };

  const tickerItems = activities && activities.length > 0
    ? activities.slice(0, 12).map((a: any) => ({ type: a.type, user: a.username, amount: a.amount }))
    : [
        { type: "offer_complete", user: "CryptoKing",  amount: "$2.50" },
        { type: "withdrawal",     user: "MoonWalker",  amount: "$15.00" },
        { type: "offer_complete", user: "NFTFan99",    amount: "$1.25" },
        { type: "daily_claim",    user: "StreakPro",   amount: "$0.25" },
        { type: "offer_complete", user: "DogeLover",   amount: "$5.00" },
        { type: "withdrawal",     user: "ETHWhale",    amount: "$8.75" },
        { type: "referral",       user: "ProInviter",  amount: "$1.00" },
        { type: "offer_complete", user: "SurveyAce",   amount: "$3.50" },
      ];

  const tagStyle: Record<string, string> = {
    offer_complete: "tag-primary",
    withdrawal:     "tag-cyan",
    daily_claim:    "tag-orange",
    referral:       "tag-green",
  };
  const tagLabel: Record<string, string> = {
    offer_complete: "Earned", withdrawal: "Withdraw", daily_claim: "Bonus", referral: "Referral",
  };

  const features = [
    { icon: MousePointer2, title: "Paid Surveys",   desc: "Share opinions and get rewarded instantly.", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
    { icon: Gamepad2,      title: "Play & Earn",    desc: "Play mobile games and collect real rewards.", color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
    { icon: Smartphone,    title: "App Testing",    desc: "Try apps, give feedback, earn cash.",          color: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { icon: Gift,          title: "Offer Walls",    desc: "Complete tasks from premium offer networks.",   color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { icon: Users,         title: "Refer Friends",  desc: "Earn 10% of your referrals' lifetime earnings.", color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
    { icon: Wallet,        title: "Fast Cashout",   desc: "Withdraw via crypto — processed in 24h.",       color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  ];

  const steps = [
    { n: "1", title: "Create Account",  desc: "Sign up free in under 30 seconds. No credit card needed." },
    { n: "2", title: "Complete Tasks",  desc: "Browse hundreds of surveys, games, and offers available daily." },
    { n: "3", title: "Get Paid",        desc: "Withdraw your earnings in Bitcoin, Ethereum, or Litecoin." },
  ];

  const stats = [
    { value: "$125K+", label: "Total Paid Out",   icon: TrendingUp, color: "#7c3aed" },
    { value: "50K+",   label: "Active Members",   icon: Users,       color: "#06b6d4" },
    { value: "2.5M+",  label: "Tasks Completed",  icon: CheckCircle2,color: "#10b981" },
    { value: "4.9/5",  label: "User Rating",       icon: Star,        color: "#f59e0b" },
  ];

  const testimonials = [
    { name: "Alex J.",  text: "Best rewards site I've used. Withdrew $5 in Litecoin within hours!", rating: 5, avatar: "1" },
    { name: "Sarah K.", text: "The interface is smooth. Love the daily streak bonus!", rating: 5, avatar: "2" },
    { name: "Mike R.",  text: "Fastest payouts in the industry. Highly recommended.", rating: 5, avatar: "3" },
  ];

  const cryptos = ["Bitcoin", "Ethereum", "Litecoin", "USDT"];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Activity Ticker ── */}
      <div className="bg-white border-b border-border/60 h-9 overflow-hidden flex items-center shadow-sm">
        <div className="w-20 shrink-0 gradient-primary flex items-center justify-center h-full">
          <span className="text-white text-[10px] font-bold tracking-widest uppercase">LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-[11px] text-muted-foreground ml-4">
            {Array.from({ length: 3 }).map((_, ri) => (
              <span key={ri} className="flex items-center gap-12">
                {tickerItems.map((item, idx) => (
                  <span key={`${ri}-${idx}`} className="flex items-center gap-2">
                    <span className={`${tagStyle[item.type] || "tag-primary"} text-[10px] py-0 px-2`}>
                      {tagLabel[item.type] || "Earned"}
                    </span>
                    <span className="font-semibold text-foreground">{item.user}</span>
                    <span className="font-bold text-violet-600">{item.amount}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-border/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-gradient">Rewards</span>
              <span className="text-foreground">Verse</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {[["Features", "#features"], ["How It Works", "#how-it-works"], ["Payouts", "#payouts"]].map(([label, href]) => (
              <a key={label} href={href} className="hover:text-violet-600 transition-colors">{label}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-violet-600 font-semibold hover:bg-violet-50"
              onClick={() => { setActiveTab("login"); document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" }); }}
            >
              Log In
            </Button>
            <Button
              size="sm"
              className="btn-primary text-sm px-5 py-2 rounded-xl"
              onClick={() => { setActiveTab("register"); document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" }); }}
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden hero-bg" style={{ background: "linear-gradient(135deg, #1e0533 0%, #0c0a2e 45%, #0a1a3e 100%)" }}>
        {/* Blobs */}
        <div className="hero-blob-1" style={{ top: "-100px", left: "-100px" }} />
        <div className="hero-blob-2" style={{ bottom: "0px", right: "-80px" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left copy */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 text-xs font-semibold tracking-wide">Trusted by 50,000+ Members</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.06] tracking-tight mb-6">
                <span className="text-gradient-white">Earn Real</span>
                <br />
                <span className="text-white">Cash Online</span>
                <br />
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  In Minutes.
                </span>
              </h1>

              <p className="text-white/70 text-lg mb-8 max-w-lg leading-relaxed">
                Complete surveys, play games, and test apps to earn cryptocurrency. Instant payouts, zero fees, and thousands of tasks available every day.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                {["Min. $0.50 Cashout", "0% Withdrawal Fees", "Paid in Crypto"].map((t) => (
                  <div key={t} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white/85 text-xs font-medium">{t}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="btn-white text-base font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
                  onClick={() => { setActiveTab("register"); document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" }); }}
                >
                  Start Earning Free <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  className="flex items-center justify-center gap-2 text-white/80 font-medium text-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/8 transition-colors"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                >
                  How it works <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Avatars */}
              <div className="flex items-center gap-4 mt-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                      className="w-9 h-9 rounded-full border-2 border-[#0c0a2e] bg-violet-100" alt="User" />
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <span className="text-white/60 text-xs">4.9/5 from 2,000+ reviews</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Auth card */}
            <motion.div id="auth-section" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>
                {/* Tabs */}
                <div className="flex rounded-xl bg-gray-100 p-1 mb-7">
                  {(["login", "register"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === tab
                          ? "bg-white text-violet-700 shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "login" ? "Log In" : "Sign Up"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    {activeTab === "register" && (
                      <div className="mb-4 p-3.5 rounded-xl bg-violet-50 border border-violet-100 flex items-start gap-3">
                        <Gift className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-violet-700 font-medium">🎉 New members get a $0.10 welcome bonus on signup!</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-foreground/70 mb-1.5 block uppercase tracking-wide">Username</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border text-sm font-medium bg-gray-50 focus:bg-white input-pc transition-all outline-none"
                            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground/70 mb-1.5 block uppercase tracking-wide">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full pl-10 pr-11 py-3 rounded-xl border border-border text-sm font-medium bg-gray-50 focus:bg-white input-pc transition-all outline-none"
                            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                          />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {activeTab === "register" && (
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 mb-1.5 block uppercase tracking-wide">Referral Code <span className="font-normal normal-case text-muted-foreground">(optional)</span></label>
                          <input
                            type="text"
                            value={refCode}
                            onChange={(e) => setRefCode(e.target.value)}
                            placeholder="Enter referral code"
                            className="w-full px-4 py-3 rounded-xl border border-border text-sm font-medium bg-gray-50 focus:bg-white input-pc transition-all outline-none"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleAuth}
                        disabled={isSubmitting}
                        className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {activeTab === "login" ? "Log In to Dashboard" : "Create Free Account"}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-5 text-center">
                      <p className="text-xs text-muted-foreground">
                        {activeTab === "login" ? "Don't have an account?" : "Already have an account?"}
                        {" "}
                        <button onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")} className="text-violet-600 font-semibold hover:underline">
                          {activeTab === "login" ? "Sign up free" : "Log in"}
                        </button>
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-center gap-4">
                  {["SSL Secured", "Free to Join", "Instant Payouts"].map((t) => (
                    <div key={t} className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-white border-y border-border/60 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center">
              <div className="text-3xl font-extrabold text-foreground mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="tag-primary mb-4">Features</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Multiple Ways to Earn</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Choose from hundreds of tasks updated daily across all platforms.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="pc-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider-gradient mx-6" />

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="tag-primary mb-4">How It Works</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Start Earning in 3 Steps</h2>
          <p className="text-muted-foreground text-lg">No experience needed. Simple, fast, and completely free.</p>
        </div>
        <div className="space-y-6">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="pc-card p-7 rounded-2xl flex items-start gap-6">
              <div className="step-circle shrink-0">{s.n}</div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Payouts (dark) ── */}
      <section id="payouts" style={{ background: "linear-gradient(135deg, #1e0533 0%, #0c0a2e 60%, #0a1a3e 100%)" }} className="py-24 relative overflow-hidden">
        <div className="hero-blob-1 opacity-50" style={{ top: "-120px", right: "0" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/85 text-xs font-semibold">Lightning Fast Payouts</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Get Paid in Crypto</h2>
          <p className="text-white/65 text-lg mb-10 max-w-lg mx-auto">Withdraw your earnings to any cryptocurrency wallet. Minimum $0.50, processed within 24 hours.</p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {cryptos.map((c) => (
              <div key={c} className="pc-card-dark rounded-xl px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">{c}</span>
              </div>
            ))}
          </div>
          <button className="btn-white text-base font-bold px-10 py-4 rounded-xl inline-flex items-center gap-2"
            onClick={() => { setActiveTab("register"); document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" }); }}>
            Start Earning Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="tag-primary mb-4">Reviews</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Loved by Our Community</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="pc-card p-7 rounded-2xl">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-foreground/80 mb-5 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${parseInt(t.avatar) + 30}`} className="w-10 h-10 rounded-full bg-violet-100" alt={t.name} />
                <div>
                  <div className="font-bold text-sm text-foreground">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">Verified Member</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-border/60 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground"><span className="text-gradient">Rewards</span>Verse</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            {[["Terms", "/terms"], ["Privacy", "/privacy"], ["Contact", "/contact"], ["FAQ", "/faq"]].map(([label, href]) => (
              <a key={label} href={href} className="hover:text-violet-600 transition-colors">{label}</a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">© 2024 RewardsVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
