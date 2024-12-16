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
    option: "優惠價：8000 元",
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
        apiStateWithType: 'fetchMarathonProfileByUserId'
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_ID_SUCCESS": {
      return {
        ...state,
        userMarathon: action.payload,
        apiState: "success",
        apiStateWithType: 'fetchMarathonProfileByUserIdSuccess'
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_ID_FAILURE": {
      return {
        ...state,
        apiState: "reject",
        apiStateWithType: 'fetchMarathonProfileByUserIdFailure'
      };
    }
    case "UPDATE_NEW_MARATHON": {
      return {
        ...action.payload,
        apiStateWithType: 'updateNewMarathon'
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_EVENT": {
      return {
        ...state,
        apiState: "pending",
        apiStateWithType: 'fetchMarathonProfileByUserEvent'
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_EVENT_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        apiState: "success",
        apiStateWithType: 'fetchMarathonProfileByUserEventSuccess'
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_USER_EVENT_FAILURE": {
      return {
        ...state,
        apiState: "reject",
        apiStateWithType: 'fetchMarathonProfileByUserEventFailure'
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_ID_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        apiState: "success",
        apiStateWithType: 'fetchMarathonProfileByIdSuccess'
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_ID_FAILURE": {
      return {
        ...state,
        apiState: "reject",
        apiStateWithType: 'fetchMarathonProfileByIdFailure'
      };
    }
    case "UPDATE_MARATHON_PROFILE": {
      return {
        ...state,
        apiState: "pending",
        apiStateWithType: 'updateMarathonProfile'
      };
    }
    case "UPDATE_MARATHON_PROFILE_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        apiState: "success",
        apiStateWithType: 'updateMarathonProfileSuccess'
      };
    }
    case "UPDATE_MARATHON_PROFILE_FAILURE": {
      return {
        ...state,
        apiState: "reject",
        apiStateWithType: 'updateMarathonProfileFailure',
      };
    }

    case "CREATE_MARATHON_PROFILE_BY_TOKEN": {
      return {
        ...state,
        apiState: "pending",
        apiStateWithType: 'createMarathonProfileByToken',
      };
    }
    case "CREATE_MARATHON_PROFILE_BY_TOKEN_SUCCESS": {
      return {
        ...state,
        ...action.payload,
        apiState: "success",
        apiStateWithType: 'createMarathonProfileByTokenSuccess'
      };
    }
    case "CREATE_MARATHON_PROFILE_BY_TOKEN_FAILURE": {
      return {
        ...state,
        apiState: "reject",
        apiStateWithType: 'createMarathonProfileByTokenFailure'
      };
    }
    case "FETCH_MARATHON_PROFILE_BY_ID": {
      return {
        ...state,
        apiState: "pending",
        apiStateWithType: 'fetchMarathonProfileById',
      };
    }
    case 'UPDATE_MARATHON_PROFILE_API_STATE_RESET': {
      return {
        ...state,
        apiState: 'None',
        apiStateWithType: 'updateMarathonProfileApiStateReset'
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
