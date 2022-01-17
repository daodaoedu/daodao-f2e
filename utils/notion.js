export const bodyHandler = (keyword, tags) => {
  let body = {
    filter: {},
  };

  if (Array.isArray(tags) && tags.length > 0 && keyword) {
    return {
      ...body,
      filter: {
        ...body.filter,
        and: [
          {
            or: [
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
            ],
          },
          {
            or: [
              ...(body?.filter?.or ?? []),
              ...tags.reduce(
                (acc, val) => [
                  ...acc,
                  {
                    property: "標籤 / Hashtag",
                    multi_select: {
                      contains: val,
                    },
                  },
                  {
                    property: "費用",
                    select: {
                      equals: val,
                    },
                  },
                  {
                    property: "資源類型",
                    multi_select: {
                      contains: val,
                    },
                  },
                  {
                    property: "年齡層 / Age of users",
                    multi_select: {
                      contains: val,
                    },
                  },
                  {
                    property: "地區",
                    select: {
                      equals: val,
                    },
                  },
                ],
                []
              ),
            ],
          },
        ],
      },
    };
  }

  if (Array.isArray(tags) && tags.length > 0) {
    body = {
      ...body,
      filter: {
        ...body.filter,
        or: [
          ...(body?.filter?.or ?? []),
          ...tags.reduce(
            (acc, val) => [
              ...acc,
              {
                property: "標籤 / Hashtag",
                multi_select: {
                  contains: val,
                },
              },
              {
                property: "費用",
                select: {
                  equals: val,
                },
              },
              {
                property: "資源類型",
                multi_select: {
                  contains: val,
                },
              },
              {
                property: "年齡層 / Age of users",
                multi_select: {
                  contains: val,
                },
              },
              {
                property: "地區",
                select: {
                  equals: val,
                },
              },
            ],
            []
          ),
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
          ...(body?.filter?.or ?? []),
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
