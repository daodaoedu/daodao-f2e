import styled from '@emotion/styled';
import SearchInput from './SearchInput';
import SelectedAreas from './SelectedAreas';
import SelectedActivityCategoryStep from './SelectedActivityCategoryStep';
import SelectedEducationStep from './SelectedEducationStep';
import CheckboxGrouping from './CheckboxGrouping';

const StyledSearchField = styled.div`
  margin-top: 8px;
  width: 100%;

  .selects-wrapper {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 1024px) {
      > * {
        max-width: 180px;
      }
    }

    @media (max-width: 767px) {
      margin: 10px 0;
      flex-direction: column;
      align-items: stretch;
      > * {
        max-width: none;
      }
    }
  }
`;

const SearchField = () => {
  return (
    <StyledSearchField>
      <SearchInput />
      <div className="selects-wrapper">
        <SelectedAreas />
        <SelectedActivityCategoryStep />
        <SelectedEducationStep />
        <CheckboxGrouping />
      </div>
    </StyledSearchField>
  );
};

export default SearchField;
