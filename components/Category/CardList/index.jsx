import styled from '@emotion/styled';
import Card from './Card';

const CardListWrapper = styled.ul`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    li {
        margin: 20px;
    }
`;

const openPage = (event, link, type) => {
  event.preventDefault();
  window.open(link, type);
};

const CardList = ({ list, isLoading }) => {
  return (
    <CardListWrapper>
      { Array.isArray(list) && list.map((category) => (
        <Card
          key={`${category.name}-${category.link}`}
          name={category.name}
          link={category.link}
          image={category.image}
          isLoading={isLoading}
          onClick={(event) => openPage(event, category.link, '_blank')}
        />
      )) }
    </CardListWrapper>
  );
};

export default CardList;
