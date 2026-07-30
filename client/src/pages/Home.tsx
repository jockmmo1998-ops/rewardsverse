import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  Zap, Shield, Clock, Coins, Trophy, ArrowRight,
  CheckCircle2, Star, Users, Smartphone,
  Gamepad2, Wallet, MousePointer2, Eye, EyeOff, Lock, User,
  TrendingUp, Sparkles, Gift,
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

  useEffect(() => { if (user && !loading) setLocation("/dashboard"); }, [user, loading]);

  const handleLogin = async () => {
    if (!username.trim() || username.length < 3 || !password.trim() || password.length < 6) return;
    setIsSubmitting(true);
    try { await login(username.trim(), password.trim()); } finally { setIsSubmitting(false); }
  };
  const handleRegister = async () => {
    if (!username.trim() || username.length < 3 || !password.trim() || password.length < 6) return;
    setIsSubmitting(true);
    try { await register(username.trim(), password.trim(), refCode.trim() || undefined); } finally { setIsSubmitting(false); }
  };

  const tickerItems = activities && activities.length > 0
    ? activities.slice(0, 12)
    : [
        { type: "offer_complete", username: "CryptoKing",  description: "completed survey on Gemiwall", amount: "2.50" },
        { type: "withdrawal",     username: "MoonWalker",  description: "withdrew via BTC",              amount: "15.00" },
        { type: "offer_complete", username: "NFTFan99",    description: "earned on Revtoo",              amount: "3.75" },
        { type: "daily_claim",    username: "StreakPro",   description: "claimed daily bonus",           amount: "0.25" },
        { type: "offer_complete", username: "DogeLover",   description: "completed Klink Finance offer", amount: "5.00" },
        { type: "withdrawal",     username: "ETHWhale",    description: "withdrew via ETH",              amount: "22.00" },
      ];

  const tickerBadge = (type: string) => ({
    offer_complete: "tag-green", withdrawal: "tag-cyan", daily_claim: "tag-gold", referral: "tag-purple",
  }[type] || "tag-gpt");
  const tickerLabel = (type: string) => ({
    offer_complete: "EARNED", withdrawal: "WITHDRAW", daily_claim: "BONUS", referral: "REFERRAL",
  }[type] || "EARNED");

  const features = [
    { icon: MousePointer2, title: "Simple Tasks",   desc: "Earn by clicking, watching, and testing apps.",          color: "#4ade80", glow: "rgba(74,222,128,0.12)" },
    { icon: Gamepad2,      title: "Play Games",     desc: "Get paid to play your favorite mobile games.",           color: "#22d3ee", glow: "rgba(34,211,238,0.12)" },
    { icon: Smartphone,    title: "App Testing",    desc: "Try new apps and share your feedback for rewards.",      color: "#818cf8", glow: "rgba(99,102,241,0.12)" },
    { icon: Wallet,        title: "Fast Payouts",   desc: "Withdraw via Crypto in under 24 hours, zero fees.",      color: "#c084fc", glow: "rgba(168,85,247,0.12)" },
    { icon: Users,         title: "Refer & Earn",   desc: "Get 10% lifetime commission from every referral.",       color: "#fbbf24", glow: "rgba(251,191,36,0.12)" },
    { icon: TrendingUp,    title: "Daily Streaks",  desc: "Log in every day to multiply your earning potential.",   color: "#f87171", glow: "rgba(248,113,113,0.12)" },
  ];

  const steps = [
    { num: 1, title: "Create Account",      desc: "Sign up free in under 30 seconds, no credit card needed." },
    { num: 2, title: "Complete Offers",     desc: "Browse 7 offer walls and pick tasks that interest you." },
    { num: 3, title: "Withdraw Crypto",     desc: "Cash out to BTC, ETH, LTC or USDT instantly." },
  ];

  const testimonials = [
    { name: "Alex J.",  text: "Best rewards site I've used. Withdrew $50 in Litecoin within hours!", rating: 5 },
    { name: "Sarah K.", text: "The interface is so smooth. Love the daily streak bonus!", rating: 5 },
    { name: "Mike R.",  text: "Fastest payouts I've ever seen. Highly recommended.", rating: 5 },
  ];

  const stats = [
    { value: "$125K+", label: "Paid Out",    color: "#818cf8" },
    { value: "50K+",   label: "Users",       color: "#22d3ee" },
    { value: "2.5M+",  label: "Offers Done", color: "#c084fc" },
    { value: "4.9★",   label: "Rating",      color: "#fbbf24" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.75rem",
    color: "#f4f4f8", fontSize: "0.875rem", outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#f4f4f8" }}>
      {/* Background layers */}
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"55%", height:"55%", background:"radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", filter:"blur(80px)" }} />
        <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:"45%", height:"45%", background:"radial-gradient(circle, rgba(168,85,247,0.10), transparent 70%)", filter:"blur(80px)" }} />
        <div style={{ position:"absolute", top:"40%", left:"35%", width:"25%", height:"25%", background:"radial-gradient(circle, rgba(34,211,238,0.06), transparent 70%)", filter:"blur(60px)" }} />
      </div>

      {/* ── Activity Ticker ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-8 overflow-hidden flex items-center"
        style={{ background:"rgba(10,10,15,0.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="w-14 shrink-0 g-primary flex items-center justify-center h-full">
          <span className="text-white text-[9px] font-black tracking-widest">LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-14 text-[11px] ml-4">
            {Array.from({ length: 3 }).map((_, ri) =>
              tickerItems.map((a: any, idx: number) => (
                <span key={`${ri}-${idx}`} className="flex items-center gap-2">
                  <span className={`${tickerBadge(a.type)} text-[10px]`}>{tickerLabel(a.type)}</span>
                  <span style={{ color:"rgba(255,255,255,0.75)", fontWeight:600 }}>{a.username}</span>
                  <span style={{ color:"#818cf8", fontWeight:700 }}>+${parseFloat(a.amount||"0").toFixed(2)}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-40 pt-11 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl g-primary flex items-center justify-center animate-pulse-ring"
            style={{ boxShadow:"0 0 20px rgba(99,102,241,0.45)" }}>
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black"><span className="text-g-primary">Rewards</span><span style={{ color:"#f4f4f8" }}>Verse</span></h1>
            <p style={{ fontSize:"0.6rem", color:"rgba(129,140,248,0.7)", letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700 }}>Fast Payouts</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color:"rgba(255,255,255,0.45)" }}>
          {["Features", "How to Earn", "Payouts"].map((link) => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g,"-")}`}
              style={{ transition:"color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color="#818cf8")}
              onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.45)")}>
              {link}
            </a>
          ))}
        </div>

        <button className="btn-ghost-gpt text-sm" onClick={() => { setActiveTab("login"); document.getElementById("auth-card")?.scrollIntoView({ behavior:"smooth" }); }}>
          Sign In
        </button>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 pt-12 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left copy */}
          <motion.div initial={{ opacity:0, x:-28 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7 }}>
            <div className="inline-flex items-center gap-2 tag-gpt mb-7">
              <Zap className="w-3.5 h-3.5" /> Trusted by 50,000+ Users
            </div>

            <h2 className="text-5xl md:text-6xl font-black leading-[1.06] tracking-tight mb-6"
              style={{ fontFamily:"var(--font-display, Inter)" }}>
              Turn Your{" "}
              <span className="text-shimmer">Free Time</span>
              <br />Into Crypto.
            </h2>

            <p className="text-lg mb-9 max-w-lg leading-relaxed" style={{ color:"rgba(255,255,255,0.45)" }}>
              Join the most professional rewards platform. Complete simple tasks, play games, and test apps to earn real money — paid out in your favourite cryptocurrency.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {["Min. Withdrawal $0.50","Fast Payouts < 24h","0% Fees"].map((txt) => (
                <div key={txt} className="flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color:"#4ade80" }} />
                  <span style={{ color:"rgba(255,255,255,0.70)" }}>{txt}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full overflow-hidden" style={{ border:"2px solid #0a0a0f", boxShadow:"0 0 8px rgba(99,102,241,0.25)" }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[9px] font-black text-white g-primary" style={{ border:"2px solid #0a0a0f" }}>+50k</div>
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.40)" }}>4.9/5 Average Rating</p>
              </div>
            </div>
          </motion.div>

          {/* Auth card */}
          <motion.div id="auth-card" initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.7, delay:0.2 }} className="relative">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle, rgba(99,102,241,0.20), transparent)", filter:"blur(40px)" }} />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle, rgba(168,85,247,0.18), transparent)", filter:"blur(40px)" }} />

            <div className="glass-elevated rounded-2xl p-0.5">
              <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(12,12,20,0.96)" }}>
                <div className="px-8 pt-8 pb-4 text-center">
                  <div className="w-14 h-14 rounded-xl g-primary flex items-center justify-center mx-auto mb-4" style={{ boxShadow:"0 0 20px rgba(99,102,241,0.50)" }}>
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-1">Welcome to RewardsVerse</h3>
                  <p style={{ color:"rgba(255,255,255,0.38)", fontSize:"0.875rem" }}>Start earning in seconds</p>
                </div>

                <div className="px-8 pb-8">
                  {/* Tab switcher */}
                  <div className="flex gap-0.5 p-1 rounded-xl mb-6" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                    {(["login","register"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all capitalize"
                        style={activeTab === tab
                          ? { background:"linear-gradient(135deg,#6366f1,#a855f7)", color:"#fff", boxShadow:"0 4px 16px rgba(99,102,241,0.35)" }
                          : { color:"rgba(255,255,255,0.40)" }}>
                        {tab === "login" ? "Sign In" : "Register"}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.18 }}
                      className="space-y-4">
                      {/* Username */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.40)" }}>
                          <User className="w-3 h-3" style={{ color:"#818cf8" }} />{activeTab === "register" ? "Choose Username" : "Username"}
                        </label>
                        <input style={inputStyle} placeholder={activeTab === "register" ? "e.g. CryptoKing" : "Enter your username"}
                          value={username} onChange={e => setUsername(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && activeTab === "login" && handleLogin()}
                          onFocus={e => { e.target.style.borderColor="rgba(99,102,241,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; }}
                          onBlur={e  => { e.target.style.borderColor="rgba(255,255,255,0.08)"; e.target.style.boxShadow="none"; }} />
                      </div>
                      {/* Password */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.40)" }}>
                          <Lock className="w-3 h-3" style={{ color:"#818cf8" }} /> Password
                        </label>
                        <div className="relative">
                          <input style={{ ...inputStyle, paddingRight:"2.75rem" }}
                            type={showPassword ? "text" : "password"}
                            placeholder={activeTab === "register" ? "Min. 6 characters" : "Enter your password"}
                            value={password} onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && activeTab === "login" && handleLogin()}
                            onFocus={e => { e.target.style.borderColor="rgba(99,102,241,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; }}
                            onBlur={e  => { e.target.style.borderColor="rgba(255,255,255,0.08)"; e.target.style.boxShadow="none"; }} />
                          <button onClick={() => setShowPassword(!showPassword)} type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color:"rgba(255,255,255,0.35)", transition:"color 0.2s" }}
                            onMouseEnter={e => (e.currentTarget.style.color="#818cf8")}
                            onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {/* Referral code (register only) */}
                      {activeTab === "register" && (
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:"rgba(255,255,255,0.40)" }}>
                            Referral Code <span style={{ textTransform:"none", fontWeight:400, color:"rgba(255,255,255,0.25)" }}>(optional)</span>
                          </label>
                          <input style={inputStyle} placeholder="Enter code for +$0.10 bonus"
                            value={refCode} onChange={e => setRefCode(e.target.value)}
                            onFocus={e => { e.target.style.borderColor="rgba(99,102,241,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; }}
                            onBlur={e  => { e.target.style.borderColor="rgba(255,255,255,0.08)"; e.target.style.boxShadow="none"; }} />
                        </div>
                      )}
                      {/* Submit */}
                      <button className="btn-gpt w-full mt-1"
                        disabled={isSubmitting || !username.trim() || username.length < 3 || !password.trim() || password.length < 6}
                        onClick={activeTab === "login" ? handleLogin : handleRegister}
                        style={{ opacity: (isSubmitting || !username.trim() || username.length < 3 || !password.trim() || password.length < 6) ? 0.5 : 1 }}>
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {activeTab === "login" ? "Signing in…" : "Creating account…"}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {activeTab === "login" ? "Sign In" : "Join Now"}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                    </motion.div>
                  </AnimatePresence>

                  {/* Mini stats */}
                  <div className="mt-6 pt-5 grid grid-cols-3 gap-2" style={{ borderTop:"1px solid rgba(99,102,241,0.12)" }}>
                    {[{ val:"24h", lbl:"Avg. Payout" },{ val:"0%", lbl:"Fees" },{ val:"$0.50", lbl:"Min. Withdraw" }].map(s => (
                      <div key={s.lbl} className="text-center">
                        <div className="text-lg font-black text-g-primary">{s.val}</div>
                        <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.30)", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700 }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
              className="glass-stat rounded-2xl p-6 text-center">
              <div className="text-3xl font-black mb-1" style={{ color:s.color }}>{s.value}</div>
              <div style={{ color:"rgba(255,255,255,0.38)", fontSize:"0.8rem", fontWeight:600 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Features ── */}
        <section id="features" className="pt-28">
          <div className="text-center mb-14">
            <span className="tag-gpt mb-4 inline-block"><Zap className="w-3 h-3 inline mr-1" />Why Choose Us</span>
            <h3 className="text-4xl font-black mt-3 mb-3">Why Choose <span className="text-g-primary">RewardsVerse?</span></h3>
            <p style={{ color:"rgba(255,255,255,0.38)", maxWidth:"36rem", margin:"0 auto" }}>The most professional environment for earning rewards — high-paying offers, reliable payouts, zero fees.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
                className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background:f.glow }}>
                  <f.icon className="w-6 h-6" style={{ color:f.color }} />
                </div>
                <h4 className="font-bold text-base mb-2">{f.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.38)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How to Earn ── */}
        <section id="how-to-earn" className="pt-28">
          <div className="text-center mb-14">
            <span className="tag-cyan mb-4 inline-block">3 Simple Steps</span>
            <h3 className="text-4xl font-black mt-3 mb-3">Start Earning <span className="text-g-cyan">Today</span></h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                className="flex flex-col items-center text-center glass rounded-2xl p-8">
                <div className="step-num mb-5">{s.num}</div>
                <h4 className="font-bold text-lg mb-2">{s.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.38)" }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Payouts section ── */}
        <section id="payouts" className="pt-28">
          <div className="glass-elevated rounded-3xl overflow-hidden">
            <div className="p-10 md:p-14 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="tag-gold mb-4 inline-block"><Coins className="w-3 h-3 inline mr-1" />Payouts</span>
                <h3 className="text-4xl font-black mt-3 mb-4">Withdraw <span className="text-g-gold">Anytime</span></h3>
                <p className="mb-6 text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.40)" }}>
                  RewardsVerse supports multiple cryptocurrencies. Minimum $0.50, processed within 24 hours.
                </p>
                {[
                  { name:"Bitcoin",  sym:"BTC", color:"#f59e0b" },
                  { name:"Ethereum", sym:"ETH", color:"#818cf8" },
                  { name:"Litecoin", sym:"LTC", color:"#22d3ee" },
                  { name:"Tether",   sym:"USDT",color:"#4ade80" },
                ].map(c => (
                  <div key={c.sym} className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:`${c.color}18` }}>
                        <Coins className="w-4 h-4" style={{ color:c.color }} />
                      </div>
                      <span className="font-semibold text-sm">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tag-gpt text-[10px]">{c.sym}</span>
                      <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.75rem" }}>Min $0.50</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { icon:CheckCircle2, text:"Processed within 24 hours", color:"#4ade80" },
                  { icon:Shield,       text:"256-bit SSL encryption",      color:"#22d3ee" },
                  { icon:Zap,          text:"Zero withdrawal fees",         color:"#818cf8" },
                  { icon:Clock,        text:"Payments 7 days a week",       color:"#c084fc" },
                ].map((item, i) => (
                  <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background:`${item.color}15` }}>
                      <item.icon className="w-4 h-4" style={{ color:item.color }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"rgba(255,255,255,0.75)" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="pt-28">
          <div className="text-center mb-14">
            <span className="tag-purple mb-4 inline-block"><Star className="w-3 h-3 inline mr-1" />Reviews</span>
            <h3 className="text-4xl font-black mt-3 mb-3">What Users <span className="text-g-primary">Say</span></h3>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                className="glass rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length:t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm mb-5 leading-relaxed" style={{ color:"rgba(255,255,255,0.55)" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} alt={t.name} /></div>
                  <span className="font-bold text-sm">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-24 pb-10">
          <div className="divider-gpt mb-10" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl g-primary flex items-center justify-center"><Coins className="w-5 h-5 text-white" /></div>
              <span className="font-black"><span className="text-g-primary">Rewards</span><span style={{ color:"#f4f4f8" }}>Verse</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color:"rgba(255,255,255,0.35)" }}>
              {[["FAQ","/faq"],["Contact","/contact"],["Terms","/terms"],["Privacy","/privacy"]].map(([l,h]) => (
                <a key={l} href={h} style={{ transition:"color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color="#818cf8")}
                  onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.35)")}>{l}</a>
              ))}
            </div>
            <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.8rem" }}>© 2026 RewardsVerse. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
