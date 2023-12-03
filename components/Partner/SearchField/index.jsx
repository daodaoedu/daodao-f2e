import styled from '@emotion/styled';
import SearchInput from './SearchInput';
import SelectedAreas from './SelectedAreas';
import SelectedEducationStep from './SelectedEducationStep';
import SelectedFriendType from './SelectedFriendType';
import SearchTags from './SearchTags';

const StyledSearchField = styled.div`
  width: 100%;
  border-radius: 20px;
  box-shadow: 0px 4px 6px rgba(196, 194, 193, 0.2);
  padding: 40px;
  z-index: 2;
  background: #fff;

  @media (max-width: 767px) {
    padding: 16px;
  }
  .selects-wrapper {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 767px) {
      margin: 10px 0;
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

const SearchField = () => {
  return (
    <StyledSearchField>
      <SearchInput />
      <div className="selects-wrapper">
        <SelectedFriendType />
        <SelectedAreas />
        <SelectedEducationStep />
      </div>
      <SearchTags />
    </StyledSearchField>
  );
};

export default SearchField;
