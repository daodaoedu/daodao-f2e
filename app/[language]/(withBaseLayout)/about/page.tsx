import { Metadata } from 'next';
import About from '@/components/About';

export const metadata: Metadata = {
  title: '關於島島',
  description:
    '在島島阿學裡，每個人都是一座獨一無二的「島」，對於學習／生命擁有不同的渴望與資源，因為互相、互助學習，成為一片獨立又連結的群島。而島島阿學也希望能有台語「沓沓仔學Ta̍uh-ta̍uh-á o̍h」，「慢慢學不用急」之意涵，道出組織的教育價值觀是以人為本，尊重每人學習步調與方向。',
  keywords: '島島阿學',
  authors: [{ name: '島島阿學' }],
};

const AboutPage = () => {
  return <About />;
};

export default AboutPage;
