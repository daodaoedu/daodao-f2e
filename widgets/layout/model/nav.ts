import type { NavVisibility } from '@/entities/user';
import { ANCHOR_IDS } from '@/shared/constants';

export interface NavItemType {
  label: string;
  href: string;
  visibility?: NavVisibility;
}

export const protectedLayoutNav: NavItemType[] = [
  {
    label: 'explore',
    href: '/explore',
    visibility: 'auth',
  },
  {
    label: 'resources',
    href: '/resource',
    visibility: 'auth',
  },
];

export const guestLayoutNav: NavItemType[] = [
  {
    label: 'landing_solutions',
    href: `/#${ANCHOR_IDS.SOLUTIONS}`,
    visibility: 'guest',
  },
  {
    label: 'landing_features',
    href: `/#${ANCHOR_IDS.FEATURES}`,
    visibility: 'guest',
  },
  {
    label: 'landing_plans',
    href: `/#${ANCHOR_IDS.PLANS}`,
    visibility: 'guest',
  },
  ...protectedLayoutNav,
];

export const marathonNav: NavItemType[] = [
  {
    label: 'marathon_details',
    href: '/learning-marathons/2025S1',
  },
  {
    label: 'marathon_announcements',
    href: '/learning-marathons/2025S1/announcements',
  },
  {
    label: 'marathon_projects',
    href: '/projects',
  },
];
