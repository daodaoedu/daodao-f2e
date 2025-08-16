import { Title, Text } from '@/components/ui/typography';

export default function Price() {
  return (
    <div className="w-full max-w-full">
      <Text className="mb-9 text-base font-normal leading-[140%] text-[#536166]">
        申請無需費用，入選後才需繳交！
        <br />
        完賽可退全額，完賽標準請見退費標準！
      </Text>
      <div className="mb-4 flex flex-row items-center justify-start text-[#516166]">
        <span className="mr-2 text-lg font-medium leading-[140%]">原價</span>
        <div className="relative flex items-center">
          <span className="mr-2 text-[19px] font-normal leading-[140%]">NT$</span>
          <span className="text-[26px] font-bold leading-[140%]">32,000</span>
          <div className="absolute left-1/2 top-1/2 h-0.5 w-[110%] -translate-x-1/2 transform bg-[#516166]" />
        </div>
      </div>
      <div className="mb-3 grid max-w-full grid-cols-2 gap-0 gap-x-6 max-md:gap-x-2">
        <div className="flex h-full w-full flex-col items-start justify-between rounded-xl bg-[#F3F3F3] p-6 max-md:rounded-[10px] max-md:p-5">
          <div className="mb-5 flex flex-row items-center justify-start text-xl font-bold leading-[140%] text-[#536166] max-md:mb-3 max-md:flex-col max-md:items-start max-md:text-base">
            <span>優惠價</span>
          </div>
          <div className="mt-auto flex flex-row items-end justify-start">
            <p className="mr-2 flex items-end text-xl font-normal leading-[140%] text-[#536166] max-md:text-[15px]">NT$</p>
            <Text className="flex items-end text-[45px] font-medium leading-[100%] tracking-[-0.496px] text-[#16B9B3] max-md:text-[30px]">8,000</Text>
          </div>
        </div>
        <div className="flex h-full w-full flex-col items-start justify-between rounded-xl bg-[#F3F3F3] p-6 max-md:rounded-[10px] max-md:p-5">
          <div className="mb-5 flex flex-row items-center justify-start text-xl font-bold leading-[140%] text-[#536166] max-md:mb-3 max-md:flex-col max-md:items-start max-md:text-base">
            <span>早鳥價</span>
            <span className="ml-2 text-base font-normal max-md:m-0 max-md:text-xs">12/31 23:59 前申請</span>
          </div>
          <div className="mt-auto flex flex-row items-end justify-start">
            <p className="mr-2 flex items-end text-xl font-normal leading-[140%] text-[#536166] max-md:text-[15px]">NT$</p>
            <Text className="flex items-end text-[45px] font-medium leading-[100%] tracking-[-0.496px] text-[#FFA10B] max-md:text-[30px]">6,000</Text>
          </div>
        </div>
      </div>
      <div className="mb-9 rounded-xl border border-[#89DAD7] p-6 max-md:rounded-[10px] max-md:p-5">
        <div className="group flex flex-row items-center justify-start border-b border-[#DBDBDB]">
          <div className="w-1/2 flex-grow px-6 py-3 max-md:w-auto max-md:flex-shrink-0 max-md:p-2">
            <p className="text-xl font-bold leading-[140%] text-[#536166] max-md:text-base">2人團報價</p>
          </div>
          <div className="flex flex-shrink-0 flex-row items-center justify-between px-6 py-2 max-md:flex-col max-md:items-start max-md:px-5 max-md:py-1">
            <div className="flex flex-row items-center justify-start">
              <p className="mr-1 text-[19px] font-normal leading-[140%] text-[#536166] max-md:text-[15px]">NT$</p>
              <p className="text-[26px] font-bold leading-[140%] text-[#536166] max-md:text-xl">10,000</p>
            </div>
            <div className="flex flex-row items-center justify-start">
              <p className="mr-1 text-[19px] font-normal leading-[140%] text-[#536166] max-md:text-[15px]">/ 一人NT$ </p>
              <p className="text-[31px] font-medium leading-[150%] tracking-[-0.34px] text-[#FFA10B] max-md:text-2xl">5,000</p>
            </div>
          </div>
        </div>
        <div className="group flex flex-row items-center justify-start border-b border-[#DBDBDB]">
          <div className="w-1/2 flex-grow px-6 py-3 max-md:w-auto max-md:flex-shrink-0 max-md:p-2">
            <p className="text-xl font-bold leading-[140%] text-[#536166] max-md:text-base">3人團報價</p>
          </div>
          <div className="flex flex-shrink-0 flex-row items-center justify-between px-6 py-2 max-md:flex-col max-md:items-start max-md:px-5 max-md:py-1">
            <div className="flex flex-row items-center justify-start">
              <p className="mr-1 text-[19px] font-normal leading-[140%] text-[#536166] max-md:text-[15px]">NT$</p>
              <p className="text-[26px] font-bold leading-[140%] text-[#536166] max-md:text-xl">12,000</p>
            </div>
            <div className="flex flex-row items-center justify-start">
              <p className="mr-1 text-[19px] font-normal leading-[140%] text-[#536166] max-md:text-[15px]">/ 一人NT$ </p>
              <p className="text-[31px] font-medium leading-[150%] tracking-[-0.34px] text-[#FFA10B] max-md:text-2xl">4,000</p>
            </div>
          </div>
        </div>
        <div className="group flex flex-row items-center justify-start">
          <div className="w-1/2 flex-grow px-6 py-3 max-md:w-auto max-md:flex-shrink-0 max-md:p-2">
            <p className="text-xl font-bold leading-[140%] text-[#536166] max-md:text-base">4人團報價</p>
          </div>
          <div className="flex flex-shrink-0 flex-row items-center justify-between px-6 py-2 max-md:flex-col max-md:items-start max-md:px-5 max-md:py-1">
            <div className="flex flex-row items-center justify-start">
              <p className="mr-1 text-[19px] font-normal leading-[140%] text-[#536166] max-md:text-[15px]">NT$</p>
              <p className="text-[26px] font-bold leading-[140%] text-[#536166] max-md:text-xl">12,000</p>
            </div>
            <div className="flex flex-row items-center justify-start">
              <p className="mr-1 text-[19px] font-normal leading-[140%] text-[#536166] max-md:text-[15px]">/ 一人NT$ </p>
              <p className="text-[31px] font-medium leading-[150%] tracking-[-0.34px] text-[#FFA10B] max-md:text-2xl">3,000</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-9">
        <ul className="list-disc pl-6">
          <li className="text-left text-base font-normal leading-[140%] text-[#536166]">活動費用於入選公告後再繳費即可，主辦單位將會寄發繳費通知到入選者信箱</li>
          <li className="text-left text-base font-normal leading-[140%] text-[#536166]">若完成指定的條件，會退回活動費用</li>
          <li className="text-left text-base font-normal leading-[140%] text-[#536166]">島島阿學提供三名中低收入戶學習者免活動費用的參與機會，申請時須提供證明</li>
          <li className="text-left text-base font-normal leading-[140%] text-[#536166]">申請期間有不定期的折價優惠活動，至高可折 500 元，歡迎追蹤島島阿學 Instagram 與 FB 粉絲專頁。</li>
        </ul>
      </div>
      <Title
        as="h2"
        className="mb-9 text-[22px] font-bold leading-[140%] text-[#293A3D]"
      >
        退費標準
      </Title>
      <div>
        需符合以下四項要求
        <ol className="list-decimal pl-6">
          <li className="text-left text-base font-normal leading-[140%] text-[#536166]">
            工作坊、學習小組會議、團體諮詢及 1對1 諮詢，加總不得請假超過5小時。
          </li>
          <li className="text-left text-base font-normal leading-[140%] text-[#536166]">
            提交所有每兩週的進度報告。
          </li>
          <li className="text-left text-base font-normal leading-[140%] text-[#536166]">
            參與7/12成果發表日。
          </li>
          <li className="text-left text-base font-normal leading-[140%] text-[#536166]">
            於 2025/7/10 前完成以下資料
            <ul className="list-disc pl-6">
              <li className="text-left text-base font-normal leading-[140%] text-[#536166]">
                完成並上傳所有成果發表資料。
              </li>
              <li className="text-left text-base font-normal leading-[140%] text-[#536166]">
                分享至少三個於計劃期間使用的學習資源，並分享使用心得。
              </li>
              <li className="text-left text-base font-normal leading-[140%] text-[#536166]">
                完成學習馬拉松回饋問卷。
              </li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}
