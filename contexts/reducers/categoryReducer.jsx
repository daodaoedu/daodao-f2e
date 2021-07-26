const categoryReducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST_LOAD_NOTION_TABLE': {
      return {
        ...state,
        loading: {
          ...state.loading,
          category: true,
        },
      };
    }
    case 'LOAD_NOTION_TABLE': {
      return {
        ...state,
        category: action.payload,
        loading: {
          ...state.loading,
          category: false,
        },
      };
    }
    case 'LOAD_NOTION_PAGE': {
      return {
        ...state,
        page: action.payload,
      };
    }
    case 'LOAD_NOTION_TABLE_FAILURE': {
      return {
        ...state,
        loading: {
          ...state.loading,
          category: false,
        },
      };
    }
    default: {
      return state;
    }
  }
};

export default categoryReducer;
