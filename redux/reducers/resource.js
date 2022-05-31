import toast from "react-hot-toast";
const initialState = {
  relatedResources: [],
  isLoading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOAD_RELATED_RESOURCES_SUCCESS": {
      return {
        ...state,
        relatedResources: action?.payload?.results ?? [],
        isLoading: false,
      };
    }
    case "LOAD_RELATED_RESOURCES_FAILURE": {
      return {
        ...state,
        isLoading: false,
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
