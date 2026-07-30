import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Coins, ChevronLeft, Wallet, Shield, Zap,
  CheckCircle2, AlertTriangle, Copy, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const CRYPTOS = [
  { id: "BTC",  name: "Bitcoin",  symbol: "BTC",  min: 0.50, fee: "0%", color: "#f59e0b" },
  { id: "ETH",  name: "Ethereum", symbol: "ETH",  min: 0.50, fee: "0%", color: "#7c3aed" },
  { id: "LTC",  name: "Litecoin", symbol: "LTC",  min: 0.50, fee: "0%", color: "#06b6d4" },
  { id: "USDT", name: "Tether",   symbol: "USDT", min: 1.00, fee: "0%", color: "#10b981" },
];

export default function Withdraw() {
  const { user, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");

  const balance = parseFloat(user?.balance || "0") || 0;
  const crypto = CRYPTOS.find(c => c.id === selected)!;

  const withdrawMutation = trpc.user.withdraw.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal request submitted! Processing in 24h.");
      setAmount(""); setWallet("");
      refreshProfile();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!wallet.trim()) return toast.error("Please enter a wallet address.");
    if (!amt || amt < crypto.min) return toast.error(`Minimum withdrawal is $${crypto.min.toFixed(2)}.`);
    if (amt > balance) return toast.error("Insufficient balance.");
    withdrawMutation.mutate({ amount: amt, method: selected, walletAddress: wallet.trim() });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Withdraw Funds</h1>
            <p className="text-muted-foreground text-sm">Transfer your earnings to your crypto wallet</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Balance card */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e0533, #0c0a2e)" }}>
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", borderRadius: "50%" }} />
              <p className="text-white/60 text-sm font-medium mb-1">Available Balance</p>
              <div className="text-4xl font-extrabold text-white mb-3">${balance.toFixed(2)}</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/60 text-xs">Ready to withdraw</span>
              </div>
            </div>

            {/* Crypto selector */}
            <div className="pc-card rounded-2xl p-6">
              <h2 className="font-bold text-foreground text-lg mb-4">Select Currency</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CRYPTOS.map((c) => (
                  <button key={c.id} onClick={() => setSelected(c.id)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      selected === c.id ? "border-violet-500 bg-violet-50" : "border-border/60 hover:border-violet-200 hover:bg-gray-50"
                    }`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}18` }}>
                      <Coins className="w-5 h-5" style={{ color: c.color }} />
                    </div>
                    <span className="text-xs font-bold text-foreground">{c.symbol}</span>
                    {selected === c.id && <CheckCircle2 className="w-3.5 h-3.5 text-violet-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount + wallet */}
            <div className="pc-card rounded-2xl p-6 space-y-5">
              <h2 className="font-bold text-foreground text-lg">Withdrawal Details</h2>

              <div>
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-2 block">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min. $${crypto.min.toFixed(2)}`}
                    className="w-full pl-8 pr-20 py-3.5 rounded-xl border border-border bg-gray-50 focus:bg-white input-pc text-sm font-semibold transition-all outline-none"
                  />
                  <button onClick={() => setAmount(balance.toFixed(2))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg hover:bg-violet-100 transition-colors">
                    MAX
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Balance: <strong className="text-foreground">${balance.toFixed(2)}</strong> · Min: <strong className="text-foreground">${crypto.min.toFixed(2)}</strong> · Fee: <strong className="text-emerald-600">{crypto.fee}</strong></p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-2 block">{crypto.name} Wallet Address</label>
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder={`Enter your ${crypto.symbol} address`}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-gray-50 focus:bg-white input-pc text-sm font-mono transition-all outline-none"
                />
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">Double-check your wallet address. Transactions cannot be reversed once submitted.</p>
              </div>

              <button onClick={handleSubmit} disabled={withdrawMutation.isPending}
                className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                {withdrawMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Wallet className="w-4 h-4" /> Submit Withdrawal</>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="pc-card rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-4">Why RewardsVerse?</h3>
              <div className="space-y-3">
                {[
                  { icon: Zap,     text: "Processed within 24 hours",   color: "#f59e0b" },
                  { icon: Shield,  text: "256-bit SSL encrypted",        color: "#10b981" },
                  { icon: CheckCircle2, text: "Zero withdrawal fees",    color: "#7c3aed" },
                  { icon: Wallet,  text: "All major cryptos supported",  color: "#06b6d4" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm text-foreground/80 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pc-card rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-3">Supported Currencies</h3>
              <div className="space-y-2">
                {CRYPTOS.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c.color}15` }}>
                        <Coins className="w-3.5 h-3.5" style={{ color: c.color }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{c.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Min ${c.min.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
