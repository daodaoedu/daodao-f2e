import toast from 'react-hot-toast';

const initialState = {
  mode: 'light',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'THEME_MODE_CHANGE': {
      return {
        ...state,
        mode: state.mode === 'light' ? 'dark' : 'light',
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
