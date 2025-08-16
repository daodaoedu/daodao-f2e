import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const LearningResource = () => (
  <div>
    <div className="my-5">
      <Title
        as="h2"
        size="lg"
        className="mb-2.5 mt-10"
      >
        三、實驗教育場域導覽
      </Title>
      <Text>
        實驗教育場域導覽包含：公辦公營學校、公辦民營、非學校型態-機構自學和非學校型態-團體自學等。
        很開心你成為島島阿學的一員，新增後我們將由平台管理員審核並放入共用資源區。
      </Text>
    </div>
    <div className="mb-5 mt-10">
      待補
      {/* <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdE9URRYAEJj1I8b-RJ6EG4PZ_5ggm_mcGq7Jis1LFxpjXvrw/viewform?embedded=true"
          width="100%"
          height="3600"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
        >
          載入中 . . .
        </iframe> */}
    </div>
  </div>
);

export default LearningResource;
