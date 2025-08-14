import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import {
  Box,
} from '@mui/material';
import { ChevronRight } from 'lucide-react';

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

  .icon {
    transition: all ease .3s;
    color: #293A3D;
  }

  .open.icon {
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

const StyledList = styled(Box)`
  margin-top: 10px;
  ol {
    list-style-type: decimal;
    padding-left: 1.4em;

    li {
      color: #536166;
      font-size: 14px;
      font-weight: 400;
      line-height: 140%;
      text-align: left;
    }
  }
`;

function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
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
          <ChevronRight
            className={`${isOpen ? 'open' : ''} icon`}
          />
        </span>
        <p className="title">{title}</p>
      </StyledAccordionHeader>

      <StyledAccordionContent
        css={{
          maxHeight: isOpen ? `${height}px` : '0px',
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
        <StyledList>
          <ol>
            <li>
              不一定，參考同學習資源的形式，邀請各類型夥伴進行共學。
            </li>
          </ol>
        </StyledList>
      </Accordion>

      <Accordion
        title="揪團需要付費嗎？"
      >
        <StyledList>
          <ol>
            <li>
              不用，完全免費，任何人都能發起或加入。
            </li>
          </ol>
        </StyledList>
      </Accordion>

      <Accordion
        title="除了揪團，還有什麼內容可以參與？"
      >
        <StyledList>
          <ol>
            <li>
              你可以發表學習計畫、資源、心得、問題，或參加學習馬拉松，從不同面向參與社群。
            </li>
          </ol>
        </StyledList>
      </Accordion>
    </StyledGroup>
  );
}
