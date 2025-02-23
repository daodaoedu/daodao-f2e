import fixture1 from './1.json';
import fixture2 from './2.json';

const announcementItems = [fixture1, fixture2]
  .map((item, index) => ({
    ...item,
    id: `${index + 1}`,
    author: '島小編',
  }))
  .reverse();

export { announcementItems };
