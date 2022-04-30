import React from "react";
import styled from "@emotion/styled";
import Item from "./Item";
import SponsorItem from "./SponsorItem";
import SkeletonItem from "./SkeletonItem";
import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ImageItem from "./ImageItem";

const ListWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SearchGalleryList = ({
  list,
  sponsorList,
  queryTags,
  isLoading,
  isLoadingNextData,
}) => {
  // if (isLoading && list.length === 0) {
  //   return (
  //     <ListWrapper>
  //       <SkeletonItem />
  //       <SkeletonItem />
  //       <SkeletonItem />
  //       <SkeletonItem />
  //       <SkeletonItem />
  //     </ListWrapper>
  //   );
  // }
  // return (
  //   <ListWrapper>
  //     {/* {sponsorList.map((item) => (
  //       <SponsorItem
  //         key={`sponsor-${item.properties["資源名稱"].title[0].plain_text}`}
  //         data={item}
  //         queryTags={queryTags}
  //       />
  //     ))} */}
  //     {list.map((item, index) =>
  //       isLoading ? (
  //         <SkeletonItem key={index} />
  //       ) : (
  //         <Item
  //           key={item.properties["資源名稱"].title[0].plain_text}
  //           data={item}
  //           queryTags={queryTags}
  //         />
  //       )
  //     )}
  //     {isLoadingNextData && (
  //       <>
  //         <SkeletonItem />
  //         <SkeletonItem />
  //         <SkeletonItem />
  //       </>
  //     )}
  //   </ListWrapper>
  // );

  return (
    <ImageList
      sx={{
        // width: 500,
        // height: 450,
        // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
        transform: "translateZ(0)",
      }}
      variant="masonry"
      rowHeight={200}
      cols={4}
      // gap={1}
    >
      {list.map((item) => {
        return (
          <ImageItem
            key={item?.properties["資源名稱"]?.title[0].plain_text}
            data={item}
          />
        );
      })}
    </ImageList>
  );
};

export default SearchGalleryList;
