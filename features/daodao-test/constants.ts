import question1Jpg from "@/public/assets/daodao-test/q1.jpg";
import question2Jpg from "@/public/assets/daodao-test/q2.jpg";
import question3Jpg from "@/public/assets/daodao-test/q3.jpg";
import question4Jpg from "@/public/assets/daodao-test/q4.jpg";
import question5Jpg from "@/public/assets/daodao-test/q5.jpg";
import question6Jpg from "@/public/assets/daodao-test/q6.jpg";
import question7Jpg from "@/public/assets/daodao-test/q7.jpg";
import question8Jpg from "@/public/assets/daodao-test/q8.jpg";
import question9Jpg from "@/public/assets/daodao-test/q9.jpg";
import question10Jpg from "@/public/assets/daodao-test/q10.jpg";

const answerValueSet = new Set(["L", "C", "A", "D", "O"] as const);

type SetValue<T extends Set<unknown>> = T extends Set<infer U> ? U : never;

export type AnswerValue = SetValue<typeof answerValueSet>;

export type AnswerType = {
  value: AnswerValue;
  title: string;
};

export type QuestionType = {
  id: string;
  title: string;
  backgroundColor: `#${string}`;
  imageSrc: string;
  answers: [AnswerType, AnswerType, AnswerType, AnswerType, AnswerType];
};

const generateItem = <T extends { id: string }>(question: T) =>
  [question.id, question] as const;

export const questionMap = new Map<string, QuestionType>([
  // 初始反應 - 測量基本認知風格
  generateItem({
    id: "q1",
    title: "睜開眼，你躺在陌生的沙灘上，下一步你會做什麼？",
    backgroundColor: "#EAD8C2",
    imageSrc: question1Jpg.src,
    answers: [
      { value: "L", title: "撿起漂流物，改造一下看看能做什麼" },
      { value: "C", title: "尋找其他人，了解情況" },
      { value: "A", title: "搭個帳篷，立刻展開生存行動" },
      { value: "D", title: "研究地形，想想這島怎麼形成的" },
      { value: "O", title: "畫出行動地圖，規劃接下來的每一步" },
    ],
  }),
  // 面對未知 - 測量探索與分析能力
  generateItem({
    id: "q2",
    title: "第一夜，叢林傳來奇怪的聲響，你會？",
    backgroundColor: "#519754",
    imageSrc: question2Jpg.src,
    answers: [
      { value: "O", title: "列出可能來源，畫表分析對應方法" },
      { value: "L", title: "把聲音當作靈感，寫首詩或畫張圖" },
      { value: "D", title: "記錄聲音特徵，推理是什麼發出的" },
      { value: "A", title: "想辦法利用聲音回應怪聲，觀察其反應" },
      { value: "C", title: "問問島民，有沒有聽過這聲音" },
    ],
  }),
  // 社交互動 - 重點測量社交風格
  generateItem({
    id: "q3",
    title: "在叢林中你遇到一群島民，他們圍觀你，你會？",
    backgroundColor: "#18B8A7",
    imageSrc: question3Jpg.src,
    answers: [
      { value: "O", title: "用圖表記錄他們的言行舉止，理出一套規律" },
      { value: "A", title: "立刻問：你們這裡有什麼需要幫忙的？" },
      { value: "C", title: "主動微笑打招呼，並同步觀察島民反應" },
      { value: "D", title: "觀察島民語言與表情，思考背後的原因" },
      { value: "L", title: "設計一個結合你文化與他們的遊戲" },
    ],
  }),
  // 挑戰應對 - 測量學習策略偏好
  generateItem({
    id: "q4",
    title: "島民熱情地邀請你參加島上舉辦的年度挑戰賽，你會？",
    backgroundColor: "#7CC8FE",
    imageSrc: question4Jpg.src,
    answers: [
      { value: "C", title: "找參加過的人聊聊，有沒有什麼建議" },
      { value: "O", title: "拆解流程，一步步擬定應戰策略" },
      { value: "L", title: "發現挑戰相互關聯，決心打造通關邏輯系統" },
      { value: "D", title: "先查閱歷史紀錄與過往參賽者的心得" },
      { value: "A", title: "直接報名參加，邊玩邊解決問題" },
    ],
  }),
  // 跨文化溝通 - 測量創意與合作能力
  generateItem({
    id: "q5",
    title: "過了一個月，其他島的人到訪，彼此語言不同，你會？",
    backgroundColor: "#3E8FED",
    imageSrc: question5Jpg.src,
    answers: [
      { value: "L", title: "創造一種圖文聲音結合的交流法" },
      { value: "D", title: "分析他們的語音與動作，並推敲該島背景" },
      { value: "A", title: "設計一份超簡單雙語學習卡，快速教大家" },
      { value: "O", title: "建立詞彙對照表，把語句依功能分類成表格" },
      { value: "C", title: "拉島民們一起幫忙交流" },
    ],
  }),
  // 危機領導 - 重點測量行動力與系統思維
  generateItem({
    id: "q6",
    title: "外交難題結束，暴風雨突然來襲，你想帶大家避難，你會怎麼做？",
    backgroundColor: "#E1FAFF",
    imageSrc: question6Jpg.src,
    answers: [
      { value: "A", title: "馬上帶人行動，不多想，先保命！" },
      { value: "D", title: "研判風勢與地形，找出安全地點" },
      { value: "C", title: "召集大家集思廣益，統一行動方向" },
      { value: "L", title: "設計一種用簡單材料快速搭建的避難屋" },
      { value: "O", title: "畫出撤退路線圖與分組安排表" },
    ],
  }),
  // 價值選擇 - 測量深層偏好
  generateItem({
    id: "q7",
    title: "島民為了感謝你帶大家避難，讓你挑一樣東西當作禮物，你會選？",
    backgroundColor: "#93D7FF",
    imageSrc: question7Jpg.src,
    answers: [
      { value: "O", title: "一套用來規劃任務與整理資料的工具箱" },
      { value: "A", title: "一份你可以立刻帶人實行的超強行動藍圖" },
      { value: "D", title: "一本記錄這座島一切知識的手抄本" },
      { value: "C", title: "一張可以看懂島民關係的社群圖" },
      { value: "L", title: "一組可以任意變化的萬用法寶" },
    ],
  }),
  // 未來規劃 - 重點測量思維模式
  generateItem({
    id: "q8",
    title: "島民對你越來越依賴，甚至請你想像未來，你會？",
    backgroundColor: "#519754",
    imageSrc: question8Jpg.src,
    answers: [
      { value: "O", title: "畫出未來發展計畫圖與可能流程" },
      { value: "D", title: "根據過去的資料預測接下來的變化" },
      { value: "L", title: "創作一段融合神話與科技的未來故事" },
      { value: "C", title: "收集大家的想像，拼出共同願景" },
      { value: "A", title: "提案三個馬上能做的改善小任務" },
    ],
  }),
  // 探索態度 - 測量學習風格
  generateItem({
    id: "q9",
    title: "預言後，天上突然掉下一個木箱，你會？",
    backgroundColor: "#2C7EE9",
    imageSrc: question9Jpg.src,
    answers: [
      { value: "C", title: "找大家一起打開，聽聽每個人的看法" },
      { value: "L", title: "把內容重新拼裝成一個新發明" },
      { value: "D", title: "仔細研究箱子的構造與符號" },
      { value: "A", title: "直接打開並把東西拿來幫助島民" },
      { value: "O", title: "把裡面東西一樣樣分類記錄" },
    ],
  }),
  // 自我認知 - 最直接的人格測量
  generateItem({
    id: "q10",
    title:
      "你發現島民是來自各島的觀察員，你將被分到適合你的島！你覺得會是...？",
    backgroundColor: "#9FD3C0",
    imageSrc: question10Jpg.src,
    answers: [
      { value: "D", title: "一座可以靜靜鑽研、慢慢想「為什麼」的島" },
      { value: "C", title: "一座大家一起學習、交換想法的共學島" },
      { value: "O", title: "一座井然有序、生活規律的島" },
      { value: "L", title: "一座充滿意想不到創作、點子的島" },
      { value: "A", title: "一座可以立刻動手、邊做邊學、不怕試錯的島" },
    ],
  }),
]);

export const isAnswerValue = (value: unknown): value is AnswerValue =>
  answerValueSet.has(value as AnswerValue);

export const isQuestionId = (value: unknown): value is string =>
  questionMap.has(value as string);

export const parseResult = (value: unknown): ResultType => {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  return Object.entries(value).reduce((acc, [key, answer]) => {
    if (isQuestionId(key) && isAnswerValue(answer?.selectedAnswer)) {
      acc[key] = { selectedAnswer: answer.selectedAnswer };
    }
    return acc;
  }, {} as ResultType);
};
