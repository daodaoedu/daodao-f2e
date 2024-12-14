import { useState, useEffect, useRef } from 'react';
import styled from "@emotion/styled";
import {
  Box,
} from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const StyledGroup = styled(Box)`
  width: 100%;
  max-width: 100%;
  border: 1px solid #DEF5F5;
  @media (max-width: 767px) {
    grid-template: 1fr / 1fr;
  }
`;

const StyledAccordionWrapper = styled.div`
  border-radius: 4px;
  overflow: hidden;
`;
const StyledAccordionHeader = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid #DEF5F5;
  background-color: #DEF5F5;

  .title {
    margin-left: 12px;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 140%;
    color: #293A3D;
  }

  .MuiSvgIcon-root {
    transition: all ease .3s;
    color: #293A3D;
  }

  .open.MuiSvgIcon-root {
    transform: rotate(90deg);
  }
`;

const StyledAccordionContent = styled.div`
  background: #fff;
  height: auto;
  max-height: 0px;
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const StyledContent = styled.div`
  padding: 16px;
  color: #536166;
  font-size: 14px;
  font-weight: 400;
  line-height: 140%; 
`;
function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);
  return (
    <StyledAccordionWrapper>
      <StyledAccordionHeader onClick={toggleAccordion}>
        <span>
          <KeyboardArrowRightIcon
            className={`${isOpen ? 'open' : ''}`}
          />
        </span>
        <p className="title">{title}</p>
      </StyledAccordionHeader>

      <StyledAccordionContent
        css={{
          maxHeight: isOpen ? `${height}px` : '0px'
        }}
        className={`${isOpen ? 'open' : ''}`}
        ref={contentRef}
      >
        <StyledContent>
          {children}
        </StyledContent>
      </StyledAccordionContent>
    </StyledAccordionWrapper>
  );
}

export default function Faq() {
  return (
    <StyledGroup>
      <Accordion
        title="我自己有一個學習小組，小組裡面的人也一定要參加嗎？"
      >
        我們歡迎你邀請朋友一起申請，但如果只有你自己的話也沒問題！
      </Accordion>
      <Accordion
        title="如果我跟朋友一起入選，我們可以在一組嗎？"
      >
        我們會根據每位入選者的背景和特質分組。
      </Accordion>
      <Accordion
        title="所有課程和活動都會有錄影嗎？"
      >
        僅有工作坊會有錄影，小組討論和Mentor 團體諮詢不會有錄影。
      </Accordion>
      <Accordion
        title="我最後的成果會有誰看到呢？"
      >
        每位入選者的最終成果會公開在島島網站上，除了本次活動入選者外，其他使用者也能了解你在這 5 個月的學習歷程。
      </Accordion>
      <Accordion
        title="所有活動都是線上嗎？"
      >
        本次計劃皆是線上進行，參與者需要有電腦和網路參與。
      </Accordion>
      <Accordion
        title="結束後會收到完成證書嗎？"
      >
        完成本計劃的參與者將收到電子版證書。
      </Accordion>
      <Accordion
        title="入選後發現不適合可以退費嗎?"
      >
        2025/2/10 課程開始前可全額退費；若於2025/2/16 23:59 前提出退費申請，並將申請寄送至主辦單位電子信箱，即會退還繳納費用總額之二分之一。2025/2/16 23:59 即不退費。
      </Accordion>
      <Accordion
        title="我可以繳交多件計畫嗎？"
      >
        在申請期間每人只能提交一件學習計畫，待公告入選者後，使用者可新增至多三個學習計劃。
      </Accordion>
    </StyledGroup>
  );
}
