import SEOConfig from '@/components/SEOConfig';
import getBaseLayout from '@/layout/core/getBaseLayout';
import { Sparkles } from 'lucide-react';

function CommunityPage() {
  return (
    <>
      <SEOConfig
        title="交流 - 島島阿學學習社群"
        description="與學習夥伴交流互動的空間"
        keywords="島島阿學,交流,社群,學習夥伴"
        author="島島阿學"
        copyright="島島阿學"
        imgLink="https://www.daoedu.tw/preview.webp"
      />

      <div className="min-h-screen bg-basic-100 flex items-center justify-center">
        <div className="text-center py-16 px-8">
          <div className="mb-8">
            <Sparkles className="h-16 w-16 mx-auto text-primary-base mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-basic-black">
              交流功能即將開放
            </h1>
            <p className="text-lg text-basic max-w-2xl mx-auto mb-6">
              我們正在精心打造一個讓學習夥伴們互相交流、分享經驗的美好空間
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

CommunityPage.getLayout = getBaseLayout;

export default CommunityPage;
