import { CustomLink } from '@/shared/ui/custom-link';
import React from 'react';
import { Title, Text } from '@/shared/ui/typography';
import { SOCIAL_LINKS } from '@/shared/constants';

export const ContactUs = () => (
  <address className="my-5">
    <Title as="h2" size="lg" className="mb-2.5 mt-10">
      聯絡我們
    </Title>
    <div className="m-5 flex flex-col">
      <Text className="my-1.5">
        <CustomLink
          target="_blank"
          href={SOCIAL_LINKS.FACEBOOK}
          rel="noopener noreferrer"
          className="no-underline transition-colors hover:text-primary hover:opacity-100"
        >
          🏝️ 島島阿學的 Facebook
        </CustomLink>
      </Text>
      <Text className="my-1.5">
        <CustomLink
          target="_blank"
          href={SOCIAL_LINKS.INSTAGRAM}
          rel="noopener noreferrer"
          className="no-underline transition-colors hover:text-primary hover:opacity-100"
        >
          🏝️ 島島阿學的 Instagram
        </CustomLink>
      </Text>
      <Text className="my-1.5">
        <CustomLink
          target="_blank"
          href={`mailto:${SOCIAL_LINKS.EMAIL}`}
          rel="noopener noreferrer"
          className="no-underline transition-colors hover:text-primary hover:opacity-100"
        >
          🏝️ 島島阿學的信箱 – contact@daoedu.tw
          <br />
        </CustomLink>
      </Text>
    </div>
  </address>
);
