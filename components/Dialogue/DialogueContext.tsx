import React, { createContext, useState, useContext, ReactNode } from 'react';
import { cn } from '@/utils/cn';

// 對話風格類型
export type DialogueStyle = 'encouraging' | 'analytical' | 'challenging' | 'supportive';

// 對話消息介面
export interface DialogueMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  style?: DialogueStyle;
}

// 對話上下文介面
interface DialogueContextType {
  messages: DialogueMessage[];
  dialogueStyle: DialogueStyle;
  addMessage: (message: Omit<DialogueMessage, 'id' | 'timestamp'>) => void;
  changeDialogueStyle: (style: DialogueStyle) => void;
}

// 創建上下文
const DialogueContext = createContext<DialogueContextType | undefined>(undefined);

// 上下文提供者組件
export const DialogueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [dialogueStyle, setDialogueStyle] = useState<DialogueStyle>('encouraging');

  // 添加消息
  const addMessage = (message: Omit<DialogueMessage, 'id' | 'timestamp'>) => {
    const newMessage: DialogueMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // 更改對話風格
  const changeDialogueStyle = (style: DialogueStyle) => {
    setDialogueStyle(style);
  };

  return (
    <DialogueContext.Provider value={{
      messages,
      dialogueStyle,
      addMessage,
      changeDialogueStyle
    }}
    >
      {children}
    </DialogueContext.Provider>
  );
};

// 自定義 Hook 用於使用對話上下文
export const useDialogue = () => {
  const context = useContext(DialogueContext);
  if (!context) {
    throw new Error('useDialogue 必須在 DialogueProvider 內部使用');
  }
  return context;
};
