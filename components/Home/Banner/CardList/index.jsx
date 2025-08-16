import Card from './Card';

const CardList = ({ list }) => (
  <ul className="flex flex-wrap items-center justify-center pb-5 pt-5 [&>li]:m-5">
    {list.map((category) => (
      <Card
        key={category.title}
        title={category.title}
        link={category.link}
        image={category.image}
      />
    ))}
  </ul>
);

export default CardList;
