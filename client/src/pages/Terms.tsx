import { useLocation } from "wouter";
import { ChevronLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  { title:"Acceptance of Terms", content:"By accessing and using RewardsVerse, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our platform." },
  { title:"Eligibility", content:"You must be at least 18 years old and a legal resident of a supported country. By registering, you confirm you meet these requirements." },
  { title:"Account Responsibility", content:"You are responsible for maintaining your account credentials. Each user is limited to one account. Multiple accounts result in permanent suspension and balance forfeiture." },
  { title:"Earning & Rewards", content:"Rewards are earned by completing legitimate tasks. Fraudulent activity — including VPNs, bots, or fake completions — is strictly prohibited and results in immediate termination." },
  { title:"Withdrawals", content:"Withdrawals are processed within 24 hours. We reserve the right to delay or deny withdrawals if suspicious activity is detected. Minimum withdrawal amounts apply per currency." },
  { title:"Prohibited Activities", content:"Automated tools, proxies, or deceptive earning methods are banned. Abuse of referral systems, chargebacks, or harassment will result in immediate account termination." },
  { title:"Termination", content:"We reserve the right to suspend or terminate any account at our discretion. Terminated accounts forfeit any pending or available balances." },
  { title:"Changes to Terms", content:"RewardsVerse may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms." },
];

export default function Terms() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen" style={{ background:"#0a0a0f", color:"#f4f4f8" }}>
      <div className="noise-overlay" /><div className="grid-overlay" />
      <div className="relative z-10" style={{ background:"rgba(10,10,15,0.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">Terms of Service</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem" }}>Last updated: January 2024</p>
          </div>
        </div>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 space-y-3">
        <div className="glass rounded-2xl p-5 flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl g-primary flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-white" /></div>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.875rem", lineHeight:"1.6" }}>Please read these terms carefully before using RewardsVerse. By creating an account, you agree to these terms.</p>
        </div>
        {SECTIONS.map((s, i) => (
          <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            className="glass rounded-2xl p-6">
            <h2 className="font-black mb-3 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg g-primary flex items-center justify-center text-white text-xs font-black shrink-0">{i+1}</span>
              {s.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.45)" }}>{s.content}</p>
          </motion.div>
        ))}
        <p className="text-center pt-4" style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.8rem" }}>
          Questions? <button onClick={() => setLocation("/contact")} style={{ color:"#818cf8", fontWeight:600 }} className="hover:underline">Contact us</button>
        </p>
      </div>
    </div>
  );
}
