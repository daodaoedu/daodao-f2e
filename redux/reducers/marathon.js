export const initialState = {
  title: "",
  eventId: "2025S1",
  userId: "",
  description: "",
  motivation: { tags: [], description: "" },
  content: "",
  goals: "",
  strategies: { tags: [], description: "" },
  resources: [],
  milestones: [],
  outcomes: { tags: [], description: "" },
  status: "Ongoing",
  registrationStatus: "Open",
  registrationDate: "",
  pricing: {
    option: "",
    price: 0,
    email: [],
    file: "",
  },
  isPublic: false,
  startDate: "",
  endDate: "",
};

const reducer = (state = initialState, action) => {
  const { key, value } = action.payload || {};
  switch (action.type) {
    case "FETCH_MARATHON_PROFILE_BY_USER_ID": {
      return {
        ...state,
        apiState: "pending",
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_ID_SUCCESS": {
      return {
        ...state,
        userMarathon: action.payload,
        apiState: "success",
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_ID_FAILURE": {
      return {
        ...state,
        apiState: "reject",
      };
    }
    case "UPDATE_NEW_MARATHON": {
      return {
        ...action.payload,
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_EVENT": {
      return {
        ...state,
        apiState: "pending",
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_EVENT_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        apiState: "success",
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_EVENT_FAILURE": {
      return {
        ...state,
        apiState: "reject",
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_ID_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        apiState: "success",
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_ID_FAILURE": {
      return {
        ...state,
        apiState: "reject",
      };
    }
    case "UPDATE_MARATHON_PROFILE": {
      return {
        ...state,
        apiState: "pending",
      };
    }
    case "UPDATE_MARATHON_PROFILE_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        apiState: "success",
      };
    }
    case "UPDATE_MARATHON_PROFILE_FAILURE": {
      return {
        ...state,
        apiState: "reject",
      };
    }

    case "CREATE_MARATHON_PROFILE_BY_TOKEN": {
      return {
        ...state,
        apiState: "pending",
      };
    }
    case "CREATE_MARATHON_PROFILE_BY_TOKEN_SUCCESS": {
      console.log("in reducer", action.payload);
      return {
        ...state,
        ...action.payload,
        apiState: "success",
      };
    }
    case "CREATE_MARATHON_PROFILE_BY_TOKEN_FAILURE": {
      return {
        ...state,
        apiState: "reject",
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_ID": {
      return {
        ...state,
        apiState: "pending",
      };
    }
    case 'UPDATE_USER_PROFILE_API_STATE_RESET': {
      return {
        ...state,
        apiState: 'None',
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
