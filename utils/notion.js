import stringSanitizer from "./sanitizer";

// language: "語言與文學",
// math: "數學與邏輯",
// comsci: "資訊與工程",
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

export const bodyHandler = (query, nextCursor, pageSize = 100) => {
  const { q, tags, cats, ages, fee } = query;
  let body = {
    filter: {
      and: [],
    },
  };

  // 下一頁 optional
  if (nextCursor) {
    Object.assign(body, { start_cursor: nextCursor });
  }

  // optional
  if (pageSize) {
    Object.assign(body, { page_size: pageSize });
  }

  if (Object.keys(query).length === 0) {
    return body;
  }

  // 關鍵字
  const keyword = stringSanitizer(q);
  if (typeof keyword === "string" && keyword.length > 0) {
    body.filter.and.push({
      or: [
        {
          property: "資源名稱",
          title: {
            contains: keyword,
          },
        },
        {
          property: "介紹",
          rich_text: {
            contains: keyword,
          },
        },
      ],
    });
  }

  // 分類
  const catTags =
    typeof cats === "string" ? stringSanitizer(cats).split(",") : [];
  if (Array.isArray(catTags) && catTags.length > 0) {
    body.filter.and.push({
      or: [
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
    });
  }

  // 標籤
  const queryTags =
    typeof tags === "string" ? stringSanitizer(tags).split(",") : [];
  if (Array.isArray(queryTags) && queryTags.length > 0) {
    body.filter.and.push({
      or: [
        ...queryTags.reduce(
          (acc, val) => [
            ...acc,
            {
              property: "標籤",
              multi_select: {
                contains: val,
              },
            },
            {
              property: "資源類型",
              multi_select: {
                contains: val,
              },
            },
          ],
          []
        ),
      ],
    });
  }

  // 年齡層
  const ageTags =
    typeof ages === "string" ? stringSanitizer(ages).split(",") : [];
  console.log("ageTags", ageTags);
  if (Array.isArray(ageTags) && ageTags.length > 0) {
    body.filter.and.push(
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
      )
    );
  }

  console.log("=>", body.filter.and);

  // 費用
  const feeQuery = typeof fee === "string" ? stringSanitizer(fee) : "";
  if (feeQuery.length > 0) {
    body.filter.and.push({
      property: "費用",
      select: {
        equals: feeQuery,
      },
    });
  }

  return body;
};
