import { StyledTagContainer, StyledTagText } from './PartnerCard.styled';

const PartnerCardTag = ({ tagList = [] }) => {
  const showItems = tagList.slice(0, 5);
  const hideItems = tagList.slice(5);
  return (
    <StyledTagContainer container gap={'8px'} mb={'12px'}>
      {showItems.map((tag, idx) => (
        <StyledTagText item key={idx + tag} fontWeight={'400'}>
          {tag}
        </StyledTagText>
      ))}
      {hideItems.length > 0 && (
        <StyledTagText fontWeight={'bold'}>{hideItems.length}</StyledTagText>
      )}
    </StyledTagContainer>
  );
};

export default PartnerCardTag;
