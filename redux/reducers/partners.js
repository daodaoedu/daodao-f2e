const initialState = {
  items: [],
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
    default: {
      return state;
    }
  }
};

export default reducer;
