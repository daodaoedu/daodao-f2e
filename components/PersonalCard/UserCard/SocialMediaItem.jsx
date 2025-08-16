import React from 'react';

const SocialMediaItem = ({
  link, text, tag, iconComponent,
}) => {
  const Component = tag || 'div';
  return (
    <Component>
      {iconComponent}
      <a target="_blank" rel="noreferrer" href={link}>
        {text}
      </a>
    </Component>
  );
};

export default SocialMediaItem;
