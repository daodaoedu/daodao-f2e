import { cn } from "@daodao/ui/lib/utils";

// 定義類型
type EquipmentItem = {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  features: Array<{
    id: string;
    text: string;
  }>;
};

// 裝備資料
const equipmentItems: EquipmentItem[] = [
  {
    id: "professional-mentor",
    title: "「專業陪跑員」",
    subtitle: "陪你規劃路徑與自我釐清",
    backgroundColor: "bg-[#DEF5F5]",
    features: [
      {
        id: "one-on-one",
        text: "3 次 1 小時一對一諮詢",
      },
      {
        id: "group-consultation",
        text: "2 次 1 小時團體諮詢",
      },
      {
        id: "feedback",
        text: "引導師每兩週對學員的學習進度給予回饋",
      },
    ],
  },
  {
    id: "professional-course",
    title: "「專業課程」",
    subtitle: "帶你掌握自主學習要領",
    backgroundColor: "bg-[#DEEDF5]",
    features: [
      {
        id: "strategy",
        text: "「策略」目標設定與學習策略",
      },
      {
        id: "method",
        text: "「方法」思考、提問、筆記方法",
      },
      {
        id: "people",
        text: "「人」學習社群與個人狀態釐清",
      },
      {
        id: "presentation",
        text: "「展現」成果展現與自我行銷",
      },
    ],
  },
  {
    id: "community",
    title: "「百人社群」",
    subtitle: "讓你找到合適夥伴與各界人脈",
    backgroundColor: "bg-[#DEF5E7]",
    features: [
      {
        id: "monthly-meeting",
        text: "5 次 1 小時全員每月聚會",
      },
      {
        id: "study-group",
        text: "專屬學習小組，5 次 1 小時學習小組每月聚會",
      },
      {
        id: "discord",
        text: "島島阿學Discord社群即時交流",
      },
      {
        id: "partner-finding",
        text: "島島阿學網站找夥伴找揪團功能",
      },
    ],
  },
  {
    id: "ai-tools",
    title: "「AI個人化學習工具」",
    subtitle: "引導你學習方向及自律學習",
    backgroundColor: "bg-[#DEF5F5]",
    features: [
      {
        id: "learning-template",
        text: "具引導性的自主學習模板",
      },
      {
        id: "learning-journal",
        text: "學習日誌",
      },
      {
        id: "feedback-area",
        text: "學習任務上傳與回饋區",
      },
      {
        id: "progress-tracking",
        text: "進度安排與檢核表",
      },
      {
        id: "self-checklist",
        text: "自我檢核表",
      },
      {
        id: "sharing-platform",
        text: "學習成果分享專區",
      },
      {
        id: "ai-recommendation",
        text: "AI推薦與引導",
      },
    ],
  },
];

// 裝備卡片組件
const EquipmentCard = ({ equipment }: { equipment: EquipmentItem }) => {
  return (
    <div className={cn("h-[300px] rounded-[10px] p-6", equipment.backgroundColor)}>
      <h3 className="mb-8 text-lg font-bold leading-[140%] text-[#293A3D]">
        {equipment.title}
        <br />
        {equipment.subtitle}
      </h3>
      <div className="mt-8">
        <ul className="list-disc pl-4">
          {equipment.features.map((feature) => (
            <li
              key={feature.id}
              className="text-left text-sm font-normal leading-[140%] text-[#293A3D]"
            >
              {feature.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * 學習馬拉松裝備展示組件
 */
export const Equipment = () => {
  return (
    <div className="grid w-full max-w-full grid-cols-2 grid-rows-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-none">
      {equipmentItems.map((equipment) => (
        <EquipmentCard key={equipment.id} equipment={equipment} />
      ))}
    </div>
  );
};
