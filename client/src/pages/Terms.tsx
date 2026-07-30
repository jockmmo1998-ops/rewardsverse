import { useLocation } from "wouter";
import { ChevronLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  { title: "Acceptance of Terms", content: "By accessing and using RewardsVerse, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our platform." },
  { title: "Eligibility", content: "You must be at least 18 years old and a legal resident of a supported country to use RewardsVerse. By registering, you confirm you meet these requirements." },
  { title: "Account Responsibility", content: "You are responsible for maintaining the confidentiality of your account credentials. Each user is limited to one account. Multiple accounts will result in permanent suspension." },
  { title: "Earning & Rewards", content: "Rewards are earned by completing legitimate tasks. Any fraudulent activity, including use of VPNs, bots, or fake completions, is strictly prohibited and will result in account termination and forfeiture of earnings." },
  { title: "Withdrawals", content: "Withdrawals are processed within 24 hours of submission. We reserve the right to delay or deny withdrawals if suspicious activity is detected. Minimum withdrawal amounts apply per currency." },
  { title: "Prohibited Activities", content: "Users may not use automated tools, proxies, or any deceptive means to earn rewards. Abuse of the referral system, chargebacks, or harassment of other users will result in immediate termination." },
  { title: "Termination", content: "We reserve the right to suspend or terminate any account at our discretion, particularly in cases of fraud, abuse, or violation of these terms. Terminated accounts forfeit any pending balances." },
  { title: "Changes to Terms", content: "RewardsVerse reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms." },
];

export default function Terms() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground text-sm">Last updated: January 2024</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <div className="pc-card rounded-2xl p-6 flex items-center gap-4 mb-2">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">Please read these terms carefully before using RewardsVerse. By creating an account, you agree to these terms.</p>
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
