import React from 'react';
import { Image } from '@/components/ui/image';

const Avator = ({ photoURL }) => (
  <Image
    alt="login"
    src={photoURL || ''}
    height={80}
    width={80}
    className="rounded-full bg-gray-100 object-cover object-center min-h-[80px] min-w-[80px]"
  />
);

export default Avator;
