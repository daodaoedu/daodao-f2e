import toast from "react-hot-toast";
import { getUrlFromCategory } from "../../utils/category";

const initialState = {
  object: "list",
  results: [],
  next_cursor: null,
  has_more: false,
  isLoading: true,
  isLoadingNextData: false,
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
