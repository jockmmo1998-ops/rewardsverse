import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle, MessageCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  { q: "How do I start earning?", a: "Create a free account, browse our 7 offer walls, and complete surveys, games, or tasks. Earnings are credited to your balance instantly." },
  { q: "What is the minimum withdrawal?", a: "The minimum withdrawal is $0.50 for BTC, ETH, and LTC. USDT requires a minimum of $1.00. All withdrawals have zero fees." },
  { q: "How long do withdrawals take?", a: "Withdrawals are processed within 24 hours. Most complete within a few hours depending on network conditions." },
  { q: "Which cryptocurrencies are supported?", a: "We support Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), and Tether (USDT). More currencies are coming soon." },
  { q: "How does the referral program work?", a: "Share your unique link and earn 10% of your referrals' lifetime earnings — no cap, no expiration, completely passive." },
  { q: "Is RewardsVerse free to join?", a: "Yes, 100% free. No credit card required, no subscriptions, no hidden fees. Sign up and start earning immediately." },
  { q: "Why wasn't my offer credited?", a: "Offers may take up to 30 minutes to credit. If it's still missing, contact support with your offer ID and we'll investigate." },
  { q: "Can I have multiple accounts?", a: "No. Multiple accounts violate our terms and will result in permanent bans of all associated accounts." },
  { q: "How do daily bonuses work?", a: "Log in each day and claim your bonus from the dashboard. Consecutive days build your streak for increasing rewards." },
  { q: "Is my personal data safe?", a: "We use 256-bit SSL encryption and never sell your data to third parties. See our Privacy Policy for full details." },
];

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background:"#0a0a0f", color:"#f4f4f8" }}>
      <div className="noise-overlay" /><div className="grid-overlay" />

      {/* Header */}
      <div className="relative z-10" style={{ background:"rgba(10,10,15,0.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">FAQ</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem" }}>Frequently asked questions</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl g-primary flex items-center justify-center mx-auto mb-4" style={{ boxShadow:"0 0 24px rgba(99,102,241,0.45)" }}>
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-2">How can we <span className="text-g-primary">help?</span></h2>
          <p style={{ color:"rgba(255,255,255,0.35)" }}>Find answers to the most common questions below.</p>
        </div>

        {/* Accordion */}
        <div className="space-y-2.5">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
              className="faq-gpt overflow-hidden" data-open={open===i ? "true":"false"}>
              <button onClick={() => setOpen(open===i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                <span className="text-sm font-bold" style={{ color:open===i?"#818cf8":"rgba(255,255,255,0.80)" }}>{faq.q}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  style={{ background:open===i?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.06)" }}>
                  {open===i ? <ChevronUp className="w-4 h-4" style={{ color:"#818cf8" }} /> : <ChevronDown className="w-4 h-4" style={{ color:"rgba(255,255,255,0.35)" }} />}
                </div>
              </button>
              <AnimatePresence>
                {open===i && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }}>
                    <div className="px-6 pb-5 ml-5" style={{ borderLeft:"2px solid rgba(99,102,241,0.40)" }}>
                      <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.45)" }}>{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still need help */}
        <div className="glass rounded-2xl p-8 text-center">
          <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color:"#818cf8" }} />
          <h3 className="text-lg font-black mb-2">Still have questions?</h3>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.875rem", marginBottom:"1.25rem" }}>Our support team is available 7 days a week.</p>
          <button onClick={() => setLocation("/contact")} className="btn-gpt inline-flex items-center gap-2 px-7 py-3">
            Contact Support <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
