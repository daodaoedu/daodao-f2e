import { Metadata } from 'next';
import { Paper } from '@/shared/ui/wrapper';
import { AboutDaoDao, Vision, Mission, ContactUs } from '@/widgets/about';

export const metadata: Metadata = {
  title: '關於島島',
  description:
    '島島阿學是為「相信學習可以不一樣的人」所打造的學習平台。以科技與社群，匯集學習經驗、資源、人脈，並提供個人化學習管理與技能展現的工具，賦予每個人掌握學習旅程的能力。這裡，是個人成長與集體智慧交會的所在。',
};

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-primary-pale px-4 py-24">
      <Paper className="container max-w-5xl rounded py-8 shadow-lg">
        <AboutDaoDao />
        <Vision />
        <Mission />
        <ContactUs />
      </Paper>
    </div>
  );
}
