import React from 'react';
import { Box } from '@mui/material';

const SocialMediaItem = ({ link, text, tag, iconComponent }) => {
  return (
    <Box as={tag || 'div'}>
      {iconComponent}
      <a target="_blank" rel="noreferrer" href={link}>
        {text}
      </a>
    </Box>
  );
};

export default SocialMediaItem;
