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

const CardList = ({ list }) => {
  return (
    <CardListWrapper>
      { list.map((category) => <Card key={category.title} title={category.title} link={category.link} />) }
    </CardListWrapper>
  );
};

export default CardList;
