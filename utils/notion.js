import stringSanitizer from "./sanitizer";

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

export const bodyHandler = (query) => {
  if (Object.keys(query).length === 0) {
    return {};
  }

  let body = {
    filter: {
      // and裡面有兩個or，文案相關或標籤相關來做篩選
      and: [
        {
          or: [],
        },
      ],
    },
  };

  const { tags, q, cats, ages, fee } = query;

  // 關鍵字
  const keyword = stringSanitizer(q);
  if (typeof keyword === "string" && keyword.length > 0) {
    body = {
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
        ],
      },
    };
  }

  // 標籤
  const queryTags =
    typeof tags === "string" ? stringSanitizer(tags).split(",") : [];
  if (Array.isArray(queryTags) && queryTags.length > 0) {
    body = {
      ...body,
      filter: {
        ...body.filter,
        and: [
          ...(body?.filter?.and ?? []),
          {
            or: [
              ...(body?.filter?.and?.or ?? []),
              ...queryTags.reduce(
                (acc, val) => [
                  ...acc,
                  {
                    property: "標籤",
                    multi_select: {
                      contains: val,
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

  // 分類
  const catTags =
    typeof cats === "string" ? stringSanitizer(cats).split(",") : [];
  if (Array.isArray(catTags) && catTags.length > 0) {
    body = {
      ...body,
      filter: {
        ...body.filter,
        and: [
          ...(body?.filter?.and ?? []),
          {
            or: [
              ...(body?.filter?.and[0]?.or ?? []),
              ...catTags.reduce(
                (acc, val) => [
                  ...acc,
                  {
                    property: "領域名稱",
                    multi_select: {
                      contains: val,
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

  // 年齡層
  const ageTags =
    typeof ages === "string" ? stringSanitizer(ages).split(",") : [];
  if (Array.isArray(catTags) && catTags.length > 0) {
    body = {
      ...body,
      filter: {
        ...body.filter,
        and: [
          ...(body?.filter?.and ?? []),
          {
            or: [
              ...(body?.filter?.and[0]?.or ?? []),
              ...ageTags.reduce(
                (acc, val) => [
                  ...acc,
                  {
                    property: "年齡層",
                    multi_select: {
                      contains: val,
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

  // 費用
  const feeQuery = typeof fee === "string" ? stringSanitizer(fee) : "";
  if (feeQuery.length > 0) {
    body = {
      ...body,
      filter: {
        ...body.filter,
        and: [
          ...(body?.filter?.and ?? []),
          {
            property: "費用",
            select: {
              equals: feeQuery,
            },
          },
        ],
      },
    };
  }

  return body;
};
