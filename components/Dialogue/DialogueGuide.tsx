import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { useDialogue, DialogueStyle } from './DialogueContext';

const STYLE_MAP = {
  encouraging: { label: '鼓勵型', color: 'bg-primary-200 text-primary-base' },
  analytical: { label: '分析型', color: 'bg-blue-200 text-blue-700' },
  challenging: { label: '挑戰型', color: 'bg-red-200 text-red-700' },
  supportive: { label: '支持型', color: 'bg-green-200 text-green-700' }
};

const DialogueGuide: React.FC = () => {
  const {
    messages,
    addMessage,
    dialogueStyle,
    changeDialogueStyle
  } = useDialogue();

  const [userInput, setUserInput] = useState('');
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
    if (e) e.preventDefault();

    if (!userInput.trim()) return;

    // 添加用戶消息
    addMessage({
      content: userInput,
      sender: 'user'
    });

    // 生成 AI 回覆
    const response = generateAIResponse(userInput);

    // 添加 AI 消息
    addMessage({
      content: response,
      sender: 'ai',
      style: dialogueStyle
    });

    // 清空輸入
    setUserInput('');
  };

  // 自動滾動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-gray-200">
      {/* 對話風格選擇區 */}
      <div className="flex justify-center space-x-2 p-4 border-b">
        {Object.entries(STYLE_MAP).map(([style, { label, color }]) => (
          <button
            type="button"
            key={style}
            onClick={() => changeDialogueStyle(style as DialogueStyle)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              dialogueStyle === style
                ? color
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 對話區域 */}
      <div className="h-[600px] overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full",
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[70%] p-3 rounded-lg text-sm",
                msg.sender === 'user'
                  ? 'bg-primary-100 text-primary-base'
                  : 'bg-gray-100 text-gray-700'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex items-center space-x-2"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="在此輸入你的想法..."
          className="flex-grow p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
        />
        <IconButton
          type="submit"
          color="primary"
          size="small"
        >
          <SendIcon />
        </IconButton>
      </form>
    </div>
  );
};

export default DialogueGuide;
