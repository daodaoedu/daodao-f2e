/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const TechStack = () => (
  <section className="my-5">
    <Title
      as="h2"
      size="lg"
      className="mt-10 mb-2.5"
    >
      開發技術
    </Title>
    <div className="flex flex-col m-5">
      <Text className="my-1.5">
        <p className="flex flex-wrap gap-2">
          <img
            src="https://media.giphy.com/media/I2Gobnade5rqM/giphy.gif"
            className="h-20"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"
            className="h-20"
          />
          <img
            src="https://seeklogo.com/images/N/next-js-logo-8FCFF51DD2-seeklogo.com.png"
            className="h-20"
          />
          <img src="https://mui.com/static/logo.png" className="h-20" />
          <img
            src="https://raw.githubusercontent.com/emotion-js/emotion/main/emotion.png"
            className="h-20"
          />
          <img
            src="https://www.cloudflare.com/resources/images/slt3lc6tev37/CHOl0sUhrumCxOXfRotGt/9bf83d4ca877bb8f0f917c8d379a84ce/cloudflare-icon-color_3x.png"
            className="h-20"
          />
          <img
            src="https://repository-images.githubusercontent.com/175043545/92352780-93a7-11ea-805a-0e76ca033a94"
            className="h-20"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
            className="h-20"
          />
        </p>
      </Text>
      <Text className="my-1.5 font-medium">
        目前專案技術包含：React 18, NEXT.JS 12, MUI, emotion, cloudflare
        services, 🤠 wrangler, Notion, Slack bot
      </Text>
      <Text className="my-1.5 font-medium">
        島島社群的IT部夥伴從國中生到工程師都有，我們是一群夢想的追尋者，我們認為開發不應該只是開發一個產品，而是實現夢想的一種方式。
      </Text>
      <Text className="my-1.5 font-medium">
        夥伴們不定期會觀察最近有哪些新出的beta技術適合用在專案上，由於考量到開發夥伴的多樣性，因此我們的設計與技術會盡可能的親民化與保持開發彈性。選擇親民化的設計與彈性一直以來都是難以平衡的課題，因此不定期的技術研究是一件蠻重要的議題。
      </Text>
      <Text className="my-1.5 font-medium">
        為了讓非開發的夥伴也能參與修改網站部分內容或功能，目前也有設計slack聊天機器人指令執行簡單的動作。
      </Text>
    </div>
  </section>
);

export default TechStack;
