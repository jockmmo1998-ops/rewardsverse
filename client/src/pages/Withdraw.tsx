import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Coins, LogOut, LayoutDashboard, Gift as OfferIcon, Wallet,
  History as HistoryIcon, Sparkles, ShieldCheck, AlertCircle,
  CheckCircle2, Zap, Trophy,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PAYOUT_METHODS = [
  { id: "bitcoin",    name: "Bitcoin (BTC)",   fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",  color: "border-orange-500/30 hover:border-orange-400/60",  glow: "rgba(249,115,22,0.1)" },
  { id: "ethereum",   name: "Ethereum (ETH)",  fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", color: "border-blue-500/30 hover:border-blue-400/60",      glow: "rgba(59,130,246,0.1)" },
  { id: "litecoin",   name: "Litecoin (LTC)",  fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/litecoin-ltc-logo.png", color: "border-slate-500/30 hover:border-slate-400/60",    glow: "rgba(148,163,184,0.1)" },
  { id: "dogecoin",   name: "Dogecoin (DOGE)", fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",color: "border-yellow-500/30 hover:border-yellow-400/60",  glow: "rgba(234,179,8,0.1)" },
  { id: "usdt_trc20", name: "USDT (TRC20)",    fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",  color: "border-green-500/30 hover:border-green-400/60",    glow: "rgba(0,255,135,0.1)" },
  { id: "usdt_erc20", name: "USDT (ERC20)",    fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",  color: "border-green-500/30 hover:border-green-400/60",    glow: "rgba(0,255,135,0.1)" },
  { id: "solana",     name: "Solana (SOL)",    fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/solana-sol-logo.png",   color: "border-purple-500/30 hover:border-purple-400/60",  glow: "rgba(168,85,247,0.1)" },
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

export default function Withdraw() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [method, setMethod] = useState("bitcoin");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  const withdrawMutation = trpc.withdraw.create.useMutation({
    onSuccess: () => { toast.success("Withdrawal request submitted! Fast payout in progress."); setAmount(""); setAddress(""); refreshProfile(); },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => { if (!loading && !user) setLocation("/"); }, [user, loading, setLocation]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin glow-green" /></div>;
  if (!user) return null;

  const balance = parseFloat(user.balance || "0") || 0;
  const selectedMethod = PAYOUT_METHODS.find(m => m.id === method);

  const navItems = [
    { label: "Dashboard",   icon: LayoutDashboard, path: "/dashboard",   active: false },
    { label: "Offer Walls", icon: OfferIcon,        path: "/offers",      active: false },
    { label: "Withdraw",    icon: Wallet,            path: "/withdraw",    active: true  },
    { label: "History",     icon: HistoryIcon,       path: "/history",     active: false },
    { label: "Leaderboard", icon: Trophy,            path: "/leaderboard", active: false },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin", active: false }] : []),
  ];

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.5) { toast.error("Minimum withdrawal is $0.50"); return; }
    if (!address) { toast.error("Please enter your wallet address"); return; }
    if (numAmount > balance) { toast.error("Insufficient balance"); return; }
    withdrawMutation.mutate({ amount: numAmount, cryptoType: (selectedMethod?.id || method) as any, walletAddress: address });
  };

  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[25%] h-[25%] bg-green-500/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[25%] h-[25%] bg-cyan-500/4 blur-[120px] rounded-full" />
      </div>

      {/* Ticker */}
      <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-background/90 backdrop-blur-md border-b border-green-500/10 overflow-hidden flex items-center">
        <div className="w-1 h-full bg-gradient-to-b from-green-400 to-cyan-400 shrink-0" />
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-[11px] font-medium text-muted-foreground ml-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              {activities.map((a: any) => (
                <span key={`${i}-${a.id}`} className="flex items-center gap-2">
                  <Badge variant="outline" className={`py-0 h-5 font-bold ${tickerBadge(a.type)}`}>{tickerLabel(a.type)}</Badge>
                  <span className="text-white font-semibold">{a.username}</span>
                  <span>{a.description}</span>
                  {a.amount && <span className="text-green-400 font-bold">${parseFloat(a.amount).toFixed(2)}</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-9 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-green-500/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-cyber flex items-center justify-center glow-green">
              <Coins className="w-5 h-5 text-[#060818]" />
            </div>
            <div>
              <h1 className="text-base font-bold"><span className="text-gradient">Rewards</span>Verse</h1>
              <p className="text-[9px] text-green-400/70 tracking-[0.2em] uppercase font-bold">Fast Payouts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/8 border border-green-500/25 rounded-lg px-3 py-1.5">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-black text-sm">${balance.toFixed(2)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-red-400"><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="fixed top-[6.5rem] left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-green-500/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => setLocation(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${item.active ? "text-green-400 border-green-400 nav-item-active" : "text-muted-foreground border-transparent hover:text-green-400/70"}`}>
              <item.icon className="w-3.5 h-3.5" />{item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 pt-[10.5rem] pb-10 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 tag-cyan mb-3">
              <Wallet className="w-3 h-3" /> 0% Fees
            </div>
            <h2 className="text-3xl font-extrabold">Withdraw <span className="text-gradient">Earnings</span></h2>
            <p className="text-sm text-muted-foreground mt-1">Cash out to your favourite cryptocurrency wallet with zero fees.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: method + form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Crypto selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYOUT_METHODS.map((m) => (
                  <motion.div key={m.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div
                      onClick={() => setMethod(m.id)}
                      style={{ background: method === m.id ? m.glow : undefined }}
                      className={`cursor-pointer transition-all border-2 rounded-xl p-4 flex items-center gap-4 ${
                        method === m.id
                          ? "border-green-500 shadow-[0_0_20px_rgba(0,255,135,0.15)]"
                          : `cyber-card ${m.color}`
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-background/60 border border-border/50 p-2 flex items-center justify-center shrink-0">
                        <img src={m.icon} alt={m.name} className="w-7 h-7 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{m.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">Fee: {m.fee}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">Min: {m.min}</span>
                        </div>
                      </div>
                      {method === m.id && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Form */}
              <div className="cyber-card rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-400" /> Withdrawal Details
                </h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                    <Input
                      type="number" placeholder="0.00" value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 pl-8 bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] font-bold transition-all"
                    />
                  </div>
                  <div className="flex justify-between mt-1 px-1">
                    <p className="text-[11px] text-muted-foreground">Available: <span className="text-green-400 font-bold">${balance.toFixed(2)}</span></p>
                    <button onClick={() => setAmount(balance.toString())} className="text-[11px] text-cyan-400 font-bold hover:text-cyan-300 transition-colors">Use Max</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{selectedMethod?.name} Address</label>
                  <Input
                    placeholder={`Enter your ${selectedMethod?.id.toUpperCase()} wallet address`}
                    value={address} onChange={(e) => setAddress(e.target.value)}
                    className="h-12 bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] font-mono text-sm transition-all"
                  />
                  <p className="text-[10px] text-red-400/80 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> Double-check your address — wrong transfers cannot be refunded.
                  </p>
                </div>
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                  className="w-full h-14 btn-cyber rounded-xl font-black tracking-widest uppercase text-sm"
                >
                  {withdrawMutation.isPending ? "Processing..." : "Request Payout →"}
                </Button>
              </div>
            </div>

            {/* Right: info card */}
            <div className="space-y-6">
              <div className="cyber-card border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="font-bold text-lg">Fast Payouts</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Our team processes withdrawals manually for maximum security. Most requests are approved within{" "}
                  <span className="text-white font-bold">1–24 hours</span>.
                </p>
                <div className="divider-cyber mb-5" />
                <ul className="space-y-3">
                  {["Minimum withdrawal only $0.50", "Zero withdrawal fees", "Instant email notifications", "Secure crypto transfers"].map((text, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Supported cryptos summary */}
              <div className="cyber-card rounded-2xl p-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Supported Cryptos</p>
                <div className="flex flex-wrap gap-2">
                  {PAYOUT_METHODS.map((m) => (
                    <div key={m.id} className="flex items-center gap-1.5 bg-background/50 rounded-lg px-2.5 py-1.5 border border-border/30">
                      <img src={m.icon} alt={m.name} className="w-4 h-4 object-contain" />
                      <span className="text-[10px] font-bold">{m.id.toUpperCase().replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
