import { useLocation } from "wouter";
import { ChevronLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  { title: "Information We Collect", content: "We collect your username, email address (if provided), IP address, and activity data necessary to operate the platform. We do not collect sensitive personal information beyond what is needed." },
  { title: "How We Use Your Information", content: "Your information is used to operate your account, process withdrawals, prevent fraud, and improve our services. We do not sell or rent your personal data to third parties." },
  { title: "Cookies & Tracking", content: "We use cookies to maintain your session and improve user experience. We may use analytics tools to understand how users interact with our platform. You can disable cookies in your browser settings." },
  { title: "Data Sharing", content: "We share minimal data with our offer wall partners to enable task tracking and reward crediting. These partners have their own privacy policies which govern their use of your data." },
  { title: "Data Security", content: "We implement industry-standard 256-bit SSL encryption and security measures to protect your data. However, no transmission over the internet is 100% secure." },
  { title: "Data Retention", content: "We retain your account data for as long as your account is active. Upon account deletion, data is removed within 30 days, except where required by law." },
  { title: "Your Rights", content: "You may request access to, correction of, or deletion of your personal data at any time by contacting our support team. We will respond to requests within 30 days." },
  { title: "Contact", content: "For privacy-related inquiries, please contact us at privacy@rewardsverse.online. We take all privacy concerns seriously and will address them promptly." },
];

export default function Privacy() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm">Last updated: January 2024</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <div className="pc-card rounded-2xl p-6 flex items-center gap-4 mb-2">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">Your privacy is important to us. This policy explains how RewardsVerse collects, uses, and protects your information.</p>
        </div>

        {SECTIONS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="pc-card rounded-2xl p-6">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</span>
              {s.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
          </motion.div>
        ))}

        <p className="text-center text-xs text-muted-foreground pt-4">
          Questions? <button onClick={() => setLocation("/contact")} className="text-violet-600 font-semibold hover:underline">Contact us</button>
        </p>
      </div>
    </div>
  );
}
