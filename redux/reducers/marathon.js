// import toast from 'react-hot-toast';

const initialState = {
  title: '',
  eventId: '',
  userId: '',
  description: '',
  motivation: { tags: [], description: '' },
  content: "",
  goals: "",
  strategies: { tags: [], description: '' },
  resources: [],
  milestones: [],
  outcomes: { tags: [], description: '' },
  status: "Ongoing",
  pricing: { option: "", pricing: 0, email: [], file: "" },
  isPublic: false,
  startDate: '',
  endDate: '',
  userMarathon: []
};

const reducer = (state = initialState, action) => {
  const { key, value } = action.payload || {};
  switch (action.type) {
    case 'FETCH_MARATHON_PROFILE_BY_USER_ID': {
      return {
        ...state,
        apiState: 'pending'
      };
    }
    case 'FETCH_MARATHON_PROFILE_BY_USER_ID_SUCCESS': {
      return {
        ...state,
        userMarathon: action.payload,
        apiState: 'success'
      };
    }
    case 'FETCH_MARATHON_PROFILE_BY_USER_ID_FAILURE': {
      return {
        ...state,
        apiState: 'reject'
      };
    }
    case 'CREATE_MARATHON_PROFILE': {
      return {
        ...state,
        apiState: 'pending'
      };
    }
    case 'CREATE_MARATHON_PROFILE_BY_TOKEN_SUCCESS': {
      return {
        ...state,
        ...action.payload,
        apiState: 'success'
      };
    }
    case 'FETCH_MARATHON_PROFILE_BY_ID': {
      return {
        ...state,
        apiState: 'pending'
      };
    }
    case 'FETCH_MARATHON_PROFILE_BY_ID_SUCCESS': {
      return {
        ...state,
        ...action.payload,
        apiState: 'success'
      };
    }
    case 'FETCH_MARATHON_PROFILE_BY_ID_FAILURE': {
      return {
        ...state,
        apiState: 'reject'
      };
    }
    case 'UPDATE_MARATHON_PROFILE_SUCCESS': {
      return {
        ...state,
        ...action.payload,
        apiState: 'success',
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
    default: {
      return state;
    }
  }
};

export default reducer;
