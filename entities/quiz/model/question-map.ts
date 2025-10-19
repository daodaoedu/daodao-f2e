import question1Jpg from '@/public/assets/quiz/q1.webp';
import question2Jpg from '@/public/assets/quiz/q2.webp';
import question3Jpg from '@/public/assets/quiz/q3.webp';
import question4Jpg from '@/public/assets/quiz/q4.webp';
import question5Jpg from '@/public/assets/quiz/q5.webp';
import question6Jpg from '@/public/assets/quiz/q6.webp';
import question7Jpg from '@/public/assets/quiz/q7.webp';
import question8Jpg from '@/public/assets/quiz/q8.webp';
import question9Jpg from '@/public/assets/quiz/q9.webp';
import question10Jpg from '@/public/assets/quiz/q10.webp';
import { Question } from './types';

// 初始反應 - 測量基本認知風格
const questionList: Question[] = [
  {
    id: 'q1',
    title: '某天醒來，你發現自己躺在陌生的沙灘上，下一步你會做什麼？',
    backgroundColor: '#EAD8C2',
    image: question1Jpg,
    answers: [
      { key: 'L', value: 1, title: '改造身旁物品當生存的萬用工具' },
      { key: 'C', value: 1, title: '尋找其他人，了解情況' },
      { key: 'A', value: 1, title: '立刻起身翻包包看有沒有帶手機' },
      { key: 'D', value: 1, title: '研究地形，思考自己在哪' },
      { key: 'O', value: 1, title: '冷靜思考接下來的每一步' },
    ],
  },

  // 面對未知 - 測量探索與分析能力
  {
    id: 'q2',
    title: '忙了一天，天色漸漸黑了，\n此時叢林傳來奇怪的聲響，你會...',
    backgroundColor: '#519754',
    image: question2Jpg,
    answers: [
      { key: 'O', value: 1, title: '思索所有可能來源，分析對應方法' },
      { key: 'L', value: 1, title: '把聲音當作靈感，寫首詩或畫張圖' },
      { key: 'D', value: 1, title: '記錄聲音特徵，推理是什麼發出' },
      { key: 'A', value: 1, title: '想辦法利用聲音回應怪聲，觀察其反應' },
      { key: 'C', value: 1, title: '找找附近有沒有島民可求助' },
    ],
  },

  // 社交互動 - 重點測量社交風格
  {
    id: 'q3',
    title: '難眠的夜晚終於迎來清晨，睜開眼，你發現有一群島民圍觀你，你會...',
    backgroundColor: '#18B8A7',
    image: question3Jpg,
    answers: [
      { key: 'O', value: 1, title: '先逃離並從遠處觀察理出島民習性' },
      { key: 'A', value: 1, title: '起身介紹自己並詢問該島資訊' },
      { key: 'C', value: 1, title: '開始聊天互動認識彼此' },
      { key: 'D', value: 1, title: '不斷向島民提問幫助自己掌握資訊' },
      { key: 'L', value: 1, title: '從互動中觀察彼此差異與關聯性' },
    ],
  },

  // 挑戰應對 - 測量學習策略偏好
  {
    id: 'q4',
    title: '相處一週後，島民熱情地邀請你參加\n年度生存挑戰賽，報名後你會...',
    backgroundColor: '#7CC8FE',
    image: question4Jpg,
    answers: [
      { key: 'O', value: 1, title: '打聽關卡，一步步擬定應戰策略' },
      { key: 'C', value: 1, title: '尋找參加過的人聊聊詢問建議' },
      { key: 'L', value: 1, title: '用盡各種方式猜出各個關卡內容' },
      { key: 'D', value: 1, title: '先查閱歷史紀錄與過往參賽者的心得' },
      { key: 'A', value: 1, title: '養足精神與體力，邊玩邊解決問題' },
    ],
  },

  // 跨文化溝通 - 測量創意與合作能力
  {
    id: 'q5',
    title: '挑戰賽第一關是\n「猜出神秘符號的意思」，你會...',
    backgroundColor: '#3E8FED',
    image: question5Jpg,
    answers: [
      { key: 'L', value: 1, title: '找出符號與該島的所有相關性' },
      { key: 'D', value: 1, title: '查詢各種資料推敲符號來源' },
      { key: 'A', value: 1, title: '不斷嘗試答題，從答題中推敲正解' },
      { key: 'O', value: 1, title: '將神秘符號嘗試做分類找尋規律' },
      { key: 'C', value: 1, title: '與其他參賽者一起討論解題' },
    ],
  },

  // 危機領導 - 重點測量行動力與系統思維
  {
    id: 'q6',
    title: '順利解題後，突然狂風暴雨，你要順利存活到日出時刻才可過關，你會...',
    backgroundColor: '#E1FAFF',
    image: question6Jpg,
    answers: [
      { key: 'A', value: 1, title: '立刻動手搭避風棚' },
      { key: 'D', value: 1, title: '找安全處，推理最佳應對方式' },
      { key: 'C', value: 1, title: '找人組隊合作避災' },
      { key: 'L', value: 1, title: '翻找包包與觀察周遭可用的物品' },
      { key: 'O', value: 1, title: '分析規劃生存計劃' },
    ],
  },

  // 價值選擇 - 測量深層偏好
  {
    id: 'q7',
    title: '恭喜順利存活進入到最後一關，\n破關前每人可選一樣物品，你會選...',
    backgroundColor: '#93D7FF',
    image: question7Jpg,
    answers: [
      { key: 'O', value: 1, title: '能讓時間凍結的手錶' },
      { key: 'A', value: 1, title: '會自動變形的萬用錘' },
      { key: 'D', value: 1, title: '能讀懂萬物的古書' },
      { key: 'C', value: 1, title: '能畫出實體物的筆' },
      { key: 'L', value: 1, title: '能召喚他人的神燈' },
    ],
  },

  // 未來規劃 - 重點測量思維模式
  {
    id: 'q8',
    title: '最後一關的任務是\n提出「島嶼十年發展計劃」，你會...',
    backgroundColor: '#519754',
    image: question8Jpg,
    answers: [
      { key: 'O', value: 1, title: '盤點現況並撰寫成計劃書' },
      { key: 'D', value: 1, title: '根據過去的資料預測接下來的變化' },
      { key: 'L', value: 1, title: '創作融合神話與科技的未來故事' },
      { key: 'C', value: 1, title: '收集大家的想像，拼出共同願景' },
      { key: 'A', value: 1, title: '提出具體且立即可做的改善建議' },
    ],
  },

  // 探索態度 - 測量學習風格
  {
    id: 'q9',
    title: '你的提案獲得島民一致好評，\n冠軍禮物從天而降，你希望是...',
    backgroundColor: '#2C7EE9',
    image: question9Jpg,
    answers: [
      { key: 'C', value: 1, title: '好久不見的親友' },
      { key: 'L', value: 1, title: '能看見過去與未來的眼鏡' },
      { key: 'D', value: 1, title: '清楚解釋此趟奇幻之旅的資訊' },
      { key: 'A', value: 1, title: '萬用的百寶袋' },
      { key: 'O', value: 1, title: '一份具體的未來生存/離島計劃' },
    ],
  },

  // 自我認知 - 最直接的人格測量
  {
    id: 'q10',
    title: '你發現島民是來自各島的觀察員，你將被分到適合你的島！你覺得是...？',
    backgroundColor: '#9FD3C0',
    image: question10Jpg,
    answers: [
      { key: 'D', value: 1, title: '一座可以靜靜鑽研、慢慢想「為什麼」的島' },
      { key: 'C', value: 1, title: '一座大家一起學習、交換想法的共學島' },
      { key: 'O', value: 1, title: '一座井然有序、生活規律的島' },
      { key: 'L', value: 1, title: '一座充滿意想不到創作、點子的島' },
      { key: 'A', value: 1, title: '一座可以立刻動手、邊做邊學、不怕試錯的島' },
    ],
  },
];

export const questionMap = new Map<string, Question>(
  questionList.map((question) => [question.id, question])
);
