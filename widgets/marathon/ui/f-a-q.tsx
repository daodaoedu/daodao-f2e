'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { CustomLink } from '@/shared/ui/custom-link';
import { cn } from '@/utils/cn';

// 定義類型
type FaqItem = {
  id: string;
  question: string;
  answer: React.ReactNode;
};

type AccordionProps = React.PropsWithChildren<{
  id: string;
  title: string;
  initialOpen?: boolean;
}>;

// FAQ 資料
const faqItems: FaqItem[] = [
  {
    id: 'group-participation',
    question: '我自己有一個學習小組，小組裡面的人也一定要參加嗎？',
    answer: (
      <p>
        我們歡迎你邀請朋友一起申請，多人申請會有團報優惠價，但如果只有你自己的話也沒問題！
      </p>
    ),
  },
  {
    id: 'group-selection',
    question: '如果我跟朋友一起入選，我們可以在一組嗎？',
    answer: <p>我們會根據每位入選者的背景和特質分組。</p>,
  },
  {
    id: 'recording-policy',
    question: '所有課程和活動都會有錄影嗎？',
    answer: (
      <p>
        僅有工作坊會有錄影，學習小組會議、引導師諮詢、社群活動等不會有錄影。
      </p>
    ),
  },
  {
    id: 'result-visibility',
    question: '我最後的成果會有誰看到呢？',
    answer: (
      <p>
        每位入選者的最終成果會公開在島島網站上，除了本次活動入選者外，其他使用者也能了解你在這
        5 個月的學習歷程。
      </p>
    ),
  },
  {
    id: 'online-activities',
    question: '所有活動都是線上嗎？',
    answer: (
      <p>
        本次計劃鼓勵各地學習者參與，故多數活動為線上，但為增加實體互動，部分社群活動將以實體為主，實體地點將視入圍學員所在地調整，詳細請參考重要時程。
      </p>
    ),
  },
  {
    id: 'completion-certificate',
    question: '結束後會收到完成證書嗎？',
    answer: <p>完成本計劃的參與者將收到電子版證書。</p>,
  },
  {
    id: 'refund-policy',
    question: '入選後發現不適合可以退費嗎?',
    answer: (
      <p>
        2025/2/10 課程開始前可全額退費；若於2025/2/16 23:59
        前提出退費申請，並將申請寄送至主辦單位電子信箱，即會退還繳納費用總額之二分之一。2025/2/16
        23:59 即不退費。
      </p>
    ),
  },
  {
    id: 'multiple-projects',
    question: '我可以繳交多件計畫嗎？',
    answer: (
      <p>
        在申請期間每人只能提交一件學習計畫，待公告入選者後，使用者可新增至多三個學習計劃。
      </p>
    ),
  },
  {
    id: 'application-process',
    question: '怎麼樣才算是有申請呢？',
    answer: (
      <p>
        按下最後的提交按鈕即算申請。早鳥票只需要於12/31 23:59
        前點擊「提交」，就可以享有早鳥優惠。即使提交後，在申請截止前都可以繼續修改計畫，計畫將會自動儲存。
      </p>
    ),
  },
  {
    id: 'group-discount',
    question: '如果申請時一起團報的朋友沒有入圍，還可以享有團報費用嗎？',
    answer: <p>可以唷！我們會以申請時選擇的資格為主。</p>,
  },
  {
    id: 'completion-definition',
    question: '完賽的定義是什麼呢？',
    answer: (
      <div>
        <p className="mb-3">
          完賽的定義不在於最終成果做得多好，而是過程的參與，遇到困難時如何反思並做出改變，以及最後對自己甚至社會帶來什麼改變，包含即使沒有達到預期目標也清楚原因及下一步。
        </p>
        <div>
          <p>因此我們完賽退費標準只有需符合以下要求：</p>
          <ol className="list-decimal pl-6">
            <li>
              工作坊、學習小組會議、團體諮詢及 1對1
              諮詢，加總不得請假超過5小時。
            </li>
            <li>提交所有每兩週的進度報告。</li>
            <li>參與7/12成果發表日。</li>
            <li>
              於 2025/7/10 前完成以下資料
              <ul className="list-disc pl-6">
                <li>完成並上傳所有成果發表資料。</li>
                <li>分享至少三個於計劃期間使用的學習資源，並分享使用心得。</li>
                <li>完成學習馬拉松回饋問卷。</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'group-application-help',
    question: '我想團報但找不到人？',
    answer: (
      <div>
        歡迎填寫團報表單，我們將協助促成！
        <CustomLink
          href="https://forms.gle/BZ24JnTxid4y7CCV6"
          className={cn(
            'block rounded-lg p-2.5 text-sm font-normal text-basic-400 transition-colors duration-300'
          )}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="填寫團報表單"
        >
          https://forms.gle/BZ24JnTxid4y7CCV6
        </CustomLink>
      </div>
    ),
  },
  {
    id: 'discount-opportunities',
    question: '有哪些機會可以獲得課程費用優惠折抵呢？',
    answer: (
      <div>
        前五名提交申請、參加說明會、轉分享貼文等方式都可獲得優惠，優惠活動請參考折價券申請表單：
        <CustomLink
          href="https://forms.gle/9Pfa9Q5d27m1JEpUA"
          className={cn(
            'block rounded-lg p-2.5 text-sm font-normal text-basic-400 transition-colors duration-300'
          )}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="折價券申請表單"
        >
          https://forms.gle/9Pfa9Q5d27m1JEpUA
          <span>
            （折抵金額無上限，但計畫一、計畫二皆只能各折抵一次，例如同時在
            IG、FB分享，只能折抵一次。參加兩場說明會，只能折抵一次。）
          </span>
        </CustomLink>
      </div>
    ),
  },
];

/**
 * 可折疊的手風琴元件
 */
function Accordion({
  id,
  title,
  children,
  initialOpen = false,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAccordion();
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  const accordionId = `accordion-${id}`;
  const contentId = `accordion-content-${id}`;

  return (
    <div className="overflow-hidden rounded border-b border-[#DEF5F5]">
      <div
        className={cn(
          'flex cursor-pointer items-center justify-start border border-[#DEF5F5] bg-[#DEF5F5] p-3',
          isOpen && 'border-b-0'
        )}
        onClick={toggleAccordion}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        id={accordionId}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <ChevronRight
          className={cn(
            'text-[#293A3D] transition-transform duration-300 ease-in-out',
            isOpen && 'rotate-90'
          )}
          aria-hidden="true"
        />
        <p className="ml-3 text-base font-medium leading-[140%] text-[#293A3D]">
          {title}
        </p>
      </div>

      <div
        id={contentId}
        className="h-auto max-h-0 overflow-hidden bg-white transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${height}px` : '0px',
        }}
        ref={contentRef}
        aria-labelledby={accordionId}
        role="region"
      >
        <div className="p-4 text-sm font-normal leading-[140%] text-[#536166]">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * 常見問題元件
 */
export const FAQ = () => {
  return (
    <div className="w-full max-w-full border border-[#DEF5F5] max-md:grid-cols-1">
      {faqItems.map(({ id, question, answer }) => (
        <Accordion key={id} id={id} title={question}>
          {answer}
        </Accordion>
      ))}
    </div>
  );
}
