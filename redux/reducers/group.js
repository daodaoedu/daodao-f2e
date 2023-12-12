import {
  DEFAULT_LIMIT,
  SET_LIMIT,
  SET_QUERY,
  GET_GROUP_ITEMS_SUCCESS,
  GET_GROUP_ITEMS_FAILURE,
} from '../actions/group';

const initialState = {
  limit: DEFAULT_LIMIT,
  query: {},
  items: [],
  total: 0,
  isLoading: true,
};

const reducer = (state = initialState, action) => {
  const limit = action?.payload?.limit || DEFAULT_LIMIT;

  switch (action.type) {
    case SET_LIMIT: {
      return {
        ...state,
        limit,
        isLoading: true,
      };
    }
    case SET_QUERY: {
      return {
        ...state,
        ...(action.payload ?? {}),
        items: [],
        limit,
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
