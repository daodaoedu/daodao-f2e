const initialState = {
  items: [],
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
        ...initialState,
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
    default: {
      return state;
    }
  }
};

export default reducer;
