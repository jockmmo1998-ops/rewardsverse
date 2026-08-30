import { useMemo } from 'react';
import { ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SectionHeading, Surface } from '@/components/shared/RewardUI';

const pages: Record<string, { eyebrow: string; title: string; intro: string; sections: Array<{ title: string; body: string }> }> = {
  '/privacy': { eyebrow: 'Trust & transparency', title: 'Privacy Policy', intro: 'This page explains the account and activity information RewardsVerse uses to operate the rewards service.', sections: [
    { title: 'Information used', body: 'RewardsVerse uses the account details you provide, authentication/session information, provider identifiers needed for offer tracking, and activity records needed to show balances, rewards and withdrawals.' },
    { title: 'How information is used', body: 'Information is used to authenticate your account, attribute verified provider callbacks, prevent duplicate rewards, maintain activity history, process withdrawal requests and respond to support requests.' },
    { title: 'Provider callbacks', body: 'Configured offer providers may send callback data such as a user identifier, reward amount and transaction identifier. These values are validated server-side before a reward is credited.' },
    { title: 'Your choices', body: 'You can manage browser preferences locally through Settings and contact support through the official Telegram channel linked on this site.' },
  ] },
  '/terms': { eyebrow: 'Service terms', title: 'Terms of Service', intro: 'By using RewardsVerse, you agree to use the service lawfully and to provide accurate account information.', sections: [
    { title: 'Rewards', body: 'Rewards are credited only after a configured provider sends a valid callback that passes authentication and duplicate-transaction checks. Offer availability, eligibility and reward amounts are controlled by providers and may change.' },
    { title: 'Account conduct', body: 'Do not create duplicate accounts, manipulate tracking, submit false information or attempt to generate rewards outside the configured provider flow. We may restrict activity that appears abusive or fraudulent.' },
    { title: 'Withdrawals', body: 'Withdrawal requests are subject to the available balance, minimum amount, selected method and server-side validation. Requests may remain pending while they are reviewed.' },
    { title: 'Changes', body: 'The service and these terms may be updated as the product and provider integrations change. The latest version is published on this page.' },
  ] },
  '/cookies': { eyebrow: 'Browser preferences', title: 'Cookie Policy', intro: 'RewardsVerse uses a limited set of browser storage and cookies to keep sessions and preferences working.', sections: [
    { title: 'Necessary session storage', body: 'Authentication cookies or equivalent browser session mechanisms are required to keep you signed in and protect authenticated requests.' },
    { title: 'Preferences', body: 'Settings such as notification and reward-sound preferences may be stored locally in your browser so the interface can remember your choice.' },
    { title: 'Managing storage', body: 'You can clear cookies and local browser storage through your browser settings. Clearing necessary session storage may sign you out.' },
  ] },
  '/reward-policy': { eyebrow: 'Reward operations', title: 'Reward Policy', intro: 'This policy describes when provider activity becomes a visible RewardsVerse reward.', sections: [
    { title: 'Verification first', body: 'A click or an offer opening is not a reward event. The balance, activity record and notification are updated only after the server validates a provider postback.' },
    { title: 'Duplicate protection', body: 'Provider and transaction identifiers are checked before crediting. Repeated callbacks for the same conversion are recorded as duplicates and do not create another balance credit.' },
    { title: 'Corrections', body: 'If a provider reverses or disputes a conversion, the account activity may be reviewed and corrected in accordance with the provider integration and applicable account records.' },
  ] },
  '/withdrawal-policy': { eyebrow: 'Payout operations', title: 'Withdrawal Policy', intro: 'RewardsVerse currently presents supported payout methods and validates each request on the server.', sections: [
    { title: 'Supported methods', body: 'The current withdrawal form supports Litecoin and Binance wallet destinations. Always verify the network and destination before confirming a request.' },
    { title: 'Minimum and balance', body: 'The current minimum shown by the service is $0.30. A request cannot exceed the available balance, and the balance is reserved when an accepted request is created.' },
    { title: 'Review outcomes', body: 'Requests may be pending, approved or rejected. If a request is rejected, the administrative reason is shown when available and the reserved amount is returned through the existing server workflow.' },
  ] },
  '/faq': { eyebrow: 'Help center', title: 'Frequently asked questions', intro: 'Short answers about offers, rewards and withdrawals.', sections: [
    { title: 'When does a reward appear?', body: 'After the provider callback is received and validated. Clicking an offer alone does not credit a balance.' },
    { title: 'Why is an offer unavailable?', body: 'A provider may be temporarily unavailable or not configured for the current deployment. Try another configured provider or contact support.' },
    { title: 'How do I withdraw?', body: 'Open Withdraw, select a supported method, enter the destination and amount, then review and confirm the request.' },
    { title: 'How do I contact support?', body: 'Use the official Telegram support link below. RewardsVerse does not present a fake in-app live chat.' },
  ] },
};

export default function LegalPage() {
  const location = useLocation();
  const page = useMemo(() => pages[location.pathname] || pages['/faq'], [location.pathname]);
  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading eyebrow={page.eyebrow} title={page.title} description={page.intro} />
      <Surface className="divide-y divide-border/70 overflow-hidden">{page.sections.map((section) => <section key={section.title} className="p-5 sm:p-7"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="h-4 w-4" /></span><div><h2 className="font-display text-lg font-semibold text-foreground">{section.title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p></div></div></section>)}</Surface>
      <Surface className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Need help with an account or payout question?</p></div><a href="https://t.me/wilsonrobertul804" target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground">Contact Telegram support <ExternalLink className="h-3.5 w-3.5" /></a></Surface>
      <p className="text-xs text-muted-foreground">For account-specific help, avoid sharing passwords or secret provider credentials in public messages.</p>
      <Link to="/home" className="text-sm font-semibold text-primary hover:text-primary/80">← Back to RewardsVerse</Link>
    </div>
  );
}
