import { Title, Text } from '@/components/ui/typography';

export default function Spotlight() {
  return (
    <div className="block w-full max-w-full gap-5 max-md:grid-cols-1">
      <div className="relative mb-5 rounded-[10px] bg-[#1F4645] p-6">
        <Title className="mb-8 text-lg font-bold leading-[140%] text-white">專業且客製化的陪跑方式</Title>
        <Text className="text-sm font-normal leading-[140%] text-white">不只重視成果，更重視過程與你的全人發展，並強調「Knowing知識經驗、Being個人形塑、Doing行動」三者的交織。不只這樣...</Text>
        <div className="mt-4">
          <ul className="list-disc pl-4">
            <li className="text-left text-sm font-normal leading-[140%] text-white">萃取多位自我導向學習實踐者之經驗</li>
            <li className="text-left text-sm font-normal leading-[140%] text-white">結合被譽為全球最接近民主教育的美國百年民主大學 Goddard College 教學方法（首次在台灣公開）</li>
            <li className="text-left text-sm font-normal leading-[140%] text-white">結合 High Performance Learning Journeys 學習引導法</li>
            <li className="text-left text-sm font-normal leading-[140%] text-white">AI推薦與引導</li>
          </ul>
        </div>
      </div>
      <div className="relative rounded-[10px] bg-[#16B9B3] p-6 after:absolute after:bottom-[-22px] after:right-[-70px] after:block after:h-[140px] after:w-[185px] after:bg-[url('/assets/learning-marathon/booming.png')] after:bg-cover after:bg-no-repeat after:content-[''] max-md:after:hidden">
        <Title className="mb-8 text-lg font-bold leading-[140%] text-white">AI 個人化學習工具Ｘ社群支持</Title>
        <Text className="text-sm font-normal leading-[140%] text-white">有 AI 推薦與引導外，也重視人與人真實地互動！</Text>
        <br />
        <div className="mt-4">
          <ul className="list-disc pl-4">
            <li className="text-left text-sm font-normal leading-[140%] text-white">結合 AI 給你更好的資源與人脈推薦，以及學習引導</li>
            <li className="text-left text-sm font-normal leading-[140%] text-white">跨領域、跨年齡的百人社群，讓你可以找到同儕，也可以找到業界前輩</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
