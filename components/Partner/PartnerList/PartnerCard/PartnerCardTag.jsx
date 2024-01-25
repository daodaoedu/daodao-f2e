import { StyledTagContainer, StyledTagText } from './PartnerCard.styled';

const PartnerCardTag = ({ tagList = [] }) => {
  const showItems = tagList.slice(0, 5);
  const hideItems = tagList.slice(5);
  return (
    tagList.length > 0 && (
      <StyledTagContainer container gap="8px" mb="12px">
        {showItems
          .filter((t) => typeof t === 'string' && t.trim() !== '')
          .map((tag) => (
            <StyledTagText item key={tag} fontWeight="400">
              {tag}
            </StyledTagText>
          ))}
        {hideItems.length > 0 && (
          <StyledTagText fontWeight="bold">{hideItems.length}</StyledTagText>
        )}
      </StyledTagContainer>
    )
  );
};

export default PartnerCardTag;
