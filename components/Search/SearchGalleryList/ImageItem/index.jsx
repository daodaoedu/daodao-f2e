import React, { useMemo } from 'react';
import {
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const Item = ({ data }) => {
  const title = useMemo(
    () =>
      (data?.properties['資源名稱']?.title ?? []).find(
        (item) => item?.type === 'text',
      )?.plain_text,
    [data?.properties],
  );

  return (
    <ImageListItem>
      <img
        src={
          (Array.isArray(data?.properties['縮圖']?.files) &&
            data.properties['縮圖']?.files[0]?.name) ??
          'https://www.daoedu.tw/preview.webp'
        }
        alt={title}
        loading="lazy"
      />
      <ImageListItemBar
        sx={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
            'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
        }}
        title={title}
        position="top"
        actionIcon={
          <IconButton sx={{ color: 'white' }} aria-label={`star ${title}`} />
        }
        actionPosition="left"
      />
    </ImageListItem>
  );
};

export default Item;
