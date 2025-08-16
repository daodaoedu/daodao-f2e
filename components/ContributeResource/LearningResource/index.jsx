import React from 'react';
import { Title, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

const LearningResource = () => (
  <div>
    <div className="my-5">
      <Title
        as="h2"
        size="lg"
        className="mt-10 mb-2.5"
      >
        一、新增多元學習資源
      </Title>
      <Text>
        多元學習資源整合各領域各類型資源，此資源需具有學習意義（涵蓋素養教育中認知、情意、技能其中一項即可），此外不得放腥羶色、暴力、違反人權的資源。而資源類型包含但不限於網站、影片、組織、APP、Podcast、書、沒有時效性的線上課程及活動、學習社群（例如：Facebook社團、LINE社群、Instagram帳號、粉絲專頁）、每年固定都有或是沒有時效性的提案／競賽。
      </Text>
      <Text
        className="my-2.5 font-medium"
      >
        我們鼓勵彼此資源共享與共學的精神，歡迎留下自己的名稱/暱稱來展示自己的資源貢獻，也歡迎在表單上留下個人網站/專頁來曝光自己。
      </Text>
      <Text
        as="p"
        className="font-medium text-base mt-3"
      >
        目前新增資源的方式有兩種：
      </Text>
      <div className="mt-2.5 mb-2.5 ml-5">
        <Text as="p" className="font-medium">
          1. 使用全新推出的 Chrome Extension APP 來新增資源
        </Text>
      </div>
      <img
        src="/assets/extension-banner.png"
        className="block h-[300px] mt-5 mx-auto max-md:w-full max-md:h-auto max-md:mt-5"
        alt="Extension Banner"
      />
      <div className="flex justify-center items-center my-5 mx-auto">
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
      <div className="mt-2.5 mb-2.5 ml-5">
        <Text as="p" className="font-medium">
          2. 填寫Google Form
        </Text>
      </div>
    </div>
    <div className="mt-10 mb-5">
      {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSdE9URRYAEJj1I8b-RJ6EG4PZ_5ggm_mcGq7Jis1LFxpjXvrw/viewform?embedded=true"
        width="100%"
        height="3600"
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
      >
        載入中 . . .
      </iframe>
    </div>
  </div>
);

export default LearningResource;
