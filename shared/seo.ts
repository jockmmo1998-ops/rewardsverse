export const SEO_SITE_ORIGIN = 'https://rewardsverse.online';
export const SEO_SOCIAL_IMAGE = '/rewardsverse-community-cutout-green.png';

export interface SeoPage {
  title: string;
  description: string;
  indexable: boolean;
}

const SEO_PAGES: Record<string, SeoPage> = {
  '/home': {
    title: 'RewardsVerse — Earn Rewards Online',
    description: 'Explore live surveys, apps, games and partner offers through RewardsVerse. Track offer progress, earnings and payout details in one clear place.',
    indexable: true,
  },
  '/support': {
    title: 'Support — RewardsVerse',
    description: 'Get help with your RewardsVerse account, offer completion, reward credits and withdrawals.',
    indexable: true,
  },
  '/privacy': {
    title: 'Privacy Policy — RewardsVerse',
    description: 'Read how RewardsVerse handles personal information and protects account data.',
    indexable: true,
  },
  '/terms': {
    title: 'Terms of Service — RewardsVerse',
    description: 'Review the terms for using RewardsVerse and participating in offers, rewards and withdrawals.',
    indexable: true,
  },
  '/cookies': {
    title: 'Cookie Policy — RewardsVerse',
    description: 'Learn how RewardsVerse uses cookies and related technologies.',
    indexable: true,
  },
  '/reward-policy': {
    title: 'Reward Policy — RewardsVerse',
    description: 'Review the rules for offer completion, reward crediting, verification and account balances.',
    indexable: true,
  },
  '/withdrawal-policy': {
    title: 'Withdrawal Policy — RewardsVerse',
    description: 'Review RewardsVerse withdrawal eligibility, payout methods, minimums and processing information.',
    indexable: true,
  },
  '/faq': {
    title: 'FAQ — RewardsVerse',
    description: 'Find answers about RewardsVerse accounts, offers, reward credits and withdrawals.',
    indexable: true,
  },
  '/login': {
    title: 'Sign In — RewardsVerse',
    description: 'Sign in to access your RewardsVerse account.',
    indexable: false,
  },
  '/register': {
    title: 'Create Account — RewardsVerse',
    description: 'Create a RewardsVerse account to explore available partner offers.',
    indexable: false,
  },
  '/forgot-password': {
    title: 'Reset Password — RewardsVerse',
    description: 'Recover access to your RewardsVerse account.',
    indexable: false,
  },
  '/reset-password': {
    title: 'Reset Password — RewardsVerse',
    description: 'Set a new password for your RewardsVerse account.',
    indexable: false,
  },
  '/verify-email': {
    title: 'Verify Email — RewardsVerse',
    description: 'Verify the email address associated with your RewardsVerse account.',
    indexable: false,
  },
};

export function normalizeSeoPath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const path = pathname.split('?')[0];
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function getSeoPage(pathname: string): SeoPage {
  return SEO_PAGES[normalizeSeoPath(pathname)] ?? {
    title: 'RewardsVerse Account',
    description: 'Manage your RewardsVerse account and rewards.',
    indexable: false,
  };
}
