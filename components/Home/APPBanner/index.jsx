import { Title, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

const GuideWrapper = ({ children }) => (
  <div className="mx-auto pt-10 pb-10 max-md:pt-10 max-md:pb-5">
    {children}
  </div>
);

function ComingSoon() {
  return (
    <GuideWrapper>
      <Title
        as="h2"
        size="lg"
        className="text-[#536166] font-bold text-[26px] leading-[50px] tracking-[0.08em] text-left ml-[calc(5%+20px)] max-md:mx-[5%]"
      >
        新增多元學習資源小幫手
      </Title>
      <img
        src="/assets/extension-banner.png"
        className="block h-[300px] my-5 mx-auto max-md:w-screen max-md:h-auto max-md:mt-5"
        alt="Extension Banner"
      />
      <div className="mt-5 flex justify-center items-start my-3 mx-[calc(5%+20px)] max-md:mx-[5%] max-md:flex-col">
        <Text>
          為了鼓勵大家共享資源與互助學習，因此推出 Chrome Extension APP
          快速抓取網站資源，免去填寫大量複雜資訊，降低彼此新增資源的門檻與意願！
        </Text>
      </div>
      <div className="flex justify-center items-center my-5 mx-auto max-md:mx-[5%]">
        <Button
          onClick={() => {
            window?.open(
              'https://chrome.google.com/webstore/detail/hcjaenainlhcfpofopninhciegmeilae',
              '_blank'
            );
          }}
          className="bg-[#16b9b3] text-white rounded-2xl hover:bg-[#16b9b3] hover:opacity-80"
        >
          立即下載體驗！
        </Button>
      </div>
    </GuideWrapper>
  );
}

export default ComingSoon;
