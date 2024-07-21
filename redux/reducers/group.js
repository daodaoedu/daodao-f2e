import {
  DEFAULT_PAGE_SIZE,
  SET_PAGE_SIZE,
  SET_QUERY,
  GET_GROUP_ITEMS_SUCCESS,
  GET_GROUP_ITEMS_FAILURE,
} from '../actions/group';

const initialState = {
  pageSize: DEFAULT_PAGE_SIZE,
  query: {},
  items: [],
  total: 0,
  isLoading: true,
};

const reducer = (state = initialState, action) => {
  const pageSize = action?.payload?.pageSize || DEFAULT_PAGE_SIZE;

  switch (action.type) {
    case SET_PAGE_SIZE: {
      return {
        ...state,
        pageSize,
        isLoading: true,
      };
    }
    case SET_QUERY: {
      return {
        ...state,
        ...(action.payload ?? {}),
        items: [],
        pageSize,
        isLoading: true,
      };
    }
    case GET_GROUP_ITEMS_SUCCESS: {
      return {
        ...state,
        ...(action.payload ?? {}),
        isLoading: false,
      };
    }
    case GET_GROUP_ITEMS_FAILURE: {
      return {
        ...state,
        total: 0,
        isLoading: false,
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
