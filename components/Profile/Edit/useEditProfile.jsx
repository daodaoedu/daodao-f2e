import dayjs from 'dayjs';
import { useReducer } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from '@/redux/actions/user';

const initialState = {
  name: '',
  photoURL: '',
  birthDay: dayjs(),
  gender: '',
  roleList: [],
  wantToDoList: [],
  // interestList: [],
  educationStage: '-1',
  location: 'tw',
  contactInformationList: [],
  tagList: [],
  selfIntroduction: '',
  share: '',
  isOpenLocation: false,
  isOpenProfile: false,
  isLoadingSubmit: false,
};

const userReducer = (state, payload) => {
  const { key, value, isMultiple = false } = payload;
  if (isMultiple) {
    return {
      ...state,
      [key]: state[key].includes(value)
        ? state[key].filter((role) => role !== value)
        : [...state[key], value],
    };
  } else if (state && state[key] !== undefined) {
    return {
      ...state,
      [key]: value,
    };
  }
  return state;
};

const useEditProfile = () => {
  const reduxDispatch = useDispatch();

  const [userState, stateDispatch] = useReducer(userReducer, initialState);

  // TODO ErrorMap

  const onChangeHandler = ({ key, value }) => {
    stateDispatch({ key, value });
  };

  const onSubmit = async ({ id, email }) => {
    if (!id || !email) return;
    const {
      name,
      birthDay,
      gender,
      roleList,
      educationStage,
      location,
      wantToDoList,
      share,
      isOpenLocation,
      isOpenProfile,
      contactInformationList,
      tagList,
      selfIntroduction,
    } = userState;

    const payload = {
      id,
      email,
      contactInformationList,
      name,
      birthDay,
      gender,
      roleList,
      wantToDoList,
      educationStage,
      location,
      tagList,
      selfIntroduction,
      share,
      isOpenLocation,
      isOpenProfile,
    };

    reduxDispatch(updateUser(payload));
  };

  return {
    userState,
    onChangeHandler,
    onSubmit,
  };
};

export default useEditProfile;
