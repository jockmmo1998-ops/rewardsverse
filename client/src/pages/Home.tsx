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

  // Redirect to dashboard when user becomes authenticated
  useEffect(() => {
    if (user && !loading) {
      setLocation("/dashboard");
    }
  }, [user, loading]);

  const handleRegister = async () => {
    if (!username.trim() || username.length < 3) return;
    if (!password.trim() || password.length < 6) return;
    setIsSubmitting(true);
    try {
      await register(username.trim(), password.trim(), refCode.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || username.length < 3) return;
    if (!password.trim() || password.length < 6) return;
    setIsSubmitting(true);
    try {
      await login(username.trim(), password.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build ticker items from real activities or fallback
  const tickerItems = activities && activities.length > 0
    ? activities.slice(0, 12).map((a: any) => ({
        type: a.type,
        user: a.username,
        desc: a.description,
        amount: a.amount,
      }))
    : [
        { type: "offer_complete", user: "CryptoKing", desc: "earned $2.50 on Gemiwall", amount: "$2.50" },
        { type: "withdrawal", user: "MoonWalker", desc: "withdrew $15.00 via BTC", amount: "$15.00" },
        { type: "offer_complete", user: "NFTFan99", desc: "earned $1.25 on Taskwall", amount: "$1.25" },
        { type: "daily_claim", user: "StreakPro", desc: "claimed daily bonus $0.25", amount: "$0.25" },
        { type: "offer_complete", user: "DogeLover", desc: "earned $5.00 on Revtoo", amount: "$5.00" },
        { type: "withdrawal", user: "ETHWhale", desc: "withdrew $8.75 via ETH", amount: "$8.75" },
      ];

  const badgeColors: Record<string, string> = {
    offer_complete: "bg-green-500/10 text-green-400 border-green-500/20",
    withdrawal: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    daily_claim: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    referral: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  const badgeLabels: Record<string, string> = {
    offer_complete: "EARNED",
    withdrawal: "WITHDRAW",
    daily_claim: "BONUS",
    referral: "REFERRAL",
  };

  const features = [
    { icon: MousePointer2, title: "Simple Tasks", desc: "Earn by clicking, watching, and testing apps.", color: "text-green-400" },
    { icon: Gamepad2, title: "Play Games", desc: "Get paid to play your favorite mobile games.", color: "text-cyan-400" },
    { icon: Smartphone, title: "App Testing", desc: "Try new apps and share your feedback for rewards.", color: "text-blue-400" },
    { icon: Wallet, title: "Fast Payouts", desc: "Withdraw your earnings via Crypto in under 24h.", color: "text-purple-400" },
  ];

  const testimonials = [
    { name: "Alex J.", text: "Best rewards site I've used. Withdrew $5 in Litecoin within hours!", rating: 5 },
    { name: "Sarah K.", text: "The interface is so smooth. Love the daily streak bonus!", rating: 5 },
    { name: "Mike R.", text: "Fastest payouts in the industry. Highly recommended.", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-green-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Real-time Activity Ticker */}
      <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-background/80 backdrop-blur-md border-b border-border/50 overflow-hidden flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-[11px] font-medium text-muted-foreground">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              {tickerItems.map((item, idx) => (
                <span key={`${i}-${idx}`} className="flex items-center gap-2">
                  <Badge variant="outline" className={`${badgeColors[item.type] || badgeColors.offer_complete} py-0 h-5`}>
                    {badgeLabels[item.type] || "EARNED"}
                  </Badge>
                  <span className="text-white font-semibold">{item.user}</span>
                  <span>{item.desc}</span>
                  {item.amount && <span className="text-green-400 font-semibold">{item.amount}</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-40 pt-12 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl gradient-green-cyan flex items-center justify-center shadow-lg shadow-green-500/20">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gradient">Rewards</span>Verse
            </h1>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-bold">Fast Payouts</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
          <a href="#earn" className="hover:text-green-400 transition-colors">How to Earn</a>
          <a href="#payouts" className="hover:text-green-400 transition-colors">Payouts</a>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          onClick={() => {
            setActiveTab("login");
            document.getElementById("auth-card")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Login
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-6 py-1 px-3">
              <Zap className="w-3 h-3 mr-2" />
              Trusted by 50,000+ Users
            </Badge>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Turn Your <span className="text-gradient">Free Time</span> Into Crypto.
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Join the most professional rewards platform. Complete simple tasks, play games, and test apps to earn real money. Get paid instantly in your favorite cryptocurrency.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <div className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-4 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium">Min. Withdrawal $0.50</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-4 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium">Fast Payouts &lt; 24h</span>
              </div>

            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background bg-green-500 flex items-center justify-center text-[10px] font-bold text-white">
                  +50k
                </div>
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-yellow-400 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <p className="text-muted-foreground font-medium">4.9/5 Average Rating</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            id="auth-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />

            <Card className="relative z-10 border border-green-500/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-green-500/10">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <p className="text-sm text-muted-foreground">Start earning in seconds</p>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TabsContent value="login" className="space-y-4 mt-0">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                            <User className="w-3 h-3" /> Username
                          </label>
                          <Input
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && password.trim().length >= 6 && handleLogin()}
                            className="bg-background/50 border-border/50 focus:border-green-500 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                              className="bg-background/50 border-border/50 focus:border-green-500 h-12 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <Button
                          onClick={handleLogin}
                          disabled={isSubmitting || !username.trim() || username.length < 3 || !password.trim() || password.length < 6}
                          className="w-full h-12 gradient-green-cyan text-white font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Authenticating...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              Sign In to RewardsVerse
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="register" className="space-y-4 mt-0">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                            <User className="w-3 h-3" /> Choose Username
                          </label>
                          <Input
                            placeholder="e.g. CryptoKing"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-background/50 border-border/50 focus:border-green-500 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Min. 6 characters"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="bg-background/50 border-border/50 focus:border-green-500 h-12 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground ml-1">Referral Code (Optional)</label>
                          <Input
                            placeholder="Enter code for $0.10 bonus"
                            value={refCode}
                            onChange={(e) => setRefCode(e.target.value)}
                            className="bg-background/50 border-border/50 focus:border-green-500 h-12"
                          />
                        </div>
                        <Button
                          onClick={handleRegister}
                          disabled={isSubmitting || !username.trim() || username.length < 3 || !password.trim() || password.length < 6}
                          className="w-full h-12 gradient-green-cyan text-white font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Creating Account...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              Join RewardsVerse Now
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </Button>
                      </TabsContent>
                    </motion.div>
                  </AnimatePresence>
                </Tabs>

                <div className="mt-6 flex items-center justify-center gap-4 py-4 border-t border-border/50">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-white">24h</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Avg. Payout</span>
                  </div>
                  <div className="w-px h-8 bg-border/50" />
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-white">0%</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Fees</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="pt-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Why Choose RewardsVerse?</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">We provide the most professional environment for earning rewards online with high-paying offers and reliable payouts.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-green-500/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h4 className="text-lg font-bold mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Banner */}
        <section id="payouts" className="mt-32 p-8 md:p-12 rounded-3xl gradient-green-cyan relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-4xl font-black mb-1">$125K+</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Paid Out</p>
            </div>
            <div>
              <p className="text-4xl font-black mb-1">50K+</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Users</p>
            </div>
            <div>
              <p className="text-4xl font-black mb-1">2.5M+</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Offers Done</p>
            </div>
            <div>
              <p className="text-4xl font-black mb-1">4.9/5</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Rating</p>
            </div>
          </div>
        </section>

        {/* How to Earn */}
        <section id="earn" className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">How to Earn</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to start making money.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Register in 5 seconds and get $0.50 instantly.", icon: User },
              { step: "02", title: "Complete Offers", desc: "Browse 7+ offer walls and complete tasks to earn more.", icon: Gamepad2 },
              { step: "03", title: "Withdraw Crypto", desc: "Cash out to BTC, ETH, LTC, DOGE, SOL, or USDT.", icon: Wallet },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-2xl bg-card/30 border border-border/30"
              >
                <div className="text-5xl font-black text-gradient mb-4">{item.step}</div>
                <div className="w-14 h-14 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-green-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">What Our Users Say</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">Join thousands of satisfied earners who are making money every day.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-card/50 border-border/50 p-6">
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm italic mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} alt={t.name} />
                  </div>
                  <span className="text-sm font-bold">{t.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center py-20 px-6 rounded-3xl bg-muted/30 border border-border/50">
          <h3 className="text-4xl font-bold mb-6">Ready to Start Earning?</h3>
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">Create your account in 5 seconds and get your $0.50 starting bonus immediately.</p>
          <Button
            size="lg"
            className="gradient-green-cyan text-white font-bold px-10 h-14 rounded-xl shadow-xl shadow-green-500/20 hover:scale-105 transition-all"
            onClick={() => {
              setActiveTab("register");
              document.getElementById("auth-card")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Create My Free Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> No KYC Required</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> Global Access</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> Instant Setup</span>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg gradient-green-cyan flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">
                <span className="text-gradient">Rewards</span>Verse
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
              The world's most professional GPT rewards platform. We connect users with the best earning opportunities while providing industry-leading payout speeds and security.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-card border border-border/50 flex items-center justify-center hover:text-green-400 transition-colors cursor-pointer"><Users size={18} /></div>
              <div className="w-10 h-10 rounded-lg bg-card border border-border/50 flex items-center justify-center hover:text-green-400 transition-colors cursor-pointer"><Trophy size={18} /></div>
              <div className="w-10 h-10 rounded-lg bg-card border border-border/50 flex items-center justify-center hover:text-green-400 transition-colors cursor-pointer"><ExternalLink size={18} /></div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-sm mb-6">Quick Links</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-green-400 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Offer Walls</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Referral Program</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Leaderboard</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm mb-6">Support</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><button onClick={() => setLocation('/faq')} className="hover:text-green-400 transition-colors">FAQ</button></li>
              <li><button onClick={() => setLocation('/terms')} className="hover:text-green-400 transition-colors">Terms of Service</button></li>
              <li><button onClick={() => setLocation('/privacy')} className="hover:text-green-400 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => setLocation('/contact')} className="hover:text-green-400 transition-colors">Contact Us</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; 2025 RewardsVerse. Fast Payouts Guaranteed. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1"><Shield size={12} className="text-green-400" /> SSL Secured</span>
            <span className="flex items-center gap-1"><Shield size={12} className="text-green-400" /> AES-256 Encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
