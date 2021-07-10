const categoryReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_NOTION_TABLE': {
      console.log('--->', action.payload);
      return state;
    }
    default: {
      return state;
    }
  }
};

export default categoryReducer;
