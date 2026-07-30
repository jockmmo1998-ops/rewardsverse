import { ArrowLeft, ChevronDown, HelpCircle, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { question: "How do I get started on RewardsVerse?", answer: "Simply create an account, complete your profile, and start browsing available offers. Once you complete an offer, your earnings will be added to your balance immediately." },
  { question: "How are points calculated?", answer: "Points are awarded based on the offer value set by each offer provider. When you complete an offer, the points are instantly credited to your account." },
  { question: "What is the minimum withdrawal amount?", answer: "The minimum withdrawal amount is $0.50. You can withdraw your earnings in cryptocurrency (Bitcoin, Ethereum, USDT, Solana, etc.)." },
  { question: "How long does it take to process a withdrawal?", answer: "Withdrawals are typically processed within 24-48 hours after admin approval. The actual transfer time depends on the blockchain network." },
  { question: "Can I have multiple accounts?", answer: "No, creating multiple accounts is strictly prohibited and may result in permanent account suspension. Each user is allowed only one active account." },
  { question: "What if an offer doesn't credit my account?", answer: "If an offer doesn't credit your account after completion, please contact our support team with details about the offer. We'll investigate and manually credit your account if verified." },
  { question: "How does the referral program work?", answer: "Invite friends using your referral code. When they sign up and earn points, you'll receive a percentage of their earnings as bonus points." },
  { question: "Is my personal information safe?", answer: "Yes, we use industry-standard encryption and security measures to protect your personal information. See our Privacy Policy for more details." },
  { question: "What payment methods do you support?", answer: "We support withdrawals to major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), USDT, Solana (SOL), and other popular coins." },
  { question: "Can I cancel a withdrawal request?", answer: "Yes, you can cancel a pending withdrawal request. Once approved, the withdrawal cannot be cancelled and will be processed." },
  { question: "Why was my account suspended?", answer: "Accounts are suspended for violations such as fraudulent activity, using multiple accounts, or violating offer provider terms. Contact support for more information." },
  { question: "How can I contact support?", answer: "You can reach our support team through the Contact Us page, via email at support@rewardsverse.com, or through live chat on our website." },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="cyber-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-green-500/3 transition-colors group"
      >
        <div className="flex items-center gap-3 text-left">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-green-500/15 text-green-400" : "bg-muted/50 text-muted-foreground"}`}>
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <span className={`font-semibold transition-colors ${isOpen ? "text-green-400" : "text-white group-hover:text-green-400/80"}`}>{question}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-green-400" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 pb-5 pt-1 border-t border-green-500/10">
              <div className="w-0.5 h-full bg-green-400/30 absolute left-6" />
              <p className="text-muted-foreground leading-relaxed text-sm pl-9">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-green-500/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-cyan-500/4 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-green-500/10 bg-background/90 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-green-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-cyber flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-[#060818]" />
            </div>
            <h1 className="text-xl font-bold"><span className="text-gradient">FAQ</span></h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 tag-cyber mb-4">
            <Zap className="w-3 h-3" /> Support
          </div>
          <h2 className="text-4xl font-extrabold mb-3">Frequently Asked <span className="text-gradient">Questions</span></h2>
          <p className="text-muted-foreground">Find answers to common questions about RewardsVerse</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>

        <div className="mt-14 cyber-card rounded-2xl p-8 text-center border-green-500/20">
          <div className="w-14 h-14 rounded-2xl gradient-cyber flex items-center justify-center mx-auto mb-5 glow-green">
            <HelpCircle className="w-7 h-7 text-[#060818]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">Our support team is ready to help you 24/7.</p>
          <Button onClick={() => setLocation("/contact")} className="btn-cyber rounded-xl h-11 px-8 font-black tracking-widest uppercase text-sm">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
