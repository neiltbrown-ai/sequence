import type { Provider } from '@/types/assessment';

export const PROVIDERS: Provider[] = [
  // Entity Formation
  {
    id: 'legalzoom',
    name: 'LegalZoom',
    url: 'https://www.legalzoom.com',
    category: 'entity_formation',
    description: 'LLC and business formation services. Widely used, includes registered agent service.',
    affiliate_active: false,
  },
  {
    id: 'zenbusiness',
    name: 'ZenBusiness',
    url: 'https://www.zenbusiness.com',
    category: 'entity_formation',
    description: 'Business formation with free registered agent for the first year. Good value option.',
    affiliate_active: false,
  },
  {
    id: 'tailorbrands',
    name: 'Tailor Brands',
    url: 'https://www.tailorbrands.com',
    category: 'entity_formation',
    description: 'LLC formation bundled with branding tools. Good for creatives who want an all-in-one solution.',
    affiliate_active: false,
  },

  // Business Banking
  {
    id: 'mercury',
    name: 'Mercury',
    url: 'https://mercury.com',
    category: 'banking',
    description: 'Modern business banking with clean interface. No fees, integrates with accounting tools.',
    affiliate_active: false,
  },
  {
    id: 'relay',
    name: 'Relay',
    url: 'https://relayfi.com',
    category: 'banking',
    description: 'Business banking with built-in profit-first accounting features and sub-accounts.',
    affiliate_active: false,
  },
  {
    id: 'novo',
    name: 'Novo',
    url: 'https://www.novo.co',
    category: 'banking',
    description: 'Free business checking designed for small businesses and freelancers.',
    affiliate_active: false,
  },

  // Accounting Software
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    url: 'https://quickbooks.intuit.com',
    category: 'accounting',
    description: 'Industry standard accounting software. Most CPAs are familiar with it.',
    affiliate_active: false,
  },
  {
    id: 'wave',
    name: 'Wave',
    url: 'https://www.waveapps.com',
    category: 'accounting',
    description: 'Free accounting software. Good starting point for early-stage creatives.',
    affiliate_active: false,
  },
  {
    id: 'bench',
    name: 'Bench',
    url: 'https://bench.co',
    category: 'accounting',
    description: 'Done-for-you bookkeeping service. Pairs you with a dedicated bookkeeper.',
    affiliate_active: false,
  },

  // Creative-Industry Professionals (referral network)
  {
    id: 'seq_cpa_referral',
    name: 'In Sequence CPA Network',
    url: '/coaching',
    category: 'legal',
    description: 'Creative-industry-experienced CPAs vetted by In Sequence. Request a referral through our advisory service.',
    affiliate_active: false,
  },
  {
    id: 'seq_attorney_referral',
    name: 'In Sequence Attorney Network',
    url: '/coaching',
    category: 'legal',
    description: 'Entertainment and creative-industry attorneys vetted by In Sequence. Request a referral through our advisory service.',
    affiliate_active: false,
  },
];

/** Get providers by category */
export function getProvidersByCategory(category: Provider['category']): Provider[] {
  return PROVIDERS.filter(p => p.category === category);
}
