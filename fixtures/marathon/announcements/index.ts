import fixture1 from './1.json';
import fixture2 from './2.json';
import fixture3 from './3.json';

const announcementItems = [fixture1, fixture2, fixture3]
  .map((item, index) => ({
    ...item,
    id: `${index + 1}`,
    author: '島小編',
    tags: ['實驗教育實驗教育', '實驗教育實驗教育'],
    times: '2025 / 01 / 05',
  }))
  .reverse();

export { announcementItems };
