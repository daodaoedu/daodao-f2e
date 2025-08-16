import React from 'react';
import { Text, Title } from '@/components/ui/typography';
import { Paper } from '@/components/ui/paper';
import LearningResource from './LearningResource';
import ActivitiesResource from './ActivitiesResource';

const ContributeResource = () => (
  <section className="pb-10 pt-10">
    <Paper className="mx-auto w-[95%] p-2.5">
      <div>
        <Title
          as="h1"
          size="xl"
          className="my-2.5"
        >
          新增資源
        </Title>
        <Text>
          我們期盼能邀請在各領域深耕已久的夥伴，
          將自身累積的資源新增至教育資源網站，讓資源透明化。
          若您願意一同共編，以下為新增資源的表單，您新增完後我們將進行審核在新增至上方資料庫中：
        </Text>
      </div>
      <div className="my-5">
        <Text>謝謝你成為彼此自學路上的橋樑。</Text>
        <Text>
          若有任何問題，歡迎與我們聯繫唷！謝謝！ Email：contact@daoedu.tw
        </Text>
      </div>
      <LearningResource />
      <ActivitiesResource />
      {/* <LocationResource /> */}
    </Paper>
  </section>
);

export default ContributeResource;
