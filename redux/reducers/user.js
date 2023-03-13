// import toast from 'react-hot-toast';

const initialState = {
  name: '',
  email: '',
  photoURL: '',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHECK_USER_ACCOUNT_SUCCESS': {
      return {
        ...state,
        ...action.payload,
      };
    }
    case 'USER_LOGIN_SUCCESS': {
      return {
        ...state,
        ...action.payload,
      };
    }
    case 'ADD_RESOURCE_TO_COLLECTION_SUCCESS': {
      return {
        ...state,
        ...action.payload,
      };
    }
    case 'REMOVE_RESOURCE_FROM_COLLECTION_SUCCESS': {
      return {
        ...state,
        ...action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
