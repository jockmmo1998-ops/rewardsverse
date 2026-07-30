import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronLeft, Coins, Wallet, Zap, Shield, CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import { motion } from "framer-motion";

const CRYPTOS = [
  { id:"BTC",  name:"Bitcoin",  sym:"BTC",  min:0.50, color:"#f59e0b" },
  { id:"ETH",  name:"Ethereum", sym:"ETH",  min:0.50, color:"#818cf8" },
  { id:"LTC",  name:"Litecoin", sym:"LTC",  min:0.50, color:"#22d3ee" },
  { id:"USDT", name:"Tether",   sym:"USDT", min:1.00, color:"#4ade80" },
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
    onSuccess: () => { toast.success("Withdrawal submitted! Processing within 24h."); setAmount(""); setWallet(""); refreshProfile(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!wallet.trim()) return toast.error("Please enter a wallet address.");
    if (!amt || amt < crypto.min) return toast.error(`Minimum is $${crypto.min.toFixed(2)}.`);
    if (amt > balance) return toast.error("Insufficient balance.");
    withdrawMutation.mutate({ amount:amt, method:selected, walletAddress:wallet.trim() });
  };

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"0.75rem 1rem",
    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:"0.75rem", color:"#f4f4f8", fontSize:"0.875rem", outline:"none",
    transition:"border-color 0.2s ease, box-shadow 0.2s ease",
  };
  const iFocus = (e: any) => { e.target.style.borderColor="rgba(99,102,241,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; };
  const iBlur  = (e: any) => { e.target.style.borderColor="rgba(255,255,255,0.08)"; e.target.style.boxShadow="none"; };

  return (
    <div className="min-h-screen" style={{ background:"#0a0a0f", color:"#f4f4f8" }}>
      <div className="noise-overlay" /><div className="grid-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-10%", right:"-10%", width:"30%", height:"30%", background:"radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)", filter:"blur(60px)" }} />
      </div>

      {/* Header */}
      <div className="relative z-10" style={{ background:"rgba(10,10,15,0.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="max-w-5xl mx-auto px-5 py-5 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">Withdraw Funds</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem" }}>Transfer earnings to your crypto wallet</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2 space-y-6">

            {/* Balance */}
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background:"linear-gradient(135deg, #0c0c1e, #140c28)" }}>
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background:"radial-gradient(circle, rgba(99,102,241,0.15), transparent)", filter:"blur(40px)" }} />
              <p style={{ color:"rgba(255,255,255,0.40)", fontSize:"0.875rem", marginBottom:"0.5rem" }}>Available Balance</p>
              <div className="text-4xl font-black mb-2">${balance.toFixed(2)}</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span style={{ color:"rgba(255,255,255,0.40)", fontSize:"0.75rem" }}>Ready to withdraw</span>
              </div>
            </div>

            {/* Crypto selector */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-black text-lg mb-4">Select Currency</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CRYPTOS.map(c => (
                  <button key={c.id} onClick={() => setSelected(c.id)}
                    className="p-4 rounded-xl flex flex-col items-center gap-2.5 transition-all"
                    style={{
                      border: selected === c.id ? `2px solid ${c.color}55` : "2px solid rgba(255,255,255,0.06)",
                      background: selected === c.id ? `${c.color}0f` : "rgba(255,255,255,0.03)",
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${c.color}15` }}>
                      <Coins className="w-5 h-5" style={{ color:c.color }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color:selected===c.id ? c.color : "rgba(255,255,255,0.55)" }}>{c.sym}</span>
                    {selected === c.id && <CheckCircle2 className="w-3.5 h-3.5" style={{ color:c.color }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="font-black text-lg">Withdrawal Details</h2>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color:"rgba(255,255,255,0.40)" }}>Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color:"rgba(255,255,255,0.30)" }}>$</span>
                  <input style={{ ...inputStyle, paddingLeft:"1.75rem", paddingRight:"4.5rem" }}
                    type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder={`Min. $${crypto.min.toFixed(2)}`} onFocus={iFocus} onBlur={iBlur} />
                  <button onClick={() => setAmount(balance.toFixed(2))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black px-2.5 py-1 rounded-lg transition-colors"
                    style={{ background:"rgba(99,102,241,0.15)", color:"#818cf8" }}>MAX</button>
                </div>
                <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.75rem", marginTop:"0.5rem" }}>
                  Balance: <strong style={{ color:"#f4f4f8" }}>${balance.toFixed(2)}</strong> · Min: <strong style={{ color:"#f4f4f8" }}>${crypto.min.toFixed(2)}</strong> · Fee: <strong style={{ color:"#4ade80" }}>0%</strong>
                </p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color:"rgba(255,255,255,0.40)" }}>{crypto.name} Address</label>
                <input style={{ ...inputStyle, fontFamily:"monospace" }} placeholder={`Enter your ${crypto.sym} address`}
                  value={wallet} onChange={e => setWallet(e.target.value)} onFocus={iFocus} onBlur={iBlur} />
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.18)" }}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color:"#fbbf24" }} />
                <p style={{ color:"rgba(251,191,36,0.75)", fontSize:"0.78rem" }}>Double-check your wallet address. Transactions cannot be reversed once submitted.</p>
              </div>
              <button onClick={handleSubmit} disabled={withdrawMutation.isPending} className="btn-gpt w-full flex items-center justify-center gap-2 py-3.5">
                {withdrawMutation.isPending
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Wallet className="w-4 h-4" /> Submit Withdrawal</>}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-black mb-4">Why RewardsVerse?</h3>
              {[
                { icon:Zap,          text:"Processed within 24 hours", color:"#fbbf24" },
                { icon:Shield,       text:"256-bit SSL encrypted",      color:"#22d3ee" },
                { icon:CheckCircle2, text:"Zero withdrawal fees",        color:"#4ade80" },
                { icon:Wallet,       text:"4 major cryptocurrencies",   color:"#818cf8" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3 py-2.5" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:`${item.color}12` }}>
                    <item.icon className="w-4 h-4" style={{ color:item.color }} />
                  </div>
                  <span style={{ fontSize:"0.8rem", fontWeight:600, color:"rgba(255,255,255,0.60)" }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-black mb-4">Supported</h3>
              {CRYPTOS.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2.5" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:`${c.color}12` }}>
                      <Coins className="w-4 h-4" style={{ color:c.color }} />
                    </div>
                    <span style={{ fontSize:"0.875rem", fontWeight:600 }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.30)" }}>Min ${c.min.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
