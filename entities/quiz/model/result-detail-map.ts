import { ResultDetail } from './types';
import {
  createResultDetail,
  createPartner,
  createResourceLink,
  LEARNING_STRATEGIES,
} from './result-detail-factory';
import {
  COMMON_TAGS,
  ROLE_IDS,
  DINING_DESCRIPTIONS,
} from './result-detail-constants';

const resultDetailList: ResultDetail[] = [
  createResultDetail({
    id: ROLE_IDS.EXPLORER,
    tags: [COMMON_TAGS.REASONING, COMMON_TAGS.OBSERVATION],
    slogan: '我喜歡先搞懂背後的原理，再決定怎麼做。',
    characteristics: '專注深入，追求知識的本質；總想搞懂背後的「為什麼」。',
    scenery: '靜得只聽得見翻書與鍵盤聲，偶爾傳來長達五小時的深度對談。',
    strategies: [
      '找深度資料當主餐慢慢咀嚼',
      '整理知識地圖',
      '刻意留白反思並紀錄觀點',
    ],
    partners: [
      createPartner(
        ROLE_IDS.ORGANIZER,
        '助整理',
        '能將探究者發掘出的龐雜資訊與深奧概念，轉化為清晰的知識地圖與學習路徑，讓深度探索的成果更易於理解與分享'
      ),
      createPartner(
        ROLE_IDS.LINKER,
        '激發靈感',
        '擅長帶來意想不到的類比與觀點'
      ),
    ],
    learningTraits:
      '探究者具備高度的內在動機，傾向進行深層學習，重視概念理解與知識脈絡的掌握。對表面知識興趣較低，更關注「為什麼」與「如何形成」。學習風格偏向反思型，專注力持久，對結構性與邏輯性要求高。',
    learningStrategies: [
      LEARNING_STRATEGIES.DEEP_READING,
      LEARNING_STRATEGIES.KNOWLEDGE_STRUCTURE,
      LEARNING_STRATEGIES.SELF_REFLECTION,
    ],
    supportNeeded: [
      '允許提問、鼓勵思考的學習環境',
      '安靜、低干擾的學習空間，並擁有反思整合的時間',
      '具深度、挑戰性、開放性的學習任務',
    ],
    islandDining: ['草仔粿奶茶', '鹹水雞'],
    islandDiningDescription: `草仔粿奶茶、鹹水雞，${DINING_DESCRIPTIONS.KNOWLEDGE_FLAVOR}`,
    recommendedResources:
      '推薦你系統思考 (Systems Thinking)，帶著有架構的方法滿足你深究事物本質的渴望。它帶你穿透表面的「事件」，看見其下的「模式」、驅動模式的「結構」（回饋迴圈），以及最底層的「心智模式」。這套框架讓你不再只解決症狀，而是能找到改變全局的關鍵槓桿點。《系統思考教案書第一章：擁抱複雜新世界》、《系統思考教案書第二章：系統動力學入門》by 楊逸帆（Adler Yang）將是你入門學習的好資源。',
    recommendedResourceLinks: [
      createResourceLink(
        '《系統思考教案書第一章：擁抱複雜新世界》',
        'https://www.researchgate.net/publication/362620988_xitongsikaojiaoanshudiyizhangyongbaofuzaxinshijie_Chapter_1_Embracing_the_World_of_Complexity_in_forthcoming_Systems_Dynamics_Handbook_for_K-12_Teachers'
      ),
      createResourceLink(
        '《系統思考教案書第二章：系統動力學入門》',
        'https://www.researchgate.net/publication/362621191_xitongsikaojiaoanshudierzhangxitongdonglixuerumen_Chapter_2_A_Short_Introduction_of_Systems_Dynamics_in_forthcoming_Systems_Dynamics_Handbook_for_K-12_Teachers'
      ),
    ],
  }),

  createResultDetail({
    id: ROLE_IDS.ACTOR,
    tags: [COMMON_TAGS.HANDS_ON, COMMON_TAGS.ACTION_ORIENTED],
    slogan: '先做再說，做中學最快！',
    characteristics: '先做再說，學習靠實作；結果出來，比理論更有說服力。',
    scenery: '島上充滿敲打聲、實驗聲、專案討論聲，每天都有人在「試試看」。',
    strategies: [
      '把大任務拆小',
      '放下高標從最小可行的開始',
      '選擇有實際產出的學習方式',
    ],
    partners: [
      createPartner(
        ROLE_IDS.ORGANIZER,
        '幫我排流程',
        '提供清晰的任務藍圖與檢查清單'
      ),
      createPartner(
        ROLE_IDS.CONNECTOR,
        '幫我測試點子',
        '能快速組織一個「使用者測試小隊」'
      ),
    ],
    learningTraits:
      '行動者具有高度的實踐導向，偏好從經驗中學習、任務導向學習。他們學習時通常不先尋求完整知識架構，而是以「邊做邊學」的方式主動探索與修正，學習動機來自於能立即應用所學。',
    learningStrategies: [
      LEARNING_STRATEGIES.TASK_BREAKDOWN,
      LEARNING_STRATEGIES.PROTOTYPING,
      LEARNING_STRATEGIES.IMMEDIATE_FEEDBACK,
    ],
    supportNeeded: [
      '大量實作、勇於相互反饋的學習機制',
      '獲得越具體的任務、清楚的目標與時間限制',
      '容許試錯的學習環境',
    ],
    islandDining: ['珍珠奶茶', '雞排'],
    islandDiningDescription: `珍奶、雞排，${DINING_DESCRIPTIONS.ENERGY_BOOST}`,
    recommendedResources:
      '推薦你一個熱愛動手解決社會問題的公民科技社群：g0v 零時政府社群，g0v 有一萬多位熱血公民，自發性用科技協作，解決各式社會問題！他們的名言是「不要問為什麼沒有人做這個，先承認你就是那個沒有人」，與其抱怨，不然自己動手嘗試解決問題！歡迎加入 Nobody 的行列！',
    recommendedResourceLinks: [
      createResourceLink('g0v 零時政府社群', 'https://g0v.tw/'),
    ],
  }),

  createResultDetail({
    id: ROLE_IDS.ORGANIZER,
    tags: [COMMON_TAGS.STRUCTURED, COMMON_TAGS.PLANNING],
    slogan: '我不怕資訊多，只怕沒邏輯！',
    characteristics: '重視邏輯與順序，喜歡把亂糟糟的資訊變得清清楚楚。',
    scenery: '滿牆的便利貼、表格筆記、時間軸，像是知識資料庫基地。',
    strategies: [
      '先建立整體結構再深入細節',
      '善用可視化筆記',
      '歸納之餘也記得要輸出想法',
    ],
    partners: [
      createPartner(ROLE_IDS.EXPLORER, '提供深度內容', '如同寶藏獵人'),
      createPartner(ROLE_IDS.ACTOR, '幫我驗證流程', '是最佳的壓力測試員'),
    ],
    learningTraits:
      '結構者擅長組織與歸納，具備分析型思維與高度的系統性。學習時傾向先建立框架再填入細節，善於辨識知識結構與概念層級。學習動機來自於把複雜變清晰、讓知識有邏輯與秩序。',
    learningStrategies: [
      LEARNING_STRATEGIES.FRAMEWORK_PLANNING,
      LEARNING_STRATEGIES.INFO_CLASSIFICATION,
      LEARNING_STRATEGIES.REORGANIZE_PRACTICE,
    ],
    supportNeeded: [
      '學習內容有條理、分類清晰、重點明確較易於吸收',
      '有系統的學習計劃，讓你掌握學習步驟與進度',
      '找老師或學伴相互討論，獲得更完整或不同思維的結構',
    ],
    islandDining: ['四季春珍波椰', '自助餐'],
    islandDiningDescription: `四季春珍波椰、自助餐，${DINING_DESCRIPTIONS.CLEAR_INGREDIENTS}`,
    recommendedResources:
      'Notion 筆記軟體能滿足結構者「組織一切」的渴望。它能建立資料庫、關聯頁面與進度看板，將散亂的想法、筆記與專案，整合成一個彼此連結、一目了然的個人系統。這座專屬於你的知識庫，能將你的結構化天賦，發揮到淋漓盡致。還有很多筆記或專案管理工具等你去探索唷！',
    recommendedResourceLinks: [
      createResourceLink(
        'Notion 筆記軟體',
        'https://www.notion.com/templates/category/design-portfolio'
      ),
    ],
  }),

  createResultDetail({
    id: ROLE_IDS.LINKER,
    tags: [COMMON_TAGS.CROSS_DOMAIN, COMMON_TAGS.DIVERSE_THINKING],
    slogan: '我喜歡跳來跳去，然後發現它們其實可以融合。',
    characteristics: '靈感多、跳躍快，喜歡把看起來無關的東西連在一起。',
    scenery: '處處都是天馬行空的島民與意想不到的創作。',
    strategies: [
      '思索差異與可能的結合點',
      '以圖像或故事轉化抽象概念',
      '與他人交流測試或激發想法',
    ],
    partners: [
      createPartner(
        ROLE_IDS.EXPLORER,
        '提供專業深度',
        '提供了專精且深入的知識「節點」與「網絡」，讓跨跨島能圍繞這些穩固的節點進行天馬行空的連結與詮釋，讓創意既有根基又不失奔放'
      ),
      createPartner(
        ROLE_IDS.CONNECTOR,
        '連結社群回饋',
        '擅長創造充滿安全感與激勵性的對話氛圍，他們能接住跨跨島跳躍性的想法，並透過社群的力量將這些創意點子轉化為可執行的合作專案'
      ),
    ],
    learningTraits:
      '流動者思維靈活、具創造力，擅長進行跨領域連結與類比思考。常表現出開放性人格特質，喜愛多元學習並能從中自我整合，屬於多向整合型學習者。對「有趣」與「新鮮」有高敏感度，學習動機來自於好奇與探索。',
    learningStrategies: [
      LEARNING_STRATEGIES.CROSS_DOMAIN_LEARNING,
      LEARNING_STRATEGIES.VISUAL_TRANSFORMATION,
      LEARNING_STRATEGIES.COLLABORATIVE_BRAINSTORM,
    ],
    supportNeeded: [
      '需要多樣、有彈性的學習任務，可以從不同角度切入，最好還能自由選擇工具或創作方式。',
      '和不同類型的人對話，參加跨領域活動，會讓你看見新的可能，也更容易把所學串起來。',
    ],
    islandDining: ['綠巨人玉米白奶茶', '巧克力小籠包'],
    islandDiningDescription: `綠巨人玉米白奶茶、巧克力小籠包，${DINING_DESCRIPTIONS.UNEXPECTED_COMBO}`,
    recommendedResources:
      '當你腦中充滿了跳躍的靈感與跨界的連結，推薦你卡片盒筆記法 (Zettelkasten)，它是為非線性思考而生的知識管理方法。它鼓勵你將每個靈感寫在一張獨立卡片上，並透過標籤與連結，讓知識點自然地串連成網。這能讓你的創意不再隨風而逝，而是在一個不斷增生的知識網絡中彼此碰撞，衍生出意想不到的深刻洞見。推薦你《卡片盒筆記：最高效思考筆記術，德國教授超強秘技，促進寫作、學習與思考，使你洞見源源不斷，成為專家》一書，作為入門資源。另外目前也有許多卡片盒筆記軟體可以使用，例如 Heptabase、Obsidian！',
    recommendedResourceLinks: [
      createResourceLink(
        '《卡片盒筆記：最高效思考筆記術，德國教授超強秘技，促進寫作、學習與思考，使你洞見源源不斷，成為專家》by Sonke Ahrens',
        'https://www.books.com.tw/products/0010922143?gad_source=1&gad_campaignid=22581294866&gbraid=0AAAAAD4DKPynyl6FAKKuBir4zoHgj1y5x&gclid=CjwKCAjwpMTCBhA-EiwA_-MsmTw1NKZMtNIi1770Xg3VwjFd_IQ1a-zI2HuLSHvsV94DJ36tp-VtjRoCeUYQAvD_BwE'
      ),
    ],
  }),

  createResultDetail({
    id: ROLE_IDS.CONNECTOR,
    tags: [COMMON_TAGS.COLLABORATIVE, COMMON_TAGS.PERCEPTIVE],
    slogan: '一個人學習太無聊，我想知道大家怎麼想！',
    characteristics: '擅長傾聽與分享，在與人交流中更容易釐清與學習。',
    scenery: '熱鬧的學習廣場，到處都是對話、回饋、合作與共學。',
    strategies: [
      '分享是最好的複習',
      '找尋或創造與人共學的機會',
      '保留自我沉澱與對話的時光',
    ],
    partners: [
      createPartner(
        ROLE_IDS.ACTOR,
        '一起實作',
        '能將連結者的社群討論快速轉化為具體的行動方案或合作專案，讓社群的能量不只停留在對話，更能凝聚成看得見的成果，帶來真實的成就感'
      ),
      createPartner(
        ROLE_IDS.LINKER,
        '腦力激盪',
        '是社群中的「鯰魚」，他們總能帶來新奇甚至顛覆性的觀點，刺激連結者所經營的社群跳脫同溫層，進行更深入、更多元的思辨與對話'
      ),
    ],
    learningTraits:
      '連結者擅長人際互動，透過與他人的對話、回饋與合作來促進理解、思辨與記憶。他們對共學與情感連結有高度需求，常能創造學習社群的凝聚力。學習動機通常與「被理解」與「貢獻他人」有關。',
    learningStrategies: [
      LEARNING_STRATEGIES.ACTIVE_SHARING,
      LEARNING_STRATEGIES.COMMUNITY_LEARNING,
      LEARNING_STRATEGIES.SELF_SETTLEMENT,
    ],
    supportNeeded: [
      '勇於傾聽、尊重觀點、樂於分享與回饋的學習環境',
      '大量與人合作、互動、交流的學習任務',
      '在分享時可邀請對方對自己的想法多回饋與提問',
    ],
    islandDining: ['地瓜球', '茶壺沖泡的高山茶'],
    islandDiningDescription: `地瓜球、茶壺沖泡的高山茶，${DINING_DESCRIPTIONS.SHARING_JOY}`,
    recommendedResources:
      '想讓一群人的對話自然發生、人人投入、且不僅止於漫談嗎？試試「開放空間技術 (Open Space Technology)」。這套方法沒有預設議程，由參與者現場決定最重要的討論主題，在聚焦討論主題的同時，也落實核心的「兩條腿法則」，賦予每個人自由移動的權利，確保所有討論都充滿能量。你的任務不再是控制，而是信任社群，讓重要的事自然發生。',
    recommendedResourceLinks: [
      createResourceLink(
        '開放空間介紹與案例（by 開拓文教基金會）',
        'https://openspacetaiwan.blogspot.com/#'
      ),
    ],
  }),
];

export const resultDetailMap = new Map<string, ResultDetail>(
  resultDetailList.map((resultDetail) => [resultDetail.id, resultDetail])
);
