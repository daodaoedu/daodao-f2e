import toast from "react-hot-toast";
import { getUrlFromCategory } from "../../utils/category";

const initialState = {
  groupPosts: [
    // {
    //     "created_time": "2022-05-10T14:01:18+0000",
    //     "message": "島島阿學再一個月就要迎來兩週年了。\n謝謝這篇採訪用十分真誠且溫暖的文字，娓娓道來島島阿學這兩年來的心路歷程，包含創立的起心動念、學習資源網站的介紹，以及志工型態的團隊故事。\n\n#文章連結在留言處唷\n\n如實呈現且平易近人的文字，總會讓我感受到，記者家齊就像是在島島阿學待了好久的夥伴，自發性地，在社群中找到合適的角色，用自己的方式，與社群共好共創。\n\n其實，\n兩年前島島阿學剛創立，就會時常看見家齊的按讚，直到現在仍會看見家齊默默地關注。\n\n每一個按讚、分享，\n都是一種共好方式，\n都為不同的生命搭起一座橋樑。\n謝謝教育界有這樣的媒體人，謝謝家齊。\n謝謝每一位貢獻者，你們都是島島阿學的夥伴。\n\n文／Tiff \n\n#有你們真好 #島島阿學 #自主學習 #學習資源 #民主教育 #親子天下 #翻轉教育",
    //     "id": "102765498207989_504039708080564"
    // },
  ],
  fanpagesPosts: [],
  isLoadingGroupPosts: true,
  isLoadingFanpagesPosts: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_FACEBOOK_GROUP_POST_SUCCESS": {
      return {
        ...state,
        groupPosts: action.payload,
        isLoadingGroupPosts: false,
      };
    }
    case "GET_FACEBOOK_GROUP_POST_FAILURE": {
      return {
        ...state,
        isLoadingGroupPosts: false,
      };
    }
    case "GET_FACEBOOK_FANSPAGE_POST_SUCCESS": {
      return {
        ...state,
        fanpagesPosts: action.payload,
        isLoadingFanpagesPosts: false,
      };
    }
    case "GET_FACEBOOK_FANSPAGE_POST_FAILURE": {
      return {
        ...state,
        isLoadingFanpagesPosts: false,
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
