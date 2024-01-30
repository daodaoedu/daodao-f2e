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
  instagram: '',
  facebook: '',
  discord: '',
  line: '',
  educationStage: '-1',
  location: '台灣',
  tagList: [],
  selfIntroduction: '',
  share: '',
  isOpenLocation: false,
  isOpenProfile: false,
  isLoadingSubmit: false,
  country: '',
  city: '',
  district: '',
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

  const onChangeHandler = ({ key, value, isMultiple }) => {
    stateDispatch({ key, value, isMultiple });
  };

  const onSubmit = async ({ id, email }) => {
    if (!id || !email) return;
    const {
      name,
      birthDay,
      gender,
      roleList,
      educationStage,
      wantToDoList,
      share,
      isOpenLocation,
      isOpenProfile,
      tagList,
      selfIntroduction,
      instagram,
      facebook,
      discord,
      line,
      country,
      city,
      district,
    } = userState;

    const payload = {
      id,
      email,
      name,
      birthDay,
      gender,
      roleList,
      contactList: {
        instagram,
        facebook,
        discord,
        line,
      },
      wantToDoList,
      educationStage,
      location: `${country}@${city}@${district}`,
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
