import { ANCHOR_IDS } from '@/shared/constants';

export interface NavItemType {
  label: string;
  href: string;
}

export const landingPageNav: NavItemType[] = [
  {
    label: 'common.landing_solutions',
    href: `/#${ANCHOR_IDS.SOLUTIONS}`,
  },
  {
    label: 'common.landing_features',
    href: `/#${ANCHOR_IDS.FEATURES}`,
  },
  {
    label: 'common.landing_plans',
    href: `/#${ANCHOR_IDS.PLANS}`,
  },
];

export const marathonNav: NavItemType[] = [
  {
    label: 'common.marathon_details',
    href: '/learning-marathons/2025S1',
  },
  {
    label: 'common.marathon_announcements',
    href: '/learning-marathons/2025S1/announcements',
  },
  {
    label: 'common.marathon_projects',
    href: '/projects',
  },
];
