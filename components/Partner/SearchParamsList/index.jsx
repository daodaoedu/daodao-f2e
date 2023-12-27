import { useMemo } from 'react';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import {
  StyledGrid,
  StyledGridItem,
  StyledTag,
  StyledTagText,
  StyledClosed,
} from './SearchParamsList.styles';

const SearchParamsList = ({ paramsKey = [], paramsKeyOptions = {} }) => {
  const [getSearchParams, pushState, genParamsItems] = useSearchParamsManager();

  const params = useMemo(
    () =>
      Array.isArray(paramsKey)
        ? genParamsItems(paramsKey, paramsKeyOptions)
        : [],
    [getSearchParams],
  );

  const handleDelete = (key, val) => {
    pushState(
      key,
      getSearchParams(key)
        .filter((v) => v !== val)
        .toString(),
    );
  };

  return (
    params.length > 0 && (
      <StyledGrid container gap="10px" mb="16px">
        {params.map((item) =>
          item.values.map((val) => (
            <StyledGridItem item key={val}>
              <StyledTag>
                <StyledTagText>{val}</StyledTagText>
                <StyledClosed
                  onClick={() => {
                    handleDelete(item.key, val);
                  }}
                />
              </StyledTag>
            </StyledGridItem>
          )),
        )}
      </StyledGrid>
    )
  );
};

export default SearchParamsList;
