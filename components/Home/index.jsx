'use client';

import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';

import { Separator } from '@/shared/ui/separator';
import { Button } from '@/shared/ui/button';
import Banner from '../Banner';
import Guide from './Guide';
import About from './About';
import Group from './Group';
import Edm from './Edm';
import FacebookPosts from './FacebookPosts';
import APPBanner from './APPBanner';

function Home() {
  const guideRef = useRef(null);
  const router = useRouter();
  return (
    <div>
      <Banner>
        <Button
          onClick={() => { router.push('/learning-marathon#marathon-intro'); }}
          className="absolute left-1/2 top-[calc(100vw/3.65)] flex h-10 w-[220px] -translate-x-1/2 items-center justify-center gap-2.5 rounded-[40px] bg-[#FFA10B] px-5 py-1.5 text-center text-lg font-normal leading-[140%] text-white hover:shadow-[0px_4px_10px_0px_rgba(255,161,11,0.50)] max-md:top-[calc(100vw/1.2)] max-md:h-[50px] max-md:w-[180px] max-md:text-sm"
        >
          不要錯過！點我了解
        </Button>
      </Banner>
      <About />
      <Separator className="my-2.5" />
      <APPBanner />
      <Separator className="my-2.5" />
      <FacebookPosts />
      <Separator className="my-2.5" />
      <Group />
      <Separator className="my-2.5" />
      <div ref={guideRef} />
      <Guide />
      <Separator className="my-2.5" />
      <Edm />
    </div>
  );
}

export default Home;
