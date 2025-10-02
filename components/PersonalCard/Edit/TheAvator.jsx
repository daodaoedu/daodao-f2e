import React from 'react';
import { Image } from '@/shared/ui/image';

const EditAvator = ({
  url = 'https://imgur.com/EADd1UD.png',
  height = 128,
  width = 128,
}) => (
  <div className="mt-6">
    <Image
      alt="login"
      src={url}
      height={height}
      width={width}
      className="rounded-full bg-gray-100 object-cover object-center"
      style={{
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
    />
  </div>
);

export default EditAvator;
