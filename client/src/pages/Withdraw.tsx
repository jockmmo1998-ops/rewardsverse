import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Coins,
  LogOut,
  LayoutDashboard,
  Gift as OfferIcon,
  Wallet,
  History as HistoryIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
  Trophy,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PAYOUT_METHODS = [
  { id: "bitcoin", name: "Bitcoin (BTC)", fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", color: "border-orange-500/30" },
  { id: "ethereum", name: "Ethereum (ETH)", fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", color: "border-blue-500/30" },
  { id: "litecoin", name: "Litecoin (LTC)", fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/litecoin-ltc-logo.png", color: "border-slate-500/30" },
  { id: "dogecoin", name: "Dogecoin (DOGE)", fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/dogecoin-doge-logo.png", color: "border-yellow-500/30" },
  { id: "usdt_trc20", name: "USDT (TRC20)", fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png", color: "border-green-500/30" },
  { id: "usdt_erc20", name: "USDT (ERC20)", fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png", color: "border-green-500/30" },
  { id: "solana", name: "Solana (SOL)", fee: "0%", min: "$0.50", icon: "https://cryptologos.cc/logos/solana-sol-logo.png", color: "border-purple-500/30" },
];

export default function Withdraw() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [method, setMethod] = useState("bitcoin");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  const withdrawMutation = trpc.withdraw.create.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal request submitted! Fast payout in progress.");
      setAmount("");
      setAddress("");
      refreshProfile();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!loading && !user) setLocation("/");
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const balance = parseFloat(user.balance || "0") || 0;
  const selectedMethod = PAYOUT_METHODS.find(m => m.id === method);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", active: false },
    { label: "Offer Walls", icon: OfferIcon, path: "/offers", active: false },
    { label: "Withdraw", icon: Wallet, path: "/withdraw", active: true },
    { label: "History", icon: HistoryIcon, path: "/history", active: false },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard", active: false },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin", active: false }] : []),
  ];

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.5) { toast.error("Minimum withdrawal is $0.50"); return; }
    if (!address) { toast.error("Please enter your wallet address"); return; }
    if (numAmount > balance) { toast.error("Insufficient balance"); return; }

    withdrawMutation.mutate({
      amount: numAmount,
      cryptoType: (selectedMethod?.id || method) as any,
      walletAddress: address,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Activity Ticker - Real Data */}
      <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-background/80 backdrop-blur-md border-b border-border/50 overflow-hidden flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-[11px] font-medium text-muted-foreground">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              {activities.map((a: any) => (
                <span key={`${i}-${a.id}`} className="flex items-center gap-2">
                  <Badge variant="outline" className={`py-0 h-5 ${
                    a.type === "offer_complete" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    a.type === "withdrawal" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    a.type === "daily_claim" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                    "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  }`}>
                    {a.type === "offer_complete" ? "EARNED" : a.type === "withdrawal" ? "WITHDRAW" : a.type === "daily_claim" ? "BONUS" : "REFERRAL"}
                  </Badge>
                  <span className="text-white font-semibold">{a.username}</span>
                  <span>{a.description}</span>
                  {a.amount && <span className="text-green-400 font-semibold">${parseFloat(a.amount).toFixed(2)}</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-9 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-green-cyan flex items-center justify-center shadow-lg shadow-green-500/20">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold"><span className="text-gradient">Rewards</span>Verse</h1>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-bold">Fast Payouts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-bold text-sm">${balance.toFixed(2)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="fixed top-[6.5rem] left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all rounded-t-lg border-b-2 ${
                item.active ? "text-green-400 border-green-400 bg-green-500/5" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="pt-[10.5rem] pb-8 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Withdraw <span className="text-gradient">Earnings</span></h2>
            <p className="text-sm text-muted-foreground mt-1">Cash out your hard-earned balance to your favorite cryptocurrency wallet.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYOUT_METHODS.map((m) => (
                  <Card 
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`cursor-pointer transition-all border-2 ${
                      method === m.id ? "border-green-500 bg-green-500/5 shadow-lg shadow-green-500/10" : "border-border/50 bg-card/50 hover:border-border"
                    }`}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background border border-border/50 p-2 flex items-center justify-center">
                        <img src={m.icon} alt={m.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{m.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Fee: {m.fee}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Min: {m.min}</span>
                        </div>
                      </div>
                      {method === m.id && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-border/50 bg-card/50">
                <CardHeader><CardTitle className="text-lg">Withdrawal Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Amount to Withdraw (USD)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</div>
                      <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 pl-8 bg-background border-border/50 focus:border-green-500 font-bold" />
                    </div>
                    <div className="flex justify-between mt-1 px-1">
                      <p className="text-[10px] text-muted-foreground">Available: <span className="text-green-400 font-bold">${balance.toFixed(2)}</span></p>
                      <button onClick={() => setAmount(balance.toString())} className="text-[10px] text-cyan-400 font-bold hover:underline">Use Maximum</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{selectedMethod?.name} Address</label>
                    <Input placeholder={`Enter your ${selectedMethod?.id.toUpperCase()} wallet address`} value={address} onChange={(e) => setAddress(e.target.value)} className="h-12 bg-background border-border/50 focus:border-green-500 font-mono text-sm" />
                    <p className="text-[10px] text-red-400/80 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Double check your address. We cannot refund wrong transfers.</p>
                  </div>
                  <Button onClick={handleWithdraw} disabled={withdrawMutation.isPending} className="w-full h-14 gradient-green-cyan text-white font-bold text-lg shadow-lg shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                    {withdrawMutation.isPending ? "Processing Request..." : "Request Payout"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-green-400" /></div>
                    <h4 className="font-bold">Fast Payouts</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Our team processes withdrawals manually to ensure maximum security. Most requests are approved within <span className="text-white font-bold">1-24 hours</span>.
                  </p>
                  <ul className="space-y-2">
                    {["Minimum withdrawal only $0.50", "Zero withdrawal fees", "Instant email notifications", "Secure crypto transfers"].map((text, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-green-400" />{text}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
