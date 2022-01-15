import React from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import useSWR from "swr";
import List from "./List";
import { postFetcher } from "../../utils/fetcher";

const SearchWrapper = styled.div`
  height: 100%;
  min-height: calc(100vh - 80px);
  & > .title {
    font-size: 30px;
    font-weight: 500;
  }
`;

// if (isFilterRequest) {
//   initialSetting.body = JSON.stringify({
//     filter: {
//       or: [
//         {
//           property: '標籤 / Hashtag',
//           multi_select: {
//             contains: tags,
//           },
//         },
//       ],
//     },
//   })
// }

const Search = () => {
  const router = useRouter();
  //   const { categoryId, query } = action.payload;
  //   const queryString = `${query.tags ? `${`?tags=${query.tags}`}` : ""}`;
  //   const url = `https://api.daoedu.tw/notion/databases/${categoryId}${queryString}`;
  const { data } = useSWR(
    [
      `https://api.daoedu.tw/notion/databases/da015b1a389b43cda9f01876294064e0`,
      {
        filter: {
          or: [
            {
              property: "標籤 / Hashtag",
              multi_select: {
                contains: router.query.q,
              },
            },
          ],
        },
      },
    ],
    postFetcher
  );
  const isLoading = !data;
  console.log("data=>", data);

  return (
    <SearchWrapper>
      <h1 className="title">
        {router.query.q}
        的搜尋結果
      </h1>
      <List list={data?.payload?.results ?? []} isLoading={isLoading} />
    </SearchWrapper>
  );
};

export default Search;
