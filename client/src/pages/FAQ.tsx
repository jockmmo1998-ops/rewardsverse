import { ArrowLeft, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const faqs = [
  {
    question: "How do I get started on RewardsVerse?",
    answer: "Simply create an account, complete your profile, and start browsing available offers. Once you complete an offer, your earnings will be added to your balance immediately.",
  },
  {
    question: "How are points calculated?",
    answer: "Points are awarded based on the offer value set by each offer provider. When you complete an offer, the points are instantly credited to your account.",
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer: "The minimum withdrawal amount is $0.50. You can withdraw your earnings in cryptocurrency (Bitcoin, Ethereum, USDT, Solana, etc.).",
  },
  {
    question: "How long does it take to process a withdrawal?",
    answer: "Withdrawals are typically processed within 24-48 hours after admin approval. The actual transfer time depends on the blockchain network.",
  },
  {
    question: "Can I have multiple accounts?",
    answer: "No, creating multiple accounts is strictly prohibited and may result in permanent account suspension. Each user is allowed only one active account.",
  },
  {
    question: "What if an offer doesn't credit my account?",
    answer: "If an offer doesn't credit your account after completion, please contact our support team with details about the offer. We'll investigate and manually credit your account if verified.",
  },
  {
    question: "How does the referral program work?",
    answer: "Invite friends using your referral code. When they sign up and earn points, you'll receive a percentage of their earnings as bonus points.",
  },
  {
    question: "Is my personal information safe?",
    answer: "Yes, we use industry-standard encryption and security measures to protect your personal information. See our Privacy Policy for more details.",
  },
  {
    question: "What payment methods do you support?",
    answer: "We support withdrawals to major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), USDT, Solana (SOL), and other popular coins.",
  },
  {
    question: "Can I cancel a withdrawal request?",
    answer: "Yes, you can cancel a pending withdrawal request. Once approved, the withdrawal cannot be cancelled and will be processed.",
  },
  {
    question: "Why was my account suspended?",
    answer: "Accounts are suspended for violations such as fraudulent activity, using multiple accounts, or violating offer provider terms. Contact support for more information.",
  },
  {
    question: "How can I contact support?",
    answer: "You can reach our support team through the Contact Us page, via email at support@rewardsverse.com, or through live chat on our website.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden hover:border-slate-600/50 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
      >
        <span className="text-left font-medium text-white">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50">
          <p className="text-slate-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-white">Frequently Asked Questions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-slate-300 text-center mb-8">
            Find answers to common questions about RewardsVerse
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center">
          <p className="text-slate-300 mb-4">
            Didn't find your answer?
          </p>
          <Button
            onClick={() => setLocation("/contact")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
