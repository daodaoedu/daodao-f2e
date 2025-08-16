import { Title } from '@/components/ui/typography';

export default function Equip() {
  return (
    <div className="grid w-full max-w-full grid-cols-2 grid-rows-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-none">
      <div className="h-[300px] rounded-[10px] bg-[#DEF5F5] p-6">
        <Title className="mb-8 text-lg font-bold leading-[140%] text-[#293A3D]">
          「專業陪跑員」
          <br />
          陪你規劃路徑與自我釐清
        </Title>
        <div className="mt-8">
          <ul className="list-disc pl-4">
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">3 次 1 小時一對一諮詢</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">2 次 1 小時團體諮詢</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">引導師每兩週對學員的學習進度給予回饋</li>
          </ul>
        </div>
      </div>
      <div className="h-[300px] rounded-[10px] bg-[#DEEDF5] p-6">
        <Title className="mb-8 text-lg font-bold leading-[140%] text-[#293A3D]">
          「專業課程」
          <br />
          帶你掌握自主學習要領
        </Title>
        <div className="mt-8">
          <ul className="list-disc pl-4">
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">「策略」目標設定與學習策略</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">「方法」思考、提問、筆記方法</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">「人」學習社群與個人狀態釐清</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">「展現」成果展現與自我行銷</li>
          </ul>
        </div>
      </div>
      <div className="h-[300px] rounded-[10px] bg-[#DEF5E7] p-6">
        <Title className="mb-8 text-lg font-bold leading-[140%] text-[#293A3D]">
          「百人社群」
          <br />
          讓你找到合適夥伴與各界人脈
        </Title>
        <div className="mt-8">
          <ul className="list-disc pl-4">
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">5 次 1 小時全員每月聚會</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">專屬學習小組，5 次 1 小時學習小組每月聚會</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">島島阿學Discord社群即時交流</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">島島阿學網站找夥伴找揪團功能</li>
          </ul>
        </div>
      </div>
      <div className="h-[300px] rounded-[10px] bg-[#DEF5F5] p-6">
        <Title className="mb-8 text-lg font-bold leading-[140%] text-[#293A3D]">
          「AI個人化學習工具」
          <br />
          引導你學習方向及自律學習
        </Title>
        <div className="mt-8">
          <ul className="list-disc pl-4">
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">具引導性的自主學習模板</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">學習日誌</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">學習任務上傳與回饋區</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">進度安排與檢核表</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">自我檢核表</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">學習成果分享專區</li>
            <li className="text-left text-sm font-normal leading-[140%] text-[#293A3D]">AI推薦與引導</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
