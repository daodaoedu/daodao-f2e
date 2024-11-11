// import toast from 'react-hot-toast';

const initialState = {};

const reducer = (state = initialState, action) => {
  const checkIsComplete = (data = {}) => {
    const hasAnySocialCode = Object.values(data.contactList || '{}').some(
      (socialCode) => Boolean(socialCode),
    );
    if (!hasAnySocialCode) return false;

    return [
      'name',
      'birthDay',
      'gender',
      'roleList',
      'wantToDoList',
      'tagList',
      'selfIntroduction',
    ].every((key) =>
      Boolean(Array.isArray(data[key]) ? data[key].length : data[key]),
    );
  };

  switch (action.type) {
    case 'CHECK_LOGIN_VALIDITY': {
      return {
        ...state,
        isComplete: checkIsComplete(state),
      };
    }
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
    case 'USER_LOGOUT': {
      return {
        ...initialState,
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
    case 'FETCH_USER_BY_ID_SUCCESS': {
      return {
        ...action.payload,
        isComplete: checkIsComplete(action.payload),
      };
    }

    case 'FETCH_USER_BY_ID_FAILURE': {
      return {
        ...state,
      };
    }
    case 'UPDATE_USER_PROFILE': {
      return {
        ...state,
        apiState: 'Pending',
      };
    }
    case 'UPDATE_USER_PROFILE_SUCCESS': {
      return {
        ...state,
        ...action.payload,
        apiState: 'Resolve',
        isComplete: checkIsComplete(action.payload),
      };
    }
    case 'UPDATE_USER_PROFILE_API_STATE_RESET': {
      return {
        ...state,
        apiState: 'None',
      };
    }
    case 'UPDATE_USER_PROFILE_FAILURE': {
      return {
        ...state,
        apiState: 'Reject',
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
