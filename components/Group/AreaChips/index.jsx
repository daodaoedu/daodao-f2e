import { useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { AREAS } from '@/constants/areas';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import AreaChip from './AreaChip';

const ListWrapper = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const AreaChips = () => {
  const [getSearchParams, pushState] = useSearchParamsManager();

  const currentArea = useMemo(
    () =>
      getSearchParams('area').filter((area) =>
        AREAS.find(({ name }) => name === area),
      ),
    [getSearchParams],
  );

  const handleClickArea = useCallback(
    (event) => {
      const targetArea = event.target.parentNode.textContent;
      const areas = currentArea.filter((area) => area !== targetArea);

      pushState('area', areas.toString());
    },
    [pushState, currentArea],
  );

  return (
    currentArea.length > 0 && (
      <ListWrapper>
        {currentArea.map((name) => (
          <AreaChip key={name} value={name} onDelete={handleClickArea} />
        ))}
      </ListWrapper>
    )
  );
};

export default AreaChips;
