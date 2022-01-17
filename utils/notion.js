export const bodyHandler = (keyword, tag) => {
  let body = {
    filter: {
      or: [],
    },
  };
  if (tag) {
    body = {
      ...body,
      filter: {
        ...body.filter,
        or: [
          ...body.filter.or,
          {
            property: "標籤 / Hashtag",
            multi_select: {
              contains: tag,
            },
          },
          {
            property: "費用",
            select: {
              equals: tag,
            },
          },
          {
            property: "資源類型",
            multi_select: {
              contains: tag,
            },
          },
          {
            property: "年齡層 / Age of users",
            multi_select: {
              contains: tag,
            },
          },
          {
            property: "地區",
            select: {
              equals: tag,
            },
          },
        ],
      },
    };
  }

  if (keyword) {
    body = {
      ...body,
      filter: {
        ...body.filter,
        or: [
          ...body.filter.or,
          {
            property: "資源名稱 / Name",
            title: {
              contains: keyword,
            },
          },
          {
            property: "介紹 / Introduction",
            rich_text: {
              contains: keyword,
            },
          },
          /// ///////////////////////////////////////////////////
          {
            property: "標籤 / Hashtag",
            multi_select: {
              contains: keyword,
            },
          },
          {
            property: "費用",
            select: {
              equals: keyword,
            },
          },
          {
            property: "資源類型",
            multi_select: {
              contains: keyword,
            },
          },
          {
            property: "年齡層 / Age of users",
            multi_select: {
              contains: keyword,
            },
          },
          {
            property: "地區",
            select: {
              equals: keyword,
            },
          },
        ],
      },
    };
  }
  return body;
};
