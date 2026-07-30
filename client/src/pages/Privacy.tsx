import { useLocation } from "wouter";
import { ChevronLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  { title:"Information We Collect", content:"We collect your username, email (if provided), IP address, and activity data to operate the platform. We do not collect sensitive personal data beyond operational needs." },
  { title:"How We Use Your Information", content:"Your data is used to operate your account, process withdrawals, prevent fraud, and improve our services. We do not sell or rent your personal data to third parties." },
  { title:"Cookies & Tracking", content:"We use cookies to maintain your session and improve experience. Analytics tools help us understand usage patterns. You can disable cookies in your browser settings." },
  { title:"Data Sharing", content:"We share minimal data with offer wall partners to enable task tracking and reward crediting. These partners maintain their own privacy policies." },
  { title:"Data Security", content:"We implement industry-standard 256-bit SSL encryption. While we use best practices, no internet transmission is 100% guaranteed secure." },
  { title:"Data Retention", content:"Account data is retained while your account is active. Upon deletion, data is removed within 30 days, except where required by law." },
  { title:"Your Rights", content:"You may request access, correction, or deletion of your data at any time by contacting our support team. We will respond within 30 days." },
  { title:"Contact", content:"For privacy inquiries, contact us at privacy@rewardsverse.online. We take all privacy concerns seriously and respond promptly." },
];

export default function Privacy() {
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
            <h1 className="text-xl font-black">Privacy Policy</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem" }}>Last updated: January 2024</p>
          </div>
        </div>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 space-y-3">
        <div className="glass rounded-2xl p-5 flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl g-primary flex items-center justify-center shrink-0"><Shield className="w-5 h-5 text-white" /></div>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.875rem", lineHeight:"1.6" }}>Your privacy matters. This policy explains how RewardsVerse collects, uses, and protects your information.</p>
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
