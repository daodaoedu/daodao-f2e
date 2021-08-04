import styled from '@emotion/styled';
import Card from './Card';

const CardListWrapper = styled.ul`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding-top: 20px;
    padding-bottom: 20px;
    li {
        margin: 20px;
    }
`;

const CardList = ({ list }) => {
  return (
    <CardListWrapper>
      { list.map((category) => <Card key={category.title} title={category.title} link={category.link} image={category.image} />) }
    </CardListWrapper>
  );
};

export default CardList;
