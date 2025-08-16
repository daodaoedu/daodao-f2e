import { useRef } from 'react';
import Card from './Card';

const data = [
  {
    id: 0,
    title: '語言與文學',
    image: '/assets/images/english.png',
  },
  {
    id: 1,
    title: '資訊與工程',
    image: '/assets/images/programming.png',
  },
  {
    id: 2,
    title: '學習/教學工具',
    image: '/assets/images/digital.png',
  },
];

const CardList = () => {
  const trigger = useRef();

  return (
    <ul ref={trigger} className="flex items-center justify-between max-md:flex max-md:flex-col">
      {data.map(({ image, title, id }) => (
        <Card
          key={id}
          id={id}
          image={image}
          title={title}
          desc="學習夥伴成長中"
        />
      ))}
    </ul>
  );
};

export default CardList;
