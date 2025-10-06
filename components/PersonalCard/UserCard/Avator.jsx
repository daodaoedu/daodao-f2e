import React from 'react';
import { Image } from '@/shared/ui/image';

const Avator = ({ photoURL }) => (
  <Image
    alt="login"
    src={photoURL || ''}
    height={80}
    width={80}
    className="min-h-[80px] min-w-[80px] rounded-full bg-gray-100 object-cover object-center"
  />
);

export default Avator;
