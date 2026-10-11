import { ArrowLeft, Mail, MessageSquare, Clock, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const subjectLine = subject.trim() || `RewardsVerse support request from ${name.trim()}`;
    const body = [`Name: ${name.trim()}`, `Email: ${email.trim()}`, "", message.trim()].join("\n");
    window.location.href = `mailto:support@rewardsverse.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-cyan-500/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-green-500/4 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 border-b border-green-500/10 bg-background/90 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-green-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-cyber flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#060818]" />
            </div>
            <h1 className="text-xl font-bold"><span className="text-gradient">Contact</span> Us</h1>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-14">
        <div className="text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 tag-cyan mb-4">
            <MessageSquare className="w-3 h-3" /> Support
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Get in <span className="text-gradient">Touch</span></h2>
          <p className="text-muted-foreground">Our team is available 24/7 to help you with any questions or issues.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, color: "text-green-400", bg: "bg-green-500/10", title: "Email Support", desc: "support@rewardsverse.com", href: "mailto:support@rewardsverse.com", sub: "Response within 24h" },
              { icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-500/10", title: "Live Chat", desc: "Available on dashboard", sub: "Response within 1h" },
              { icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10", title: "Response Time", desc: "< 24 hours typical", sub: "Mon–Sun, 24/7" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="cyber-card rounded-xl p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  {item.href ? <a href={item.href} className="break-all text-xs text-muted-foreground mt-0.5 hover:text-green-400">{item.desc}</a> : <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>}
                  <p className="text-[10px] text-green-400/70 mt-0.5 font-bold uppercase tracking-wide">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="md:col-span-2">
            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="cyber-card cyber-corner rounded-2xl p-5 sm:p-8 space-y-5 border-green-500/15">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" /> Send a Message
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Your default email app will open with these details filled in. Review and send the message there; this page does not claim delivery.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name *</label>
                  <Input id="contact-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="h-11 bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address *</label>
                  <Input id="contact-email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" className="h-11 bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                <Input id="contact-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Withdrawal issue" className="h-11 bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message *</label>
                <textarea id="contact-message" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={5} className="w-full rounded-lg bg-background/60 border border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] text-sm px-4 py-3 resize-y outline-none transition-all text-foreground placeholder:text-muted-foreground" />
              </div>
              <Button type="submit" className="w-full min-h-11 btn-cyber rounded-xl font-black tracking-widest uppercase text-sm">
                Open Email App →
              </Button>
              <p className="text-center text-xs text-muted-foreground">If your email app does not open, contact <a href="mailto:support@rewardsverse.com" className="text-green-400 underline underline-offset-2">support@rewardsverse.com</a>.</p>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}
