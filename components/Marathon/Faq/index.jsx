import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAccordion();
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);
  return (
    <div className="rounded border-b border-[#DEF5F5] overflow-hidden">
      <div
        className="p-3 cursor-pointer flex justify-start items-center border border-[#DEF5F5] bg-[#DEF5F5]"
        onClick={toggleAccordion}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title}`}
      >
        <span>
          <ChevronRight
            className={`${isOpen ? 'rotate-90' : ''} transition-transform duration-300 ease-in-out text-[#293A3D]`}
          />
        </span>
        <p className="ml-3 text-base font-medium leading-[140%] text-[#293A3D]">{title}</p>
      </div>

      <div
        id={`accordion-content-${title}`}
        className={`bg-white h-auto max-h-0 overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? '' : ''}`}
        style={{
          maxHeight: isOpen ? `${height}px` : '0px',
        }}
        ref={contentRef}
      >
        <div className="p-4 text-[#536166] text-sm font-normal leading-[140%]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <div className="w-full max-w-full border border-[#DEF5F5] max-md:grid-cols-1">
      <Accordion
        title="我自己有一個學習小組，小組裡面的人也一定要參加嗎？"
      >
        <div className="mt-2">
          <ol className="list-decimal pl-6">
            <li className="text-[#536166] text-sm font-normal leading-[140%] text-left">
              不一定，參考同學習資源的形式，邀請各類型夥伴進行共學。
            </li>
          </ol>
        </div>
      </Accordion>

      <Accordion
        title="揪團需要付費嗎？"
      >
        <div className="mt-2">
          <ol className="list-decimal pl-6">
            <li className="text-[#536166] text-sm font-normal leading-[140%] text-left">
              不用，完全免費，任何人都能發起或加入。
            </li>
          </ol>
        </div>
      </Accordion>

      <Accordion
        title="除了揪團，還有什麼內容可以參與？"
      >
        <div className="mt-2">
          <ol className="list-decimal pl-6">
            <li className="text-[#536166] text-sm font-normal leading-[140%] text-left">
              你可以發表學習計畫、資源、心得、問題，或參加學習馬拉松，從不同面向參與社群。
            </li>
          </ol>
        </div>
      </Accordion>
    </div>
  );
}
