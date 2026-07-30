import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle, MessageCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  { q: "How do I start earning?", a: "Create a free account, then browse our offer walls to find surveys, games, and tasks. Complete them to earn cash instantly credited to your balance." },
  { q: "What is the minimum withdrawal?", a: "The minimum withdrawal is $0.50 for most cryptocurrencies. Some coins like USDT have a $1.00 minimum. There are zero fees on all withdrawals." },
  { q: "How long do withdrawals take?", a: "Withdrawals are processed within 24 hours. Most are completed within a few hours depending on network congestion." },
  { q: "Which cryptocurrencies are supported?", a: "We support Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), and Tether USDT. More currencies are being added soon." },
  { q: "How does the referral program work?", a: "Share your unique referral link. You earn 10% of your referrals' lifetime earnings — completely passive income with no cap." },
  { q: "Is RewardsVerse free to join?", a: "Yes, 100% free. No credit card, no subscription, no hidden fees. Just sign up and start earning." },
  { q: "Why wasn't my offer credited?", a: "Offers can take up to 30 minutes to credit. If not credited after that, contact support with your offer ID and we'll investigate." },
  { q: "Can I have multiple accounts?", a: "No. Multiple accounts are against our terms of service and will result in a permanent ban of all associated accounts." },
  { q: "How do daily bonuses work?", a: "Log in each day and click 'Claim Bonus' on your dashboard. Consecutive days increase your streak multiplier for bigger rewards." },
  { q: "Is my personal data safe?", a: "We use 256-bit SSL encryption and never sell your data to third parties. See our Privacy Policy for full details." },
];

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">FAQ</h1>
            <p className="text-muted-foreground text-sm">Frequently asked questions</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-2">How can we help?</h2>
          <p className="text-muted-foreground">Find answers to the most common questions below.</p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="faq-item overflow-hidden" data-open={open === i ? "true" : "false"}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                <span className={`text-sm font-bold ${open === i ? "text-violet-700" : "text-foreground"}`}>{faq.q}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${open === i ? "bg-violet-100" : "bg-gray-100"}`}>
                  {open === i
                    ? <ChevronUp className="w-4 h-4 text-violet-600" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                    <div className="px-6 pb-5 border-l-2 border-violet-400 ml-6">
                      <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still need help */}
        <div className="pc-card rounded-2xl p-8 text-center">
          <MessageCircle className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground text-sm mb-5">Our support team is here to help you 7 days a week.</p>
          <button onClick={() => setLocation("/contact")} className="btn-primary px-7 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2">
            Contact Support <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
