"use client";

import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

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

// FAQ IDs (no CJK)
const faqIds = {
  groupParticipation: "group-participation",
  groupSelection: "group-selection",
  recordingPolicy: "recording-policy",
  resultVisibility: "result-visibility",
  onlineActivities: "online-activities",
  completionCertificate: "completion-certificate",
  refundPolicy: "refund-policy",
  multipleProjects: "multiple-projects",
  applicationProcess: "application-process",
  groupDiscount: "group-discount",
  completionDefinition: "completion-definition",
  groupApplicationHelp: "group-application-help",
  discountOpportunities: "discount-opportunities",
} as const;

/**
 * 可折疊的手風琴元件
 */
function Accordion({ id, title, children, initialOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleAccordion();
    }
  };

  useLayoutEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  });

  const accordionId = `accordion-${id}`;
  const contentId = `accordion-content-${id}`;

  return (
    <div className="overflow-hidden rounded border-b border-[#DEF5F5]">
      <button
        type="button"
        className={cn(
          "flex w-full cursor-pointer items-center justify-start border border-[#DEF5F5] bg-[#DEF5F5] p-3 text-left",
          isOpen && "border-b-0"
        )}
        onClick={toggleAccordion}
        onKeyDown={handleKeyDown}
        id={accordionId}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <ChevronRight
          className={cn(
            "text-[#293A3D] transition-transform duration-300 ease-in-out",
            isOpen && "rotate-90"
          )}
          aria-hidden="true"
        />
        <p className="ml-3 text-base font-medium leading-[140%] text-[#293A3D]">{title}</p>
      </button>

      <section
        id={contentId}
        className="h-auto max-h-0 overflow-hidden bg-white transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${height}px` : "0px",
        }}
        ref={contentRef}
        aria-labelledby={accordionId}
      >
        <div className="p-4 text-sm font-normal leading-[140%] text-[#536166]">{children}</div>
      </section>
    </div>
  );
}

/**
 * 常見問題元件
 */
export const FAQ = () => {
  const t = useTranslations("learning_marathon");

  const faqItems: FaqItem[] = [
    {
      id: faqIds.groupParticipation,
      question: t("faq_group_participation_q"),
      answer: <p>{t("faq_group_participation_a")}</p>,
    },
    {
      id: faqIds.groupSelection,
      question: t("faq_group_selection_q"),
      answer: <p>{t("faq_group_selection_a")}</p>,
    },
    {
      id: faqIds.recordingPolicy,
      question: t("faq_recording_policy_q"),
      answer: <p>{t("faq_recording_policy_a")}</p>,
    },
    {
      id: faqIds.resultVisibility,
      question: t("faq_result_visibility_q"),
      answer: <p>{t("faq_result_visibility_a")}</p>,
    },
    {
      id: faqIds.onlineActivities,
      question: t("faq_online_activities_q"),
      answer: <p>{t("faq_online_activities_a")}</p>,
    },
    {
      id: faqIds.completionCertificate,
      question: t("faq_completion_certificate_q"),
      answer: <p>{t("faq_completion_certificate_a")}</p>,
    },
    {
      id: faqIds.refundPolicy,
      question: t("faq_refund_policy_q"),
      answer: <p>{t("faq_refund_policy_a")}</p>,
    },
    {
      id: faqIds.multipleProjects,
      question: t("faq_multiple_projects_q"),
      answer: <p>{t("faq_multiple_projects_a")}</p>,
    },
    {
      id: faqIds.applicationProcess,
      question: t("faq_application_process_q"),
      answer: <p>{t("faq_application_process_a")}</p>,
    },
    {
      id: faqIds.groupDiscount,
      question: t("faq_group_discount_q"),
      answer: <p>{t("faq_group_discount_a")}</p>,
    },
    {
      id: faqIds.completionDefinition,
      question: t("faq_completion_definition_q"),
      answer: (
        <div>
          <p className="mb-3">{t("faq_completion_definition_intro")}</p>
          <div>
            <p>{t("faq_completion_definition_requirements_intro")}</p>
            <ol className="list-decimal pl-6">
              <li>{t("faq_completion_req_1")}</li>
              <li>{t("faq_completion_req_2")}</li>
              <li>{t("faq_completion_req_3")}</li>
              <li>
                {t("faq_completion_req_4")}
                <ul className="list-disc pl-6">
                  <li>{t("faq_completion_req_4a")}</li>
                  <li>{t("faq_completion_req_4b")}</li>
                  <li>{t("faq_completion_req_4c")}</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: faqIds.groupApplicationHelp,
      question: t("faq_group_application_help_q"),
      answer: (
        <div>
          {t("faq_group_application_help_a")}
          <CustomLink
            href="https://forms.gle/BZ24JnTxid4y7CCV6"
            className={cn(
              "block rounded-lg p-2.5 text-sm font-normal text-basic-400 transition-colors duration-300"
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("faq_group_application_aria")}
          >
            https://forms.gle/BZ24JnTxid4y7CCV6
          </CustomLink>
        </div>
      ),
    },
    {
      id: faqIds.discountOpportunities,
      question: t("faq_discount_opportunities_q"),
      answer: (
        <div>
          {t("faq_discount_opportunities_a")}
          <CustomLink
            href="https://forms.gle/9Pfa9Q5d27m1JEpUA"
            className={cn(
              "block rounded-lg p-2.5 text-sm font-normal text-basic-400 transition-colors duration-300"
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("faq_discount_coupon_aria")}
          >
            https://forms.gle/9Pfa9Q5d27m1JEpUA
            <span>{t("faq_discount_coupon_note")}</span>
          </CustomLink>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-full border border-[#DEF5F5] max-md:grid-cols-1">
      {faqItems.map(({ id, question, answer }) => (
        <Accordion key={id} id={id} title={question}>
          {answer}
        </Accordion>
      ))}
    </div>
  );
};
