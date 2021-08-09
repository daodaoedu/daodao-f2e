export const getUrlFromCategory = (properties) => {
  const { type } = properties;
  if (type === 'url') {
    return properties.url;
  } else if (type === 'files') {
    return properties.files[0]?.name;
  }
  // rich_text ?
  return '';
};

// export const getTitleFromCategory = (properties) => {
//   const { type } = properties;
//   if (type === 'url') {
//     return properties.url;
//   } else if (type === 'files') {
//     return properties.files[0]?.name;
//   }
//   // rich_text ?
//   return '';
// };
