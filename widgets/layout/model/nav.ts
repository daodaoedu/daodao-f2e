import { ANCHOR_IDS } from '@/shared/constants';

export interface NavItemType {
  label: string;
  href: string;
}

export const landingPageNav: NavItemType[] = [
  {
    label: '解決困境',
    href: `/#${ANCHOR_IDS.FEATURE}`,
  },
  {
    label: '功能生態',
    href: `/#${ANCHOR_IDS.FUNCTIONS}`,
  },
  {
    label: '方案',
    href: `/#${ANCHOR_IDS.PLANS}`,
  },
];

export const marathonNav: NavItemType[] = [
  {
    label: '活動詳情',
    href: '/learning-marathons/2025S1',
  },
  {
    label: '活動公告',
    href: '/learning-marathons/2025S1/announcements',
  },
  {
    label: '學習計畫分享區',
    href: '/projects',
  },
];
