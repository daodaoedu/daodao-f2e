# @daodao/features-quiz

Quiz 功能模組，提供完整的測驗功能。

## 結構

- `components/` - Quiz 相關組件
  - `question-card.tsx` - 問題卡片組件
  - `answer-option.tsx` - 答案選項組件
  - `progress-bar.tsx` - 進度條組件
  - `result-card.tsx` - 結果卡片組件
  - `quiz-intro.tsx` - 測驗介紹組件
  - `quiz-question.tsx` - 測驗問題組件
  - `quiz-result.tsx` - 測驗結果組件
- `hooks/` - Quiz 相關 hooks
  - `use-quiz.tsx` - Quiz 主要 hook
- `types/` - Quiz 類型定義
- `utils/` - Quiz 工具函數
  - `question-map.ts` - 問題映射
  - `result-detail-map.ts` - 結果詳情映射
  - `result-detail-factory.ts` - 結果詳情工廠
  - `theme-map.ts` - 主題映射
  - `store.ts` - 儲存工具
  - `validation.ts` - 驗證工具
  - `api.ts` - API 工具
- `assets/` - Quiz 專屬資源（圖片等）

## 使用方式

```typescript
import { QuizIntro, QuizQuestion, QuizResult, useQuiz } from "@daodao/features-quiz";

function QuizPage() {
  const { currentQuestion, handleAnswer, isCompleted } = useQuiz();

  if (isCompleted) {
    return <QuizResult result={result} />;
  }

  return <QuizQuestion question={question} onAnswer={handleAnswer} />;
}
```

## 依賴

- `@daodao/api` - API 客戶端
- `@daodao/i18n` - 多語系支援
- `@daodao/shared` - 共享工具
- `@daodao/ui` - UI 組件庫

