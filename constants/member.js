export const GENDER = [
  {
    label: '男性',
    value: 'male',
  },
  {
    label: '女性',
    value: 'female',
  },
  {
    label: '保持神秘',
    value: 'other',
  },
];

// 身份
export const ROLE = [
  {
    label: '實驗教育學生',
    key: 'experimental-education-student',
    value: 'experimental-education-student',
    image: 'https://i.imgur.com/Vwsvh0i.png',
  },
  {
    label: '一般學生',
    key: 'normal-student',
    value: 'normal-student',
    image: 'https://i.imgur.com/2cYOPAH.png',
  },
  {
    label: '家長',
    key: 'experimental-education-parent',
    value: 'experimental-education-parent',
    image: 'https://i.imgur.com/7AHlwY6.png',
  },
  {
    label: '教育工作者',
    key: 'experimental-educator',
    value: 'experimental-educator',
    image: 'https://i.imgur.com/j4qrEtD.png',
  },
  {
    label: '社會人士',
    key: 'citizen',
    value: 'citizen',
    image: 'https://i.imgur.com/cXZXfBL.png',
  },
  {
    label: '終生學習',
    key: 'other',
    value: 'other',
    image: 'https://i.imgur.com/Z7oGEnb.png',
  },
];

export const EDUCATION_STEP = [
  // {
  //   label: '學齡前',
  //   key: 'preschool',
  //   value: 'preschool',
  // },
  // {
  //   label: '國小低年級',
  //   key: 'elementary-junior',
  //   value: 'elementary-junior',
  // },
  // {
  //   label: '國小中年級',
  //   key: 'elementary-middle',
  //   value: 'elementary-middle',
  // },
  // {
  //   label: '國小高年級',
  //   key: 'elementary-senior',
  //   value: 'elementary-senior',
  // },
  // {
  //   label: '國中',
  //   key: 'junior-high',
  //   value: 'junior-high',
  // },
  {
    label: '高中',
    key: 'high',
    value: 'high',
  },
  {
    label: '大學以上',
    key: 'university',
    value: 'university',
  },
  {
    label: '碩士',
    key: 'master',
    value: 'master',
  },
  {
    label: '博士',
    key: 'doctor',
    value: 'doctor',
  },
  {
    label: '終生學習',
    key: 'other',
    value: 'other',
  },
];

export const EDUCATION_STAGE = EDUCATION_STEP.filter(
  (step) => step.key !== 'master' && step.key !== 'doctor',
);

export const WANT_TO_DO_WITH_PARTNER = [
  {
    label: '學習交流',
    key: 'interaction',
    value: 'interaction',
  },
  {
    label: '做專案/競賽',
    key: 'do-project',
    value: 'do-project',
  },
  {
    label: '自組課程',
    key: 'make-group-class',
    value: 'make-group-class',
  },
  {
    label: '找揪團',
    key: 'find-group',
    value: 'find-group',
  },
  {
    label: '找老師',
    key: 'find-teacher',
    value: 'find-teacher',
  },
  {
    label: '找學生',
    key: 'find-student',
    value: 'find-student',
  },
];

export const CATEGORIES = [
  {
    label: '語言與文學',
    key: 'language',
    value: 'language',
    image: 'https://i.imgur.com/YgvrDCz.png',
  },
  {
    label: '數學與邏輯',
    key: 'math',
    value: 'math',
    image: 'https://i.imgur.com/kXKWrmA.png',
  },
  {
    label: '資訊與工程',
    key: 'computer-science',
    value: 'computer-science',
    image: 'https://i.imgur.com/sIJeYIp.png',
  },
  {
    label: '人文社會',
    key: 'humanity',
    value: 'humanity',
    image: 'https://i.imgur.com/Ea2cmzs.png',
  },
  {
    label: '自然科學',
    key: 'nature-science',
    value: 'nature-science',
    image: 'https://i.imgur.com/jSaZ7AF.png',
  },
  {
    label: '藝術',
    key: 'art',
    value: 'art',
    image: 'https://i.imgur.com/GvJ1ddz.png',
  },
  {
    label: '教育',
    key: 'education',
    value: 'education',
    image: 'https://i.imgur.com/M21rIig.png',
  },
  {
    label: '生活',
    key: 'life',
    value: 'life',
    image: 'https://i.imgur.com/AQIxl4v.png',
  },
  {
    label: '運動/心理/醫學',
    key: 'health',
    value: 'health',
    image: 'https://i.imgur.com/QuuxALA.png',
  },
  {
    label: '商業與社會創新',
    key: 'business',
    value: 'business',
    image: 'https://i.imgur.com/ZVewhol.png',
  },
  {
    label: '綜合型學習資源',
    key: 'diversity',
    value: 'diversity',
    image: 'https://i.imgur.com/rFNVZy8.png',
  },
  {
    label: '學習/教學工具',
    key: 'learningtools',
    value: 'learningtools',
    image: 'https://i.imgur.com/qxhYvEI.png',
  },
];
