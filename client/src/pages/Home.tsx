import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Shield, Clock, Coins, Trophy, ArrowRight,
  CheckCircle2, Star, Users, ExternalLink, Smartphone,
  Gamepad2, Wallet, MousePointer2, Eye, EyeOff, Lock, User,
  TrendingUp, Clock3
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
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (user && !loading) setLocation("/dashboard");
  }, [user, loading]);

  const handleRegister = async () => {
    if (!username.trim() || username.length < 3) return;
    if (!password.trim() || password.length < 6) return;
    setIsSubmitting(true);
    try { await register(username.trim(), password.trim(), refCode.trim() || undefined); }
    finally { setIsSubmitting(false); }
  };

  const handleLogin = async () => {
    if (!username.trim() || username.length < 3) return;
    if (!password.trim() || password.length < 6) return;
    setIsSubmitting(true);
    try { await login(username.trim(), password.trim()); }
    finally { setIsSubmitting(false); }
  };

  const tickerItems = activities && activities.length > 0
    ? activities.slice(0, 12).map((a: any) => ({ type: a.type, user: a.username, desc: a.description, amount: a.amount }))
    : [
        { type: "offer_complete", user: "CryptoKing", desc: "earned $2.50 on Gemiwall", amount: "$2.50" },
        { type: "withdrawal", user: "MoonWalker", desc: "withdrew $15.00 via BTC", amount: "$15.00" },
        { type: "offer_complete", user: "NFTFan99", desc: "earned $1.25 on Taskwall", amount: "$1.25" },
        { type: "daily_claim", user: "StreakPro", desc: "claimed daily bonus $0.25", amount: "$0.25" },
        { type: "offer_complete", user: "DogeLover", desc: "earned $5.00 on Revtoo", amount: "$5.00" },
        { type: "withdrawal", user: "ETHWhale", desc: "withdrew $8.75 via ETH", amount: "$8.75" },
      ];

  const badgeColors: Record<string, string> = {
    offer_complete: "bg-green-500/10 text-green-400 border-green-500/30",
    withdrawal: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    daily_claim: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    referral: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };
  const badgeLabels: Record<string, string> = {
    offer_complete: "EARNED", withdrawal: "WITHDRAW", daily_claim: "BONUS", referral: "REFERRAL",
  };

  const features = [
    { icon: MousePointer2, title: "Simple Tasks", desc: "Earn by clicking, watching, and testing apps.", color: "text-green-400", glow: "rgba(0,255,135,0.15)" },
    { icon: Gamepad2,      title: "Play Games",   desc: "Get paid to play your favorite mobile games.", color: "text-cyan-400", glow: "rgba(0,229,255,0.15)" },
    { icon: Smartphone,    title: "App Testing",  desc: "Try new apps and share your feedback for rewards.", color: "text-blue-400", glow: "rgba(59,130,246,0.15)" },
    { icon: Wallet,        title: "Fast Payouts", desc: "Withdraw your earnings via Crypto in under 24h.", color: "text-purple-400", glow: "rgba(168,85,247,0.15)" },
  ];

  const testimonials = [
    { name: "Alex J.",  text: "Best rewards site I've used. Withdrew $5 in Litecoin within hours!", rating: 5 },
    { name: "Sarah K.", text: "The interface is so smooth. Love the daily streak bonus!", rating: 5 },
    { name: "Mike R.",  text: "Fastest payouts in the industry. Highly recommended.", rating: 5 },
  ];

  const stats = [
    { value: "$125K+", label: "Paid Out" },
    { value: "50K+",   label: "Users" },
    { value: "2.5M+",  label: "Offers Done" },
    { value: "4.9/5",  label: "Rating" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid bg-scan selection:bg-green-500/30">

      {/* ── Fixed cyber grid background ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] bg-purple-500/4 blur-[100px] rounded-full" />
        {/* vertical scan line */}
        <div className="absolute inset-0 bg-scan opacity-30 pointer-events-none" />
      </div>

      {/* ── Activity Ticker ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-background/90 backdrop-blur-md border-b border-green-500/10 overflow-hidden flex items-center">
        <div className="w-1 h-full bg-gradient-to-b from-green-400 to-cyan-400 shrink-0" />
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-[11px] font-medium text-muted-foreground ml-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              {tickerItems.map((item, idx) => (
                <span key={`${i}-${idx}`} className="flex items-center gap-2">
                  <Badge variant="outline" className={`${badgeColors[item.type] || badgeColors.offer_complete} py-0 h-5 font-bold tracking-wide`}>
                    {badgeLabels[item.type] || "EARNED"}
                  </Badge>
                  <span className="text-white font-semibold">{item.user}</span>
                  <span>{item.desc}</span>
                  {item.amount && <span className="text-green-400 font-bold glow-text-green">{item.amount}</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative z-40 pt-12 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl gradient-cyber flex items-center justify-center glow-green shadow-lg">
            <Coins className="w-6 h-6 text-[#060818]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gradient">Rewards</span><span className="text-white">Verse</span>
            </h1>
            <p className="text-[9px] text-green-400/70 tracking-[0.2em] uppercase font-bold">Fast Payouts</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {["Features", "How to Earn", "Payouts"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              className="hover:text-green-400 transition-colors relative group"
            >
              {link}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-green-400 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-400 hover:shadow-[0_0_16px_rgba(0,255,135,0.2)] transition-all font-bold tracking-wide"
          onClick={() => {
            setActiveTab("login");
            document.getElementById("auth-card")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Sign In
        </Button>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Copy */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-green-500/8 border border-green-500/25 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400 tracking-wider uppercase">Trusted by 50,000+ Users</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
              Turn Your{" "}
              <span className="text-gradient glow-text-green">Free Time</span>
              <br />Into Crypto.
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Join the most professional rewards platform. Complete simple tasks, play games, and test apps to earn real money. Get paid instantly in your favorite cryptocurrency.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              {[
                { text: "Min. Withdrawal $0.50" },
                { text: "Fast Payouts < 24h" },
                { text: "0% Fees" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 cyber-card rounded-full px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden ring-1 ring-green-500/20">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background gradient-cyber flex items-center justify-center text-[10px] font-black text-[#060818] ring-1 ring-green-500/40">
                  +50k
                </div>
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-yellow-400 mb-0.5">
                  {[1,2,3,4,5].map((i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <p className="text-muted-foreground font-medium">4.9/5 Average Rating</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Auth Card */}
          <motion.div
            id="auth-card"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-green-500/15 blur-[80px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/15 blur-[80px] rounded-full animate-pulse pointer-events-none" />

            <div className="cyber-card cyber-corner rounded-2xl p-0.5 glow-green">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="w-14 h-14 gradient-cyber rounded-2xl flex items-center justify-center mx-auto mb-4 glow-green">
                    <Coins className="w-7 h-7 text-[#060818]" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Welcome to RewardsVerse</CardTitle>
                  <p className="text-sm text-muted-foreground">Start earning in seconds</p>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/30 border border-border/50">
                      <TabsTrigger value="login" className="font-bold data-[state=active]:text-green-400">Login</TabsTrigger>
                      <TabsTrigger value="register" className="font-bold data-[state=active]:text-green-400">Register</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* LOGIN */}
                        <TabsContent value="login" className="space-y-4 mt-0">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                              <User className="w-3 h-3 text-green-400" /> Username
                            </label>
                            <Input
                              placeholder="Enter your username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && password.trim().length >= 6 && handleLogin()}
                              className="bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] h-12 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                              <Lock className="w-3 h-3 text-green-400" /> Password
                            </label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                className="bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] h-12 pr-10 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-green-400 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <Button
                            onClick={handleLogin}
                            disabled={isSubmitting || !username.trim() || username.length < 3 || !password.trim() || password.length < 6}
                            className="w-full h-12 btn-cyber rounded-xl font-black tracking-widest uppercase text-sm"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#060818]/30 border-t-[#060818] rounded-full animate-spin" />
                                Authenticating...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                Sign In <ArrowRight className="w-4 h-4" />
                              </div>
                            )}
                          </Button>
                        </TabsContent>

                        {/* REGISTER */}
                        <TabsContent value="register" className="space-y-4 mt-0">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                              <User className="w-3 h-3 text-green-400" /> Choose Username
                            </label>
                            <Input
                              placeholder="e.g. CryptoKing"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] h-12 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                              <Lock className="w-3 h-3 text-green-400" /> Password
                            </label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] h-12 pr-10 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-green-400 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">
                              Referral Code <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                            </label>
                            <Input
                              placeholder="Enter code for $0.10 bonus"
                              value={refCode}
                              onChange={(e) => setRefCode(e.target.value)}
                              className="bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] h-12 transition-all"
                            />
                          </div>
                          <Button
                            onClick={handleRegister}
                            disabled={isSubmitting || !username.trim() || username.length < 3 || !password.trim() || password.length < 6}
                            className="w-full h-12 btn-cyber rounded-xl font-black tracking-widest uppercase text-sm"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#060818]/30 border-t-[#060818] rounded-full animate-spin" />
                                Creating Account...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                Join Now <ArrowRight className="w-4 h-4" />
                              </div>
                            )}
                          </Button>
                        </TabsContent>
                      </motion.div>
                    </AnimatePresence>
                  </Tabs>

                  {/* mini stats */}
                  <div className="mt-6 grid grid-cols-3 gap-2 pt-5 border-t border-green-500/10">
                    {[{ val: "24h", label: "Avg. Payout" }, { val: "0%", label: "Fees" }, { val: "$0.50", label: "Min. Withdraw" }].map((s) => (
                      <div key={s.label} className="flex flex-col items-center">
                        <span className="text-lg font-black text-gradient">{s.val}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wide">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* ── Features ── */}
        <section id="features" className="pt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 tag-cyber mb-4">
              <Zap className="w-3 h-3" /> Why Choose Us
            </div>
            <h3 className="text-4xl font-extrabold mb-4">Why Choose <span className="text-gradient">RewardsVerse?</span></h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The most professional environment for earning rewards online — high-paying offers and reliable payouts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="cyber-card cyber-corner p-6 rounded-2xl group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ background: f.glow }}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h4 className="text-lg font-bold mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Stats Banner ── */}
        <section id="payouts" className="mt-32 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 gradient-cyber opacity-90" />
          <div className="absolute inset-0 bg-scan opacity-20" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-[#060818] p-10 md:p-14">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-5xl font-black mb-1">{s.value}</p>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How to Earn ── */}
        <section id="how-to-earn" className="mt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 tag-cyber mb-4">
              <TrendingUp className="w-3 h-3" /> 3 Easy Steps
            </div>
            <h3 className="text-4xl font-extrabold mb-4">How to <span className="text-gradient">Earn</span></h3>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to start making money.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Register in 5 seconds and get $0.50 instantly.", icon: User, color: "text-green-400", glow: "rgba(0,255,135,0.15)" },
              { step: "02", title: "Complete Offers", desc: "Browse 7+ offer walls and complete tasks to earn.", icon: Gamepad2, color: "text-cyan-400", glow: "rgba(0,229,255,0.15)" },
              { step: "03", title: "Withdraw Crypto", desc: "Cash out to BTC, ETH, LTC, DOGE, SOL, or USDT.", icon: Wallet, color: "text-purple-400", glow: "rgba(168,85,247,0.15)" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="cyber-card p-8 rounded-2xl text-center group relative overflow-hidden"
              >
                {/* connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-green-400/50 to-transparent z-10" />
                )}
                <div className="text-6xl font-black text-gradient mb-4 opacity-40">{item.step}</div>
                <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: item.glow }}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 tag-cyan mb-4">
              <Star className="w-3 h-3" /> Community
            </div>
            <h3 className="text-4xl font-extrabold mb-4">What Our <span className="text-gradient">Users Say</span></h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of satisfied earners who are making money every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="cyber-card p-6 rounded-2xl h-full flex flex-col">
                  <div className="flex items-center gap-1 text-yellow-400 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-sm italic mb-6 leading-relaxed text-muted-foreground flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-green-500/10">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-green-500/20">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} alt={t.name} />
                    </div>
                    <span className="text-sm font-bold">{t.name}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mt-32 text-center py-20 px-6 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 cyber-card bg-scan rounded-3xl" />
          <div className="absolute inset-0 bg-grid opacity-50 rounded-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 tag-cyber mb-6">
              <Zap className="w-3 h-3" /> Get Started
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold mb-6">
              Ready to Start <span className="text-gradient">Earning?</span>
            </h3>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
              Create your account in 5 seconds and get your $0.50 starting bonus immediately.
            </p>
            <Button
              size="lg"
              className="btn-cyber h-14 px-10 rounded-xl font-black tracking-widest uppercase text-sm animate-neon-pulse"
              onClick={() => {
                setActiveTab("register");
                document.getElementById("auth-card")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-6 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-5">
              {["No KYC Required", "Global Access", "Instant Setup"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {t}
                </span>
              ))}
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-green-500/10 py-14 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl gradient-cyber flex items-center justify-center glow-green">
                <Coins className="w-5 h-5 text-[#060818]" />
              </div>
              <h1 className="text-lg font-bold">
                <span className="text-gradient">Rewards</span>Verse
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
              The world's most professional GPT rewards platform. Industry-leading payout speeds and military-grade security.
            </p>
            <div className="flex items-center gap-3">
              {[Users, Trophy, ExternalLink].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-lg cyber-card flex items-center justify-center hover:text-green-400 transition-colors cursor-pointer hover:border-neon-green">
                  <Icon size={16} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-bold text-sm mb-6 text-gradient uppercase tracking-wider">Quick Links</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {["How it Works", "Offer Walls", "Referral Program", "Leaderboard"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-green-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-green-400/40 group-hover:bg-green-400 transition-colors" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm mb-6 text-gradient uppercase tracking-wider">Support</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {[
                { label: "FAQ", path: "/faq" },
                { label: "Terms of Service", path: "/terms" },
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Contact Us", path: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => setLocation(item.path)}
                    className="hover:text-green-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-green-400/40 group-hover:bg-green-400 transition-colors" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider-cyber my-10" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; 2025 RewardsVerse. Fast Payouts Guaranteed. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-green-400" /> SSL Secured</span>
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-cyan-400" /> AES-256 Encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
