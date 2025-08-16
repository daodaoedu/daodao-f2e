import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Title as TypographyTitle } from '@/components/ui/typography';
import SearchField from '../SearchField';
import BannerVideo from '../BannerVideo';
import Title from './Title';

const Banner = ({ guideRef }) => {
  const smoothScroll = useCallback(() => {
    const top = guideRef?.current?.getBoundingClientRect()?.top - 50 ?? 0;
    window.scrollTo({
      top: top + window.pageYOffset,
      behavior: 'smooth',
    });
  }, [guideRef]);

  return (
    <div>
      <section
        className="h-[var(--section-height)] relative flex flex-col justify-evenly"
      >
        <div className="mx-auto min-w-[600px] max-md:min-w-auto max-md:w-[80%] max-md:pt-[10vh]">
          <Title />
          <SearchField />
        </div>
        <div>
          <TypographyTitle
            as="h3"
            size="lg"
            className="tracking-[0.08em] text-[#f0f0f0] font-medium text-center text-[26px] m-5"
          >
            還不知道要學什麼嗎？
          </TypographyTitle>
          <div className="flex justify-center items-center my-2.5">
            <Button
              onClick={smoothScroll}
              className="bg-white opacity-80 hover:bg-white hover:opacity-100 text-black"
            >
              看看大家都學什麼
            </Button>
          </div>
        </div>
      </section>
      <BannerVideo />
    </div>
  );
};

export default Banner;
