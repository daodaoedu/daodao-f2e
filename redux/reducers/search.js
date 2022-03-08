import toast from "react-hot-toast";
import { getUrlFromCategory } from "../../utils/category";

const initialState = {
  object: "list",
  results: [],
  next_cursor: null,
  has_more: false,
  isLoading: true,
  isLoadingNextData: false,
  sponsorResults: [
    {
      object: "page",
      id: "b4ac282b-8030-43c1-accb-f53861805056",
      created_time: "2022-03-08T07:37:00.000Z",
      last_edited_time: "2022-03-08T07:40:00.000Z",
      created_by: {
        object: "user",
        id: "804e887d-17dd-4a9b-8899-4efba5b74c88",
      },
      last_edited_by: {
        object: "user",
        id: "804e887d-17dd-4a9b-8899-4efba5b74c88",
      },
      cover: null,
      icon: null,
      parent: {
        type: "database_id",
        database_id: "edc9ef67-0495-412c-803d-4028510c518e",
      },
      archived: false,
      properties: {
        資源類型: {
          id: "%3C%3Dko",
          type: "multi_select",
          multi_select: [
            {
              id: "939b8a00-7ebf-4eff-88ad-8e76ebbdb63a",
              name: "組織/社群",
              color: "blue",
            },
            {
              id: "8e62e5bd-d337-4a4a-9c96-9bac047f8444",
              name: "課程/活動",
              color: "blue",
            },
          ],
        },
        創建者: {
          id: "A%7DLo",
          type: "multi_select",
          multi_select: [],
        },
        縮圖: {
          id: "TZ_W",
          type: "files",
          files: [
            {
              name: "https://i.imgur.com/n6GG0vF.png",
              type: "external",
              external: {
                url: "https://i.imgur.com/n6GG0vF.png",
              },
            },
          ],
        },
        領域名稱: {
          id: "Vv%3Ew",
          type: "multi_select",
          multi_select: [
            {
              id: "6a0a0545-605e-46da-942b-b02d4a0cac21",
              name: "資訊與工程",
              color: "purple",
            },
          ],
        },
        補充資源: {
          id: "%5Bn%60T",
          type: "rich_text",
          rich_text: [],
        },
        連結: {
          id: "%5E%3A%7By",
          type: "url",
          url: "https://www.codingbar.ai/",
        },
        費用: {
          id: "h%7B%3Dv",
          type: "select",
          select: {
            id: "Xl}F",
            name: "需付費",
            color: "pink",
          },
        },
        介紹: {
          id: "k_Vg",
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: {
                content:
                  "我們相信，未來程式語言將是每個人的基本能力，就像現在的英語一樣！透過寫程式的過程，可以培養 AI 所無法取代的：「思考、創意、溝通與協同合作」4C 能力（Critical thinking, Creativity, Communication , Collaboration），這也是 108 課綱所強調的核心素養，更是孩子未來重要的競爭力！\nCodingBar 創辦人 Jerry 曾為上市公司洋華光電 (3622) 副總，在與世界各國人才交流的過程，深感台灣教育需要改變，才能培養出符合新世代需要的人才，因此創辦瑞比智慧科技 airabbi，就是希望透過科技翻轉教育，培養出具有國際競爭力的下一代！                      (簡介摘自https://codingbar.ai/about/index.html)",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text:
                "我們相信，未來程式語言將是每個人的基本能力，就像現在的英語一樣！透過寫程式的過程，可以培養 AI 所無法取代的：「思考、創意、溝通與協同合作」4C 能力（Critical thinking, Creativity, Communication , Collaboration），這也是 108 課綱所強調的核心素養，更是孩子未來重要的競爭力！\nCodingBar 創辦人 Jerry 曾為上市公司洋華光電 (3622) 副總，在與世界各國人才交流的過程，深感台灣教育需要改變，才能培養出符合新世代需要的人才，因此創辦瑞比智慧科技 airabbi，就是希望透過科技翻轉教育，培養出具有國際競爭力的下一代！                      (簡介摘自https://codingbar.ai/about/index.html)",
              href: null,
            },
          ],
        },
        標籤: {
          id: "nWGj",
          type: "multi_select",
          multi_select: [
            {
              id: "`JEI",
              name: "JS",
              color: "default",
            },
            {
              id: "JDXa",
              name: "HTML/CSS",
              color: "default",
            },
            {
              id: "aE{j",
              name: "資料庫",
              color: "default",
            },
            {
              id: ";H[L",
              name: "網頁設計",
              color: "default",
            },
            {
              id: "aIw=",
              name: "APP設計",
              color: "default",
            },
            {
              id: "bKbr",
              name: "程式設計",
              color: "default",
            },
          ],
        },
        地區: {
          id: "pai%5E",
          type: "multi_select",
          multi_select: [],
        },
        年齡層: {
          id: "wS%3Cy",
          type: "multi_select",
          multi_select: [
            {
              id: "N~{E",
              name: "國小",
              color: "green",
            },
            {
              id: "D<Fb",
              name: "國高中",
              color: "green",
            },
            {
              id: "b~_o",
              name: "大學以上",
              color: "green",
            },
          ],
        },
        資源名稱: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: "Coding Bar 程式設計領航學校",
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "Coding Bar 程式設計領航學校",
              href: null,
            },
          ],
        },
      },
      url: "https://www.notion.so/Coding-Bar-b4ac282b803043c1accbf53861805056",
    },
  ],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SEARCH_RESULT": {
      return {
        ...state,
        isLoading: true,
      };
    }
    case "SEARCH_RESULT_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };
    }
    case "NEXT_SEARCH_RESULT": {
      return {
        ...state,
        isLoadingNextData: true,
      };
    }
    case "NEXT_SEARCH_RESULT_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        results: [...state.results, ...action.payload.results],
        isLoadingNextData: false,
      };
    }
    case "NEXT_SEARCH_RESULT_FAILURE": {
      return state;
    }
    case "SEARCH_RESULT_FAILURE": {
      return state;
    }
    default: {
      return state;
    }
  }
};

export default reducer;
