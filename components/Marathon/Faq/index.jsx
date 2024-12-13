import { useState, useEffect, useRef } from 'react';
import styled from "@emotion/styled";
import {
  Box,
} from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const StyledGroup = styled(Box)`
  width: 100%;
  max-width: 100%;

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
      <Accordion title="我自己有一個學習小組，小組裡面的人也一定要參加嗎？">
        我們歡迎你邀請朋友一起申請，但如果只有你自己的話也沒問題！
      </Accordion>
      <Accordion title="如果我跟朋友一起入選，我們可以在一組嗎？">這是內容 2</Accordion>
    </StyledGroup>
  );
}
