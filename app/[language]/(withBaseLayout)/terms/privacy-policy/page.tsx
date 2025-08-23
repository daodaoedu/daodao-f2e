import { Metadata } from 'next';
import TermsPrivacyPolicy from '@/components/Terms/Privacypolicy';

export const metadata: Metadata = {
  title: '使用者條款與隱私權政策',
  description:
    '感謝您有意願貢獻資料及相關內容（以下統稱「內容」）至島島阿學學習社群（https://www.daoedu.tw，以下簡稱「本網站」）。此使用者條款存在於您及本網站管理機關島島阿學學習社群（「管理者」）間，目的在釐清雙方相關智慧財產權利狀態及其他權利義務關係。請閱讀以下條款及條件並確認，當您上傳內容至本網站時，即表示您接受本協議內容。',
};

const TermsPrivacyPolicyPage = () => {
  return <TermsPrivacyPolicy />;
};

export default TermsPrivacyPolicyPage;
