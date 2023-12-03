import { useMemo } from 'react';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import {
  StyledGrid,
  StyledGridItem,
  StyledTag,
  StyledTagText,
  StyledClosed,
} from './SearchParamsList.styles';

const SearchParamsList = ({ paramsKey = [] }) => {
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleGenerateParams = (params) => {
    return params.reduce(
      (acc, param) => [...acc, { values: getSearchParams(param), key: param }],
      [],
    );
  };
  const params = useMemo(
    () => (Array.isArray(paramsKey) ? handleGenerateParams(paramsKey) : []),
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
      <StyledGrid container gap={'10px'} mb={'16px'}>
        {params.map((item, idx) =>
          item.values.map((val) => (
            <StyledGridItem item key={val + idx}>
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
