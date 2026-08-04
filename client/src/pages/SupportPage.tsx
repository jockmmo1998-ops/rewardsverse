import { HelpCircle, MessageSquare, Mail, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';

export default function SupportPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <PageHeader title="Support Center" subtitle="We're here to help you with any issues." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-semibold mb-2">Read FAQ</h3>
          <p className="text-xs text-muted-foreground">Find answers to common questions quickly.</p>
        </GlassCard>
        
        <GlassCard className="p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-semibold mb-2">Live Chat</h3>
          <p className="text-xs text-muted-foreground">Chat with our support team in real-time.</p>
        </GlassCard>
        
        <GlassCard className="p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-semibold mb-2">Email Us</h3>
          <p className="text-xs text-muted-foreground">Send us a detailed message with attachments.</p>
        </GlassCard>
      </div>

      <GlassCard className="p-6 md:p-8">
        <h3 className="font-heading font-bold text-xl mb-6">Submit a Support Ticket</h3>
        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Subject</label>
              <input type="text" placeholder="E.g. Missing points from offer" className="w-full h-11 px-4 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
              <select className="w-full h-11 px-4 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none">
                <option value="offers">Offers & Tasks</option>
                <option value="withdrawals">Withdrawals</option>
                <option value="account">Account & Security</option>
                <option value="referrals">Referrals</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Message</label>
            <textarea rows={5} placeholder="Please describe your issue in detail..." className="w-full p-4 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"></textarea>
          </div>
          
          <div className="pt-2">
            <button type="button" className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
              Submit Ticket
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
