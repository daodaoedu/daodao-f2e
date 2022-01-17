// language: "語言與文學",
// math: "數學與邏輯",
// comsci: "電腦科學",
// natusci: "自然科學",
// humanity: "人文社會",
// art: "藝術",
// education: "教育",
// life: "生活",
// health: "運動/心理/醫學",
// business: "商業與社會創新",
// multires: "綜合型學習資源",
const TYPE = [
  "language",
  "math",
  "comsci",
  "natusci",
  "humanity",
  "art",
  "education",
  "life",
  "health",
  "business",
  "multires",
];

export const searchTypeHandler = (type) => {
  if (TYPE.includes(type)) {
    return type;
  }
  return "language";
};

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
                    property: "資源類型 / Type of the resource",
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
                property: "資源類型 / Type of the resource",
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
            property: "資源類型 / Type of the resource",
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
