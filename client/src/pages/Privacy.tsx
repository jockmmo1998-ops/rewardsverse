import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    content: "We collect information you provide directly to us, such as your username, email address, and wallet addresses. We also collect usage data including offer completions, withdrawal requests, and platform activity."
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: "We use your information to provide and improve our services, process transactions and withdrawals, communicate with you about your account, and ensure the security and integrity of our platform."
  },
  {
    icon: Shield,
    title: "Information Security",
    content: "We implement industry-standard security measures including AES-256 encryption, SSL/TLS protocols, and regular security audits to protect your personal information from unauthorized access, disclosure, or modification."
  },
  {
    icon: Lock,
    title: "Data Retention",
    content: "We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account data at any time by contacting our support team."
  },
  {
    icon: Shield,
    title: "Third-Party Services",
    content: "We work with trusted offer wall providers who may collect information when you complete their offers. Each provider has their own privacy policy governing their data practices."
  },
  {
    icon: Database,
    title: "Your Rights",
    content: "You have the right to access, correct, or delete your personal information. You may also object to or restrict certain types of processing. To exercise these rights, please contact our support team."
  },
  {
    icon: Eye,
    title: "Cookies",
    content: "We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences."
  },
  {
    icon: Shield,
    title: "Contact Us",
    content: "If you have questions about this Privacy Policy or our data practices, please contact us at privacy@rewardsverse.com. We will respond to your inquiry within 30 days."
  },
];

export default function Privacy() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[25%] h-[25%] bg-cyan-500/3 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[25%] h-[25%] bg-green-500/3 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 border-b border-green-500/10 bg-background/90 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-green-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-cyber flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#060818]" />
            </div>
            <h1 className="text-xl font-bold">Privacy <span className="text-gradient">Policy</span></h1>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 tag-cyan mb-4">
            <Shield className="w-3 h-3" /> Privacy
          </div>
          <h2 className="text-4xl font-extrabold mb-3">Privacy <span className="text-gradient">Policy</span></h2>
          <p className="text-muted-foreground text-sm">Last updated: January 1, 2025</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="cyber-card rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <section.icon className="w-4.5 h-4.5 text-green-400" />
                </div>
                <h3 className="font-bold text-sm text-green-400">{section.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 cyber-card rounded-2xl p-6 text-center border-cyan-500/15">
          <p className="text-sm text-muted-foreground">
            Questions about our privacy practices?{" "}
            <button onClick={() => setLocation("/contact")} className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              Contact us
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
