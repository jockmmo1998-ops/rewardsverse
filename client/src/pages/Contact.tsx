import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Mail, MessageCircle, Clock, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INFO = [
  { icon: Mail,          title: "Email Support",    value: "support@rewardsverse.online", sub: "Reply within 24 hours",   color: "#7c3aed" },
  { icon: MessageCircle, title: "Live Chat",         value: "Available in Dashboard",      sub: "Mon–Fri, 9am–6pm UTC",    color: "#06b6d4" },
  { icon: Clock,         title: "Response Time",     value: "< 24 Hours",                  sub: "Average response time",   color: "#10b981" },
];

const SUBJECTS = ["General Question", "Payment Issue", "Technical Problem", "Account Help", "Report a Bug", "Other"];

export default function Contact() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Contact Us</h1>
            <p className="text-muted-foreground text-sm">We're here to help you</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {INFO.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="pc-card rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">{item.title}</p>
                <p className="text-sm font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form card */}
        <div className="pc-card rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-foreground mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }); }}
                  className="btn-outline-primary px-6 py-2.5 rounded-xl text-sm font-bold">
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-extrabold text-foreground mb-1">Send a Message</h2>
                <p className="text-muted-foreground text-sm mb-5">Fill out the form and our team will respond promptly.</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">Your Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white input-pc text-sm outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">Email Address</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white input-pc text-sm outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">Subject</label>
                  <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white input-pc text-sm outline-none transition-all">
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">Message</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5}
                    placeholder="Describe your issue or question in detail…"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white input-pc text-sm outline-none transition-all resize-none" />
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary py-3.5 px-8 rounded-xl text-sm font-bold flex items-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
