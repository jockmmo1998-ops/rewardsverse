import { ArrowLeft, Mail, MessageSquare, Clock, Zap, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Message sent! We'll reply within 24 hours.");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-cyan-500/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-green-500/4 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
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

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 tag-cyan mb-4">
            <MessageSquare className="w-3 h-3" /> Support
          </div>
          <h2 className="text-4xl font-extrabold mb-3">Get in <span className="text-gradient">Touch</span></h2>
          <p className="text-muted-foreground">Our team is available 24/7 to help you with any questions or issues.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            {[
              { icon: Mail,         color: "text-green-400", bg: "bg-green-500/10", title: "Email Support",    desc: "support@rewardsverse.com", sub: "Response within 24h" },
              { icon: MessageSquare,color: "text-cyan-400",  bg: "bg-cyan-500/10",  title: "Live Chat",        desc: "Available on dashboard",    sub: "Response within 1h" },
              { icon: Clock,        color: "text-purple-400",bg: "bg-purple-500/10",title: "Response Time",    desc: "< 24 hours typical",        sub: "Mon–Sun, 24/7" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="cyber-card rounded-xl p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  <p className="text-[10px] text-green-400/70 mt-0.5 font-bold uppercase tracking-wide">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="cyber-card rounded-2xl p-10 text-center border-green-500/25 h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full gradient-cyber flex items-center justify-center mx-auto mb-6 glow-green">
                  <CheckCircle2 className="w-8 h-8 text-[#060818]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">We'll get back to you within 24 hours.</p>
                <Button onClick={() => { setSubmitted(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
                  variant="outline" className="border-green-500/30 hover:border-green-400 text-green-400 font-bold">
                  Send Another
                </Button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="cyber-card cyber-corner rounded-2xl p-8 space-y-5 border-green-500/15">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" /> Send a Message
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                      className="h-11 bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address *</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email"
                      className="h-11 bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] transition-all" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Withdrawal issue"
                    className="h-11 bg-background/60 border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message *</label>
                  <textarea
                    value={message} onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    className="w-full rounded-lg bg-background/60 border border-border/50 focus:border-green-500 focus:shadow-[0_0_12px_rgba(0,255,135,0.15)] text-sm px-4 py-3 resize-none outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full h-12 btn-cyber rounded-xl font-black tracking-widest uppercase text-sm">
                  Send Message →
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
