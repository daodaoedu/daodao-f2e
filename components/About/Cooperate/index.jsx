/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Title } from '@/components/ui/typography';

const Cooperate = () => (
  <section className="my-5">
    <Title
      as="h2"
      size="lg"
      className="mt-10 mb-2.5"
    >
      合作夥伴
    </Title>
    <div className="flex flex-wrap items-center gap-4">
      <div className="bg-black">
        <a
          href="https://grants.g0v.tw/power/?from=daoedu.tw"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://grants.g0v.tw/power/images/g0v-logo.svg"
            className="h-8 w-52"
            alt="g0v零時政府"
          />
        </a>
      </div>
      <div>
        <a
          href="https://sch001.g0v.tw/?from=daoedu.tw"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://sch001.g0v.tw/assets/img/main_new.jpg"
            className="h-32"
            alt="g0v零時小學校"
          />
        </a>
      </div>
      <div>
        <a
          href="https://zashare.org/?from=daoedu.tw"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://i.imgur.com/QpMVwqe.png"
            className="h-32"
            alt="雜學校"
          />
        </a>
      </div>
      <div>
        <a
          href="https://www.parenting.com.tw/?from=daoedu.tw"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://www.parenting.com.tw/files/images/fb_share.png"
            className="h-32"
            alt="親子天下"
          />
        </a>
      </div>
      <div>
        <a
          href="https://codingbar.ai/?from=daoedu.tw"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://i.imgur.com/n6GG0vF.png"
            className="h-32"
            alt="Coding bar"
          />
        </a>
      </div>
    </div>
  </section>
);

export default Cooperate;
