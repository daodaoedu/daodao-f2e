import { useState } from "react";

const REFLECTION_QUESTIONS = [
  "今天做了什麼讓你有點小得意的事？",
  "有什麼事讓你「原來如此！」？",
  "今天最順手的一件事是？",
  "有沒有什麼事讓你忍不住想跟人說？",
  "今天卡在哪裡，後來怎麼過的？",
  "有什麼事做完之後感覺還不錯？",
  "今天學到最有趣的一件事是？",
  "有沒有讓你想繼續探索的東西？",
  "今天有沒有讓你小小驚訝的瞬間？",
  "最想記住今天的哪個片刻？",
  "你今天做了什麼「過去的你」做不到的事？",
  "今天有什麼事想明天繼續？",
  "有沒有什麼比想像中簡單的事？",
  "今天的練習，你給自己打幾分？為什麼？",
  "如果今天是一個表情符號，你會選哪個？",
  "今天有沒有什麼事讓你笑了？",
  "有什麼事做到一半，還想繼續做？",
  "今天的你和昨天的你，有什麼不一樣？",
  "有沒有什麼事，做了之後覺得「還好有做」？",
  "今天有沒有碰到讓你印象深刻的人或事？",
  "有什麼事做起來比你預期的還好玩？",
  "今天你最專注的時刻是？",
  "如果要把今天濃縮成一個畫面，是哪個？",
  "有什麼小事讓你覺得今天沒白費？",
  "今天的練習，有沒有讓你想起什麼以前的事？",
];

function pickRandom(excludeIndex: number): number {
  const candidates = REFLECTION_QUESTIONS.map((_, i) => i).filter((i) => i !== excludeIndex);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? 0;
}

export const useReflectionQuestion = () => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * REFLECTION_QUESTIONS.length));

  const nextQuestion = () => {
    setIndex((current) => pickRandom(current));
  };

  return {
    question: REFLECTION_QUESTIONS[index] ?? REFLECTION_QUESTIONS[0] ?? "",
    nextQuestion,
  };
};
