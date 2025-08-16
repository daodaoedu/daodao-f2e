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
        className="relative flex h-[var(--section-height)] flex-col justify-evenly"
      >
        <div className="max-md:min-w-auto mx-auto min-w-[600px] max-md:w-[80%] max-md:pt-[10vh]">
          <Title />
          <SearchField />
        </div>
        <div>
          <TypographyTitle
            as="h3"
            size="lg"
            className="m-5 text-center text-[26px] font-medium tracking-[0.08em] text-[#f0f0f0]"
          >
            還不知道要學什麼嗎？
          </TypographyTitle>
          <div className="my-2.5 flex items-center justify-center">
            <Button
              onClick={smoothScroll}
              className="bg-white text-black opacity-80 hover:bg-white hover:opacity-100"
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
