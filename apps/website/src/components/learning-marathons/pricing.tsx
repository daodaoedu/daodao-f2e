"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import type { ReactNode } from "react";

// 定義類型
type PriceOption = {
  label: string;
  subLabel?: string;
  price: number;
  color: string;
};

type GroupPriceOption = {
  people: number;
  totalPrice: number;
  pricePerPerson: number;
};

type SubItem = {
  id: string;
  text: string;
};

type RefundRequirement = {
  text: string;
  subItems?: SubItem[];
};

// 定義類型擴展
type PriceOptionWithId = PriceOption & { id: string };
type GroupPriceOptionWithId = GroupPriceOption & { id: string };
type PriceNoteWithId = { id: string; text: string };
type RefundRequirementWithId = RefundRequirement & { id: string };

// 靜態數字資料（無中文）
const groupPriceData = [
  { id: "group-2", people: 2, totalPrice: 10000, pricePerPerson: 5000 },
  { id: "group-3", people: 3, totalPrice: 12000, pricePerPerson: 4000 },
  { id: "group-4", people: 4, totalPrice: 12000, pricePerPerson: 3000 },
];

// 組件定義
const PriceCard = ({ option }: { option: PriceOptionWithId }) => (
  <div className="flex size-full flex-col items-start justify-between rounded-xl bg-[#F3F3F3] p-6 max-md:rounded-[10px] max-md:p-5">
    <div className="mb-5 flex flex-row items-center justify-start text-xl font-bold leading-[140%] text-[#536166] max-md:mb-3 max-md:flex-col max-md:items-start max-md:text-base">
      <span>{option.label}</span>
      {option.subLabel && (
        <span className="ml-2 text-base font-normal max-md:m-0 max-md:text-xs">
          {option.subLabel}
        </span>
      )}
    </div>
    <div className="mt-auto flex flex-row items-end justify-start">
      <p className="mr-2 flex items-end text-xl font-normal leading-[140%] text-[#536166] max-md:text-[15px]">
        NT$
      </p>
      <p
        className={cn(
          "flex items-end text-[45px] font-medium leading-[100%] tracking-[-0.496px] max-md:text-[30px]",
          option.color
        )}
      >
        {option.price.toLocaleString()}
      </p>
    </div>
  </div>
);

const GroupPriceRow = ({ option, groupPriceUnit, perPersonPrefix }: { option: GroupPriceOptionWithId; groupPriceUnit: string; perPersonPrefix: string }) => (
  <div className="group flex flex-row items-center justify-start border-b border-[#DBDBDB] last:border-b-0">
    <div className="w-1/2 grow px-6 py-3 max-md:w-auto max-md:shrink-0 max-md:p-2">
      <p className="text-xl font-bold leading-[140%] text-[#536166] max-md:text-base">
        {option.people}{groupPriceUnit}
      </p>
    </div>
    <div className="flex shrink-0 flex-row items-center justify-between px-6 py-2 max-md:flex-col max-md:items-start max-md:px-5 max-md:py-1">
      <div className="flex flex-row items-center justify-start">
        <p className="mr-1 text-[19px] font-normal leading-[140%] text-[#536166] max-md:text-[15px]">
          NT$
        </p>
        <p className="text-[26px] font-bold leading-[140%] text-[#536166] max-md:text-xl">
          {option.totalPrice.toLocaleString()}
        </p>
      </div>
      <div className="flex flex-row items-center justify-start">
        <p className="mr-1 text-[19px] font-normal leading-[140%] text-[#536166] max-md:text-[15px]">
          {perPersonPrefix}
        </p>
        <p className="text-[31px] font-medium leading-[150%] tracking-[-0.34px] text-[#FFA10B] max-md:text-2xl">
          {option.pricePerPerson.toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

const ListItem = ({ children }: { children: ReactNode }) => (
  <li className="text-left text-base font-normal leading-[140%] text-[#536166]">{children}</li>
);

const Section = ({ title, children }: { title?: string; children: ReactNode }) => (
  <div className="mb-9">
    {title && <h2 className="mb-9 text-[22px] font-bold leading-[140%] text-[#293A3D]">{title}</h2>}
    {children}
  </div>
);

/**
 * 學習馬拉松價格資訊組件
 */
export const Pricing = () => {
  const t = useTranslations("learning_marathon");

  const priceOptions: PriceOptionWithId[] = [
    { id: "regular-price", label: t("pricing_regular_label"), price: 8000, color: "text-[#16B9B3]" },
    { id: "early-bird", label: t("pricing_early_bird_label"), subLabel: t("pricing_early_bird_sublabel"), price: 6000, color: "text-[#FFA10B]" },
  ];

  const priceNotes: PriceNoteWithId[] = [
    { id: "note-payment", text: t("pricing_note_payment") },
    { id: "note-refund", text: t("pricing_note_refund") },
    { id: "note-low-income", text: t("pricing_note_low_income") },
    { id: "note-discount", text: t("pricing_note_discount") },
  ];

  const refundRequirements: RefundRequirementWithId[] = [
    { id: "req-attendance", text: t("pricing_refund_req_attendance") },
    { id: "req-reports", text: t("pricing_refund_req_reports") },
    { id: "req-presentation", text: t("pricing_refund_req_presentation") },
    {
      id: "req-materials",
      text: t("pricing_refund_req_materials"),
      subItems: [
        { id: "sub-materials", text: t("pricing_refund_sub_materials") },
        { id: "sub-resources", text: t("pricing_refund_sub_resources") },
        { id: "sub-survey", text: t("pricing_refund_sub_survey") },
      ],
    },
  ];

  return (
    <div className="w-full max-w-full">
      <p className="mb-9 text-base font-normal leading-[140%] text-[#536166]">
        {t("pricing_intro")}
      </p>

      {/* 原價顯示 */}
      <div className="mb-4 flex flex-row items-center justify-start text-[#516166]">
        <span className="mr-2 text-lg font-medium leading-[140%]">{t("pricing_original_label")}</span>
        <div className="relative flex items-center">
          <span className="mr-2 text-[19px] font-normal leading-[140%]">NT$</span>
          <span className="text-[26px] font-bold leading-[140%]">32,000</span>
          <div className="absolute left-1/2 top-1/2 h-0.5 w-[110%] -translate-x-1/2 bg-[#516166]" />
        </div>
      </div>

      {/* 價格選項卡片 */}
      <div className="mb-3 grid max-w-full grid-cols-2 gap-0 gap-x-6 max-md:gap-x-2">
        {priceOptions.map((option) => (
          <PriceCard key={option.id} option={option} />
        ))}
      </div>

      {/* 團報價格表 */}
      <div className="mb-9 rounded-xl border border-[#89DAD7] p-6 max-md:rounded-[10px] max-md:p-5">
        {groupPriceData.map((option) => (
          <GroupPriceRow
            key={option.id}
            option={option}
            groupPriceUnit={t("pricing_group_price_unit")}
            perPersonPrefix={t("pricing_per_person_prefix")}
          />
        ))}
      </div>

      {/* 價格說明 */}
      <Section>
        <ul className="list-disc pl-6">
          {priceNotes.map((note) => (
            <ListItem key={note.id}>{note.text}</ListItem>
          ))}
        </ul>
      </Section>

      {/* 退費標準 */}
      <Section title={t("pricing_refund_section_title")}>
        <div>
          {t("pricing_refund_requirements_intro")}
          <ol className="list-decimal pl-6">
            {refundRequirements.map((requirement) => (
              <ListItem key={requirement.id}>
                {requirement.text}
                {requirement.subItems && (
                  <ul className="list-disc pl-6">
                    {requirement.subItems.map((subItem) => (
                      <ListItem key={subItem.id}>{subItem.text}</ListItem>
                    ))}
                  </ul>
                )}
              </ListItem>
            ))}
          </ol>
        </div>
      </Section>
    </div>
  );
};
