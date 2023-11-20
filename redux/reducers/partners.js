const initialState = {
  items: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_ALL_PARTNERS_SUCCESS': {
      return {
        ...state,
        items: action.payload,
      };
    }
    case 'FETCH_ALL_PARTNERS_FAILURE': {
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
