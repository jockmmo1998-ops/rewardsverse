import { ArrowLeft, Shield, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing and using RewardsVerse, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services."
  },
  {
    title: "2. Description of Service",
    content: "RewardsVerse provides an online platform where users can complete offers, surveys, and tasks to earn cryptocurrency rewards. We reserve the right to modify, suspend, or discontinue the service at any time."
  },
  {
    title: "3. Account Registration",
    content: "You must register for an account to use our services. You are responsible for maintaining the confidentiality of your account credentials. Creating multiple accounts is strictly prohibited and will result in permanent suspension."
  },
  {
    title: "4. Earnings and Withdrawals",
    content: "Earnings are credited to your account upon completion of qualifying offers. The minimum withdrawal amount is $0.50 USD. Withdrawals are processed within 24-48 hours. We reserve the right to withhold payments suspected of fraud."
  },
  {
    title: "5. Prohibited Activities",
    content: "Users may not use bots, scripts, or automated tools to complete offers. Fraudulent activity, including fake offer completions, is strictly prohibited and will result in account termination and forfeiture of earnings."
  },
  {
    title: "6. Privacy and Data",
    content: "We collect and process personal data as described in our Privacy Policy. By using our service, you consent to such processing and you warrant that all data provided by you is accurate."
  },
  {
    title: "7. Limitation of Liability",
    content: "RewardsVerse shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, or goodwill, resulting from your use of the service."
  },
  {
    title: "8. Changes to Terms",
    content: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service following any changes constitutes your acceptance of the new terms."
  },
];

export default function Terms() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[25%] h-[25%] bg-green-500/3 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[25%] h-[25%] bg-cyan-500/3 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 border-b border-green-500/10 bg-background/90 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-green-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-cyber flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#060818]" />
            </div>
            <h1 className="text-xl font-bold">Terms of <span className="text-gradient">Service</span></h1>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 tag-cyber mb-4">
            <Shield className="w-3 h-3" /> Legal
          </div>
          <h2 className="text-4xl font-extrabold mb-3">Terms of <span className="text-gradient">Service</span></h2>
          <p className="text-muted-foreground text-sm">Last updated: January 1, 2025</p>
        </div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="cyber-card rounded-xl p-6"
            >
              <h3 className="font-bold text-base text-green-400 mb-3">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 cyber-card rounded-2xl p-6 text-center border-green-500/15">
          <p className="text-sm text-muted-foreground">
            Questions about our terms?{" "}
            <button onClick={() => setLocation("/contact")} className="text-green-400 hover:text-green-300 font-bold transition-colors">
              Contact us
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
