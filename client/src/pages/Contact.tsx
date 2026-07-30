import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Mail, MessageCircle, Clock, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INFO = [
  { icon: Mail,          title: "Email Support",  value: "support@rewardsverse.online", sub: "Reply within 24 hours",  color: "#818cf8" },
  { icon: MessageCircle, title: "Live Chat",       value: "Available in Dashboard",      sub: "Mon–Fri, 9am–6pm UTC",   color: "#22d3ee" },
  { icon: Clock,         title: "Response Time",   value: "< 24 Hours",                  sub: "Average response time",  color: "#4ade80" },
];

const SUBJECTS = ["General Question","Payment Issue","Technical Problem","Account Help","Report a Bug","Other"];

export default function Contact() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name:"", email:"", subject:SUBJECTS[0], message:"" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false); setSent(true);
  };

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"0.75rem 1rem",
    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:"0.75rem", color:"#f4f4f8", fontSize:"0.875rem", outline:"none",
    transition:"border-color 0.2s ease, box-shadow 0.2s ease",
  };
  const iFocus = (e: any) => { e.target.style.borderColor="rgba(99,102,241,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; };
  const iBlur  = (e: any) => { e.target.style.borderColor="rgba(255,255,255,0.08)"; e.target.style.boxShadow="none"; };

  return (
    <div className="min-h-screen" style={{ background:"#0a0a0f", color:"#f4f4f8" }}>
      <div className="noise-overlay" /><div className="grid-overlay" />

      {/* Header */}
      <div className="relative z-10" style={{ background:"rgba(10,10,15,0.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="max-w-4xl mx-auto px-5 py-5 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">Contact Us</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem" }}>We're here to help</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 py-10 space-y-7">

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {INFO.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${item.color}12` }}>
                <item.icon className="w-5 h-5" style={{ color:item.color }} />
              </div>
              <div>
                <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.75rem", marginBottom:"0.2rem" }}>{item.title}</p>
                <p className="text-sm font-bold">{item.value}</p>
                <p style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.75rem", marginTop:"0.2rem" }}>{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="success" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl g-primary flex items-center justify-center mx-auto mb-4" style={{ boxShadow:"0 0 24px rgba(99,102,241,0.50)" }}>
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2">Message Sent!</h3>
                <p style={{ color:"rgba(255,255,255,0.40)", marginBottom:"1.5rem" }}>We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name:"", email:"", subject:SUBJECTS[0], message:"" }); }}
                  className="btn-ghost-gpt px-6 py-2.5">Send Another</button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-black mb-1">Send a Message</h2>
                <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.875rem", marginBottom:"1.5rem" }}>Fill out the form and our team will respond promptly.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:"rgba(255,255,255,0.40)" }}>Your Name</label>
                    <input style={inputStyle} required placeholder="John Doe" value={form.name} onChange={e => setForm({...form,name:e.target.value})} onFocus={iFocus} onBlur={iBlur} />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:"rgba(255,255,255,0.40)" }}>Email Address</label>
                    <input type="email" style={inputStyle} required placeholder="you@email.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} onFocus={iFocus} onBlur={iBlur} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:"rgba(255,255,255,0.40)" }}>Subject</label>
                  <select style={{ ...inputStyle }} value={form.subject} onChange={e => setForm({...form,subject:e.target.value})} onFocus={iFocus} onBlur={iBlur}>
                    {SUBJECTS.map(s => <option key={s} value={s} style={{ background:"#111118" }}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:"rgba(255,255,255,0.40)" }}>Message</label>
                  <textarea style={{ ...inputStyle, resize:"none" }} rows={5} required placeholder="Describe your issue in detail…" value={form.message} onChange={e => setForm({...form,message:e.target.value})} onFocus={iFocus} onBlur={iBlur} />
                </div>
                <button type="submit" disabled={loading} className="btn-gpt flex items-center gap-2 px-8 py-3.5" style={{ opacity:loading?0.7:1 }}>
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
