import toast from "react-hot-toast";

const initialState = {
  name: "",
  email: "",
  photoURL: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_USER_ACCOUNT_SUCCESS": {
      return {
        ...state,
        ...action.payload,
      };
    }
    case "USER_LOGIN_SUCCESS": {
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
