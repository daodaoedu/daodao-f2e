import React from 'react';
import {
  ImageList,
} from '@mui/material';
import ImageItem from './ImageItem';

const SearchGalleryList = ({
  list,
}) => {
  return (
    <ImageList
      sx={{
        transform: 'translateZ(0)',
      }}
      variant="masonry"
      rowHeight={200}
      cols={4}
    >
      {list.map((item) => {
        return (
          <ImageItem
            key={item?.properties['資源名稱']?.title[0].plain_text}
            data={item}
          />
        );
      })}
    </ImageList>
  );
};

export default SearchGalleryList;
