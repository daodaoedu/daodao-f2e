import { Title, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

const GuideWrapper = ({ children }) => (
  <div className="mx-auto pb-10 pt-10 max-md:pb-5 max-md:pt-10">
    {children}
  </div>
);

function ComingSoon() {
  return (
    <GuideWrapper>
      <Title
        as="h2"
        size="lg"
        className="ml-[calc(5%+20px)] text-left text-[26px] font-bold leading-[50px] tracking-[0.08em] text-[#536166] max-md:mx-[5%]"
      >
        新增多元學習資源小幫手
      </Title>
      <img
        src="/assets/extension-banner.png"
        className="mx-auto my-5 block h-[300px] max-md:mt-5 max-md:h-auto max-md:w-screen"
        alt="Extension Banner"
      />
      <div className="mx-[calc(5%+20px)] my-3 mt-5 flex items-start justify-center max-md:mx-[5%] max-md:flex-col">
        <Text>
          為了鼓勵大家共享資源與互助學習，因此推出 Chrome Extension APP
          快速抓取網站資源，免去填寫大量複雜資訊，降低彼此新增資源的門檻與意願！
        </Text>
      </div>
      <div className="mx-auto my-5 flex items-center justify-center max-md:mx-[5%]">
        <Button
          onClick={() => {
            window?.open(
              'https://chrome.google.com/webstore/detail/hcjaenainlhcfpofopninhciegmeilae',
              '_blank'
            );
          }}
          className="rounded-2xl bg-[#16b9b3] text-white hover:bg-[#16b9b3] hover:opacity-80"
        >
          立即下載體驗！
        </Button>
      </div>
    </GuideWrapper>
  );
}

export default ComingSoon;
