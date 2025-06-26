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

export type AnswerKey = "L" | "C" | "A" | "D" | "O";

export type AnswerType = {
  key: AnswerKey;
  value: number;
  title: string;
};

export type QuestionType = {
  id: string;
  title: string;
  backgroundColor: `#${string}`;
  imageSrc: string;
  answers: [AnswerType, AnswerType, AnswerType, AnswerType, AnswerType];
};

// 初始反應 - 測量基本認知風格
const q1: QuestionType = {
  id: "q1",
  title: "睜開眼，你躺在陌生的沙灘上，\n下一步你會做什麼？",
  backgroundColor: "#EAD8C2",
  imageSrc: question1Jpg.src,
  answers: [
    { key: "L", value: 1, title: "改造漂流物當生存的萬用工具" },
    { key: "C", value: 1, title: "尋找其他人，了解情況" },
    { key: "A", value: 1, title: "搭個帳篷，立刻展開生存行動" },
    { key: "D", value: 1, title: "研究地形，思考如何生存" },
    { key: "O", value: 1, title: "畫出行動地圖，規劃接下來的每一步" },
  ],
};

// 面對未知 - 測量探索與分析能力
const q2: QuestionType = {
  id: "q2",
  title: "第一夜，\n叢林傳來奇怪的聲響，你會？",
  backgroundColor: "#519754",
  imageSrc: question2Jpg.src,
  answers: [
    { key: "O", value: 1.2, title: "列出可能來源，畫表分析對應方法" },
    { key: "L", value: 1.2, title: "把聲音當作靈感，寫首詩或畫張圖" },
    { key: "D", value: 1.3, title: "記錄聲音特徵，推理是什麼發出" },
    { key: "A", value: 1.1, title: "想辦法利用聲音回應怪聲，觀察其反應" },
    { key: "C", value: 1.0, title: "找找附近有沒有島民可求助" },
  ],
};

// 社交互動 - 重點測量社交風格
const q3: QuestionType = {
  id: "q3",
  title: "起床後，你發現身旁有一群島民\n正在圍觀你，你會？",
  backgroundColor: "#18B8A7",
  imageSrc: question3Jpg.src,
  answers: [
    { key: "O", value: 1.1, title: "用圖表記錄他們的言行舉止，理出一套規律" },
    { key: "A", value: 1.2, title: "起身介紹自己並詢問該島資訊" },
    { key: "C", value: 1.4, title: "開始聊天並加入島民的日常生活" },
    { key: "D", value: 1.2, title: "對島民察言觀色並思考原因" },
    { key: "L", value: 1.1, title: "思考彼此差異及合作的可能性" },
  ],
};

// 挑戰應對 - 測量學習策略偏好
const q4: QuestionType = {
  id: "q4",
  title: "島民熱情地邀請你參加\n島上舉辦的年度挑戰賽，你會？",
  backgroundColor: "#7CC8FE",
  imageSrc: question4Jpg.src,
  answers: [
    { key: "C", value: 1.2, title: "找參加過的人聊聊，有沒有什麼建議" },
    { key: "O", value: 1.3, title: "拆解流程，一步步擬定應戰策略" },
    { key: "L", value: 1.3, title: "發現挑戰相互關聯，決心打造通關邏輯系統" },
    { key: "D", value: 1.1, title: "先查閱歷史紀錄與過往參賽者的心得" },
    { key: "A", value: 1.4, title: "直接報名參加，邊玩邊解決問題" },
  ],
};

// 跨文化溝通 - 測量創意與合作能力
const q5: QuestionType = {
  id: "q5",
  title: "過了一個月，其他島的人到訪，\n彼此語言不同，你會？",
  backgroundColor: "#3E8FED",
  imageSrc: question5Jpg.src,
  answers: [
    { key: "L", value: 1.4, title: "創造一種圖文聲音結合的交流法" },
    { key: "D", value: 1.2, title: "分析他們的語音與動作，並推敲該島背景" },
    { key: "A", value: 1.2, title: "設計一份超簡單雙語學習卡，快速教大家" },
    { key: "O", value: 1.2, title: "建立詞彙對照表，把語句依功能分類成表格" },
    { key: "C", value: 1.3, title: "拉島民們一起幫忙交流" },
  ],
};

// 危機領導 - 重點測量行動力與系統思維
const q6: QuestionType = {
  id: "q6",
  title: "外交難題結束，暴風雨突然來襲，\n你想帶大家避難，你會怎麼做？",
  backgroundColor: "#E1FAFF",
  imageSrc: question6Jpg.src,
  answers: [
    { key: "A", value: 1.5, title: "馬上帶人行動，不多想，先保命！" },
    { key: "D", value: 1.2, title: "研判風勢與地形，找出安全地點" },
    { key: "C", value: 1.3, title: "召集大家集思廣益，統一行動方向" },
    { key: "L", value: 1.1, title: "設計一種用簡單材料快速搭建的避難屋" },
    { key: "O", value: 1.4, title: "畫出撤退路線圖與分組安排表" },
  ],
};

// 價值選擇 - 測量深層偏好
const q7: QuestionType = {
  id: "q7",
  title: "島民為了感謝你帶大家避難，\n讓你挑一樣東西當作禮物，你會選？",
  backgroundColor: "#93D7FF",
  imageSrc: question7Jpg.src,
  answers: [
    { key: "O", value: 1.4, title: "一套用來規劃任務與整理資料的工具箱" },
    { key: "A", value: 1.2, title: "一份你可以立刻帶人實行的超強行動藍圖" },
    { key: "D", value: 1.3, title: "一本記錄這座島一切知識的手抄本" },
    { key: "C", value: 1.1, title: "一張可以看懂島民關係的社群圖" },
    { key: "L", value: 1.2, title: "一組可以任意變化的萬用法寶" },
  ],
};

// 未來規劃 - 重點測量思維模式
const q8: QuestionType = {
  id: "q8",
  title: "島民對你越來越依賴，\n甚至請你想像未來，你會？",
  backgroundColor: "#519754",
  imageSrc: question8Jpg.src,
  answers: [
    { key: "O", value: 1.4, title: "畫出未來發展計畫圖與可能流程" },
    { key: "D", value: 1.3, title: "根據過去的資料預測接下來的變化" },
    { key: "L", value: 1.3, title: "創作一段融合神話與科技的未來故事" },
    { key: "C", value: 1.2, title: "收集大家的想像，拼出共同願景" },
    { key: "A", value: 1.3, title: "提案三個馬上能做的改善小任務" },
  ],
};

// 探索態度 - 測量學習風格
const q9: QuestionType = {
  id: "q9",
  title: "預言後，\n天上突然掉下一個木箱，你會？",
  backgroundColor: "#2C7EE9",
  imageSrc: question9Jpg.src,
  answers: [
    { key: "C", value: 1.2, title: "找大家一起打開，聽聽每個人的看法" },
    { key: "L", value: 1.4, title: "嘗試運用箱內物品創作出萬用法寶" },
    { key: "D", value: 1.4, title: "仔細研究箱子的外型再評估是否打開" },
    { key: "A", value: 1.3, title: "直接打開並把東西拿來幫助島民" },
    { key: "O", value: 1.3, title: "把裡面東西一樣樣分類記錄與分配" },
  ],
};

// 自我認知 - 最直接的人格測量
const q10: QuestionType = {
  id: "q10",
  title: "你發現島民是來自各島的觀察員，你將被分到適合你的島！你覺得是...？",
  backgroundColor: "#9FD3C0",
  imageSrc: question10Jpg.src,
  answers: [
    { key: "D", value: 1.2, title: "一座可以靜靜鑽研、慢慢想「為什麼」的島" },
    { key: "C", value: 1.2, title: "一座大家一起學習、交換想法的共學島" },
    { key: "O", value: 1.2, title: "一座井然有序、生活規律的島" },
    { key: "L", value: 1.2, title: "一座充滿意想不到創作、點子的島" },
    { key: "A", value: 1.2, title: "一座可以立刻動手、邊做邊學、不怕試錯的島" },
  ],
};

export const questionMap = new Map<string, QuestionType>([
  [q1.id, q1],
  [q2.id, q2],
  [q3.id, q3],
  [q4.id, q4],
  [q5.id, q5],
  [q6.id, q6],
  [q7.id, q7],
  [q8.id, q8],
  [q9.id, q9],
  [q10.id, q10],
]);
