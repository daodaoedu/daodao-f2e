import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const ContactUs = () => (
  <address className="my-5">
    <Title
      as="h2"
      size="lg"
      className="mb-2.5 mt-10"
    >
      聯絡我們
    </Title>
    <div className="m-5 flex flex-col">
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://www.facebook.com/daodao.edu"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          🏝️ 島島阿學的 Facebook
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://www.instagram.com/daodao_edu/"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          🏝️ 島島阿學的 Instagram
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="mailto:contact@daoedu.tw"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          🏝️ 島島阿學的信箱 – contact@daoedu.tw
          <br />
        </a>
      </Text>
    </div>
  </address>
);

export default ContactUs;
