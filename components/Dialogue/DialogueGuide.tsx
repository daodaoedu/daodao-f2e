import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { MdSend } from 'react-icons/md';
import { useDialogue, DialogueStyle } from './DialogueContext';

const STYLE_MAP = {
  encouraging: { label: '鼓勵型', color: 'bg-primary-palest text-primary-base border border-primary-lighter hover:bg-primary-lightest' },
  analytical: { label: '分析型', color: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' },
  challenging: { label: '挑戰型', color: 'bg-red-50 text-alert border border-red-200 hover:bg-red-100' },
  supportive: { label: '支持型', color: 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100' }
};

const DialogueGuide: React.FC = () => {
  const {
    messages,
    addMessage,
    dialogueStyle,
    changeDialogueStyle
  } = useDialogue();

  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 模擬 AI 回覆生成邏輯
  const generateAIResponse = (userMessage: string) => {
    const styleResponses = {
      encouraging: `很棒的觀點！讓我們一起深入探索 "${userMessage}"。`,
      analytical: `讓我們系統性地分析 "${userMessage}" 的各個面向。`,
      challenging: `你確定 "${userMessage}" 就是問題的核心嗎？`,
      supportive: `我理解你在 "${userMessage}" 中遇到的困難，我們可以一起找解決方案。`
    };

    return styleResponses[dialogueStyle];
  };

  // 處理用戶輸入
  const handleSubmit = (e?: React.FormEvent) => {
    // 防止重複提交
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 如果正在提交或沒有輸入則返回
    if (isSubmitting || !userInput.trim()) return;

    // 設置提交中狀態
    setIsSubmitting(true);

    const currentInput = userInput.trim();

    // 先清空輸入框，避免連續提交
    setUserInput('');

    // 添加用戶消息
    addMessage({
      content: currentInput,
      sender: 'user'
    });

    // 生成 AI 回覆
    const response = generateAIResponse(currentInput);

    // 使用 setTimeout 稍微延遲 AI 回覆，模擬真實對話
    setTimeout(() => {
      addMessage({
        content: response,
        sender: 'ai',
        style: dialogueStyle
      });

      // 重設提交狀態
      setIsSubmitting(false);
    }, 500);
  };

  // 更溫和的自動滾動實現
  useEffect(() => {
    // 只有當有新消息時才滾動
    if (messages.length > 0) {
      // 用 setTimeout 延遲滾動，避免干擾用戶體驗
      const timer = setTimeout(() => {
        // 只滾動到可見範圍，不強制置頂
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '650px' }}>
      {/* 對話風格選擇區 */}
      <div className="flex justify-center space-x-2 p-4 bg-primary-palest border-b border-primary-lightest sticky top-0 z-10">
        {Object.entries(STYLE_MAP).map(([style, { label, color }]) => (
          <button
            type="button"
            key={style}
            onClick={() => changeDialogueStyle(style as DialogueStyle)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm",
              dialogueStyle === style
                ? color
                : "bg-white text-basic-300 hover:bg-basic-100 border border-basic-200"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 對話區域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-primary-palest">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full",
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-b from-primary-lighter to-primary-base flex items-center justify-center text-white mr-2 self-end shadow-sm">
                AI
              </div>
            )}
            <div
              className={cn(
                "max-w-[70%] p-3 rounded-lg text-sm shadow-sm",
                msg.sender === 'user'
                  ? 'bg-primary-base text-white font-medium ml-auto rounded-tr-none'
                  : 'bg-white text-basic-500 border border-basic-200 rounded-tl-none'
              )}
            >
              {msg.content}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-basic-500 flex items-center justify-center text-white ml-2 self-end shadow-sm">
                <span className="text-xs">你</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-basic-200 flex items-center space-x-2 bg-white flex-shrink-0"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="在此輸入你的想法..."
          className="flex-grow p-3 bg-white rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary-base shadow-sm border border-basic-200"
        />
        <button
          type="submit"
          className="p-2 rounded-full bg-primary-base text-white hover:bg-primary-darker transition-colors shadow-sm"
        >
          <MdSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default DialogueGuide;
