import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
          <h1 className="text-xl font-bold text-white">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing and using RewardsVerse, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. User Responsibilities</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              Users are responsible for:
            </p>
            <ul className="text-slate-300 space-y-2 ml-6">
              <li>• Maintaining the confidentiality of your account credentials</li>
              <li>• Providing accurate and truthful information during registration</li>
              <li>• Complying with all applicable laws and regulations</li>
              <li>• Not engaging in fraudulent or deceptive activities</li>
              <li>• Not attempting to manipulate or exploit the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Offer Completion</h2>
            <p className="text-slate-300 leading-relaxed">
              Users must genuinely complete offers as instructed by the offer providers. We reserve the right to reject earnings from offers that appear to be fraudulently completed or that violate provider terms. Repeated violations may result in account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Withdrawal Policy</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              • Minimum withdrawal amount: $0.50
            </p>
            <p className="text-slate-300 leading-relaxed mb-3">
              • Withdrawals are processed within 24-48 hours after approval
            </p>
            <p className="text-slate-300 leading-relaxed">
              • We reserve the right to verify user identity and account activity before processing withdrawals
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Account Suspension</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to suspend or terminate accounts that:
            </p>
            <ul className="text-slate-300 space-y-2 ml-6 mt-3">
              <li>• Engage in fraudulent activities</li>
              <li>• Violate offer provider terms</li>
              <li>• Use multiple accounts to gain unfair advantages</li>
              <li>• Attempt to exploit system vulnerabilities</li>
              <li>• Violate any terms of this agreement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              RewardsVerse is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Contact</h2>
            <p className="text-slate-300 leading-relaxed">
              For questions about these terms, please contact our support team through the contact page.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-800">
            <p className="text-slate-400 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
