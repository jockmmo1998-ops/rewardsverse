import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
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
          <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              We collect the following types of information:
            </p>
            <ul className="text-slate-300 space-y-2 ml-6">
              <li>• Account information (username, email, password)</li>
              <li>• Wallet addresses for cryptocurrency transactions</li>
              <li>• Activity data (offers completed, earnings history)</li>
              <li>• Device information (IP address, browser type)</li>
              <li>• Transaction records and withdrawal requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-300 leading-relaxed">
              We use your information to:
            </p>
            <ul className="text-slate-300 space-y-2 ml-6 mt-3">
              <li>• Provide and maintain our services</li>
              <li>• Process your withdrawals and payments</li>
              <li>• Verify your identity and prevent fraud</li>
              <li>• Improve our platform and user experience</li>
              <li>• Communicate with you about your account</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p className="text-slate-300 leading-relaxed">
              We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Sharing</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              We do not sell or share your personal information with third parties, except:
            </p>
            <ul className="text-slate-300 space-y-2 ml-6">
              <li>• With offer wall providers to verify offer completion</li>
              <li>• With payment processors for withdrawal transactions</li>
              <li>• When required by law or legal process</li>
              <li>• To prevent fraud or protect our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking</h2>
            <p className="text-slate-300 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, remember your preferences, and analyze platform usage. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="text-slate-300 leading-relaxed">
              You have the right to:
            </p>
            <ul className="text-slate-300 space-y-2 ml-6 mt-3">
              <li>• Access your personal information</li>
              <li>• Request correction of inaccurate data</li>
              <li>• Request deletion of your account and data</li>
              <li>• Opt-out of certain communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              RewardsVerse is not intended for users under 18 years of age. We do not knowingly collect information from minors. If we become aware that a minor has provided us with personal information, we will delete such information immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about this privacy policy or our privacy practices, please contact us through our support page.
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
