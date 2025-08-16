import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const ContactUs = () => (
  <address className="my-5">
    <Title
      as="h2"
      size="lg"
      className="mt-10 mb-2.5"
    >
      聯絡我們
    </Title>
    <div className="flex flex-col m-5">
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://www.facebook.com/daodao.edu"
          rel="noopener noreferrer"
          className="text-black hover:text-[#16b9b3] hover:opacity-100 transition-colors duration-500"
        >
          🏝️ 島島阿學的 Facebook
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://www.instagram.com/daodao_edu/"
          rel="noopener noreferrer"
          className="text-black hover:text-[#16b9b3] hover:opacity-100 transition-colors duration-500"
        >
          🏝️ 島島阿學的 Instagram
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="mailto:contact@daoedu.tw"
          rel="noopener noreferrer"
          className="text-black hover:text-[#16b9b3] hover:opacity-100 transition-colors duration-500"
        >
          🏝️ 島島阿學的信箱 – contact@daoedu.tw
          <br />
        </a>
      </Text>
    </div>
  </address>
);

export default ContactUs;
