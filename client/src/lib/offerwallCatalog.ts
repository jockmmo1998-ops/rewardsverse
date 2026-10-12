export type OfferWall = {
  id: string;
  name: string;
  desc: string;
  reward: string;
  logo: string;
  tag: string;
  category?: string;
  rating: number;
  surface: string;
  border: string;
  logoSurface: string;
  accent: string;
  brandColor: string;
  track: string;
  gradient: string;
  badgeSurface: string;
};

export const OFFER_WALLS: OfferWall[] = [
  { id: 'radientwall', name: 'RadientWall', desc: 'Surveys & rewarded offers worldwide', reward: '$0.10–$10.00', logo: '/assets/provider-logos/radientwall.png', tag: 'NEW', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: '#8B5CF6', logoSurface: '#ffffff', accent: '#C084FC', brandColor: '#8B5CF6', track: '#34205B', gradient: 'linear-gradient(90deg, #8B5CF6, #C084FC)', badgeSurface: '#34205B' },
  { id: 'offerwallme', name: 'Offerwall.me', desc: 'Official rewarded offers & tasks', reward: '$0.10–$10.00', logo: '/assets/provider-logos/offerwallme.svg', tag: 'OFFICIAL', category: 'Tasks', rating: 4.9, surface: '#ffffff', border: '#00B8A9', logoSurface: '#06111D', accent: '#8BD450', brandColor: '#00B8A9', track: '#123F3D', gradient: 'linear-gradient(90deg, #00B8A9, #8BD450)', badgeSurface: '#163F3A' },
  { id: 'gemiwall', name: 'GemiWall', desc: 'Premium survey & offer wall', reward: '$0.10–$5.00', logo: '/assets/provider-logos/gemiwall.png', tag: 'POPULAR', rating: 4.8, surface: '#ffffff', border: '#7A31F7', logoSurface: '#ffffff', accent: '#B256F7', brandColor: '#7A31F7', track: '#39204F', gradient: 'linear-gradient(90deg, #7A31F7, #B256F7)', badgeSurface: '#2A1645' },
  { id: 'revtoo', name: 'Revtoo', desc: 'High-paying mobile offers', reward: '$0.25–$8.00', logo: '/assets/provider-logos/revtoo.svg', tag: 'HIGH PAY', category: 'Mobile', rating: 4.9, surface: '#ffffff', border: '#38B6FF', logoSurface: '#0B1420', accent: '#5CE1E6', brandColor: '#5CE1E6', track: '#123840', gradient: 'linear-gradient(90deg, #5CE1E6, #00BF63, #38B6FF)', badgeSurface: '#143D45' },
  { id: 'moustache', name: 'Moustache Leads', desc: 'CPI & CPA offers worldwide', reward: '$0.50–$10.00', logo: '/assets/provider-logos/optimized/moustache.webp', tag: 'PREMIUM', category: 'Apps', rating: 4.7, surface: '#ffffff', border: '#A23BD0', logoSurface: '#ffffff', accent: '#FCA824', brandColor: '#480060', track: '#3D1D42', gradient: 'linear-gradient(90deg, #480060, #A23BD0, #FCA824)', badgeSurface: '#412040' },
  { id: 'taskwall', name: 'Taskwall', desc: 'Sign-up & engagement tasks', reward: '$0.15–$6.00', logo: '/assets/provider-logos/taskwall.svg', tag: 'SIGN-UPS', category: 'Tasks', rating: 4.6, surface: '#ffffff', border: '#059FFB', logoSurface: '#ffffff', accent: '#019EFC', brandColor: '#213244', track: '#123747', gradient: 'linear-gradient(90deg, #019EFC, #059FFB)', badgeSurface: '#122C41' },
  { id: 'cointo', name: 'Cointo', desc: 'Crypto-focused offers', reward: '$0.20–$4.00', logo: '/assets/provider-logos/optimized/cointo.webp', tag: 'CRYPTO', category: 'Apps', rating: 4.4, surface: '#ffffff', border: '#10B981', logoSurface: '#ffffff', accent: '#059669', brandColor: '#10B981', track: '#104537', gradient: 'linear-gradient(90deg, #10B981, #059669)', badgeSurface: '#104738' },
  { id: 'klink', name: 'Klink Labs', desc: 'Finance & trading offers', reward: '$0.30–$7.00', logo: '/assets/provider-logos/klink-transparent.png', tag: 'FINANCE', category: 'Apps', rating: 4.8, surface: '#ffffff', border: '#664DFF', logoSurface: '#ffffff', accent: '#9583FF', brandColor: '#664DFF', track: '#302768', gradient: 'linear-gradient(90deg, #664DFF, #9583FF)', badgeSurface: '#282047' },
  { id: 'adswedmedia', name: 'AdsWedMedia', desc: 'CPA & incent offers worldwide', reward: '$0.10–$6.00', logo: '/assets/provider-logos/adswedmedia.png', tag: 'NEW', rating: 4.7, surface: '#ffffff', border: '#3B82F6', logoSurface: '#ffffff', accent: '#06B6D4', brandColor: '#3B82F6', track: '#173C59', gradient: 'linear-gradient(90deg, #3B82F6, #06B6D4)', badgeSurface: '#173852' },
  { id: 'admaxflow', name: 'AdMaxFlow', desc: 'Surveys, apps & tasks worldwide', reward: '$0.10–$5.00', logo: '/assets/provider-logos/admaxflow.png', tag: 'NEW', category: 'Tasks', rating: 4.6, surface: '#ffffff', border: '#F97316', logoSurface: '#ffffff', accent: '#FCD34D', brandColor: '#F97316', track: '#49301D', gradient: 'linear-gradient(90deg, #F97316, #FCD34D)', badgeSurface: '#4A2A17' },
  { id: 'gaintwall', name: 'Gaintwall', desc: 'Earn with surveys & tasks worldwide', reward: '$0.10–$6.00', logo: '/assets/provider-logos/gaintwall.svg', tag: 'NEW', rating: 4.7, surface: '#ffffff', border: '#E11D48', logoSurface: '#ffffff', accent: '#FBBF24', brandColor: '#E11D48', track: '#4A1C2B', gradient: 'linear-gradient(90deg, #E11D48, #F43F5E, #FBBF24)', badgeSurface: '#491B2A' },
  { id: 'opinionuniverse', name: 'OpinionUniverse', desc: 'Surveys, apps & rewarded tasks', reward: '$0.10–$10.00', logo: '/assets/provider-logos/opinionuniverse.png', tag: 'NEW', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: '#FF5300', logoSurface: '#ffffff', accent: '#FF8C00', brandColor: '#FF5300', track: '#4B291C', gradient: 'linear-gradient(90deg, #FF5300, #FF8C00)', badgeSurface: '#4B2817' },
  { id: 'buckswall', name: 'BucksWall', desc: 'Mobile apps, surveys & gaming offers', reward: '$0.10–$6.00', logo: '', tag: 'SETUP', category: 'Mobile', rating: 4.6, surface: '#ffffff', border: '#2563EB', logoSurface: '#ffffff', accent: '#0D9488', brandColor: '#2563EB', track: '#16384D', gradient: 'linear-gradient(90deg, #2563EB, #0D9488)', badgeSurface: '#18344C' },
  { id: 'offermintx', name: 'OfferMintX', desc: 'Premium CPA offers worldwide', reward: '$0.10–$25.00', logo: '/assets/provider-logos/optimized/offermintx.webp', tag: 'NEW', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: '#22C55E', logoSurface: '#ffffff', accent: '#16A34A', brandColor: '#22C55E', track: '#164633', gradient: 'linear-gradient(90deg, #22C55E, #16A34A)', badgeSurface: '#174631' },
  { id: 'cpxresearch', name: 'CPX Research', desc: 'Paid surveys worldwide', reward: '$0.10–$5.00', logo: '/assets/provider-logos/cpxresearch.svg', tag: 'SURVEYS', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: '#00BE9D', logoSurface: '#ffffff', accent: '#00FF87', brandColor: '#00BE9D', track: '#11463C', gradient: 'linear-gradient(90deg, #00BE9D, #00FF87)', badgeSurface: '#104236' },
  { id: 'theoremreach', name: 'TheoremReach', desc: 'Rewarded surveys worldwide', reward: '$0.10–$5.00', logo: '/assets/provider-logos/theoremreach.svg', tag: 'SURVEYS', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: '#9855FC', logoSurface: '#241D46', accent: '#E22B82', brandColor: '#241D46', track: '#30204C', gradient: 'linear-gradient(90deg, #6A28C8, #6A34FC, #E22B82)', badgeSurface: '#322345' },
  { id: 'timewall', name: 'TimeWall', desc: 'Surveys, microtasks & paid offers', reward: '$0.10–$8.00', logo: '/assets/provider-logos/timewall.png', tag: 'SURVEYS', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: '#00B4C6', logoSurface: '#ffffff', accent: '#4EB76E', brandColor: '#00B4C6', track: '#124345', gradient: 'linear-gradient(90deg, #00B4C6, #4EB76E)', badgeSurface: '#154239' },
];

export const NEW_TAB_WALL_IDS = new Set(['timewall', 'cointo']);
export const OPINION_UNIVERSE_WALL_ID = 'opinionuniverse';
export const OPINION_UNIVERSE_URL = 'https://opinionuniverse.com/offerwall?pubId=4078&appId=ID_95cdecb90aad77eaa007a2a89e6661d9';
