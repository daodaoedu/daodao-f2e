const initialState = {
  items: [],
  tags: [],
  partner: null,
  pagination: {
    pageSize: 10,
    page: 1,
    totalCount: 0,
    totalPages: 0,
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PARTNERS_MORE_SUCCESS': {
      return {
        items: [...state.items, ...action.payload.data],
        pagination: action.payload.pagination,
      };
    }
    case 'FETCH_PARTNERS_SUCCESS': {
      return {
        ...state,
        items: action.payload.data,
        pagination: action.payload.pagination,
      };
    }
    case 'FETCH_PARTNERS_FAILURE': {
      return {
        ...initialState,
      };
    }
    case 'FETCH_PARTNER_BY_ID_SUCCESS': {
      return {
        ...state,
        partner: action.payload,
      };
    }
    case 'FETCH_PARTNER_BY_ID_FAILURE': {
      return {
        ...state,
        partner: null,
      };
    }
    case 'SEND_EMAIL_TO_PARTNER_SUCCESS': {
      return { ...state };
    }
    case 'SEND_EMAIL_TO_PARTNER_FAILURE': {
      return { ...state };
    }
    case 'FETCH_PARTNER_TAGS_SUCCESS': {
      return {
        ...state,
        tags: action.payload,
      };
    }
    case 'FETCH_PARTNER_TAGS_FAILURE': {
      return {
        ...state,
        tags: [],
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
