import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AREAS } from '@/constants/areas';
import { fetchPartners } from '@/redux/actions/partners';
import { EDUCATION_STEP, ROLE } from '@/constants/member';
import { SEARCH_TAGS } from '@/constants/category';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

import PartnerList from './PartnerList';
import SearchField from './SearchField';
import SearchParamsList from './SearchParamsList';
import Banner from './Banner';
import {
  StyledWrapper,
  StyledContent,
  StyledSearchWrapper,
} from './Parnter.styled';

// utils
const _compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((v, f) => f(v), x);
const _map = (arr, key) => arr.map((item) => item[key]);
const mapValues = (values, mapFn) => values.map(mapFn).join(',');

const createObjFromArrary = (arr, keyProp = 'label', valueProp = 'label') => {
  return arr.reduce(
    (obj, item) => ({
      ...obj,
      [item[keyProp]]: item[valueProp],
    }),
    {},
  );
};

// constants
const keySelections = {
  area: _map(AREAS, 'name'),
  edu: _map(EDUCATION_STEP, 'label'),
  role: _map(ROLE, 'label'),
  tag: SEARCH_TAGS['全部'],
  q: 'PASS_STRING',
};

const eduObj = createObjFromArrary(EDUCATION_STEP, 'label', 'key');
const roleObj = createObjFromArrary(ROLE, 'label', 'key');

function Partner() {
  const dispatch = useDispatch();
  const mobileScreen = useMediaQuery('(max-width: 767px)');

  // main data
  const partners = useSelector((state) => state.partners);
  const { page: current = 1, totalPages } = partners.pagination;

  // queryStr
  const [getSearchParams, _, generateParamsItems] = useSearchParamsManager();
  const searchParamsItems = useMemo(
    () =>
      generateParamsItems(['area', 'role', 'edu', 'tag', 'q'], keySelections),
    [getSearchParams],
  );

  // fetch api - params
  const findValues = (params, key) =>
    params.find((item) => item.key === key)?.values;
  const prepareData = _compose(
    ([location, educationStage, roleList, tag, search]) => ({
      location,
      educationStage,
      roleList,
      tag,
      search,
    }),
    (arg) => [
      findValues(arg, 'area').join(','),
      mapValues(findValues(arg, 'edu'), (item) => eduObj[item]),
      mapValues(findValues(arg, 'role'), (item) => roleObj[item]),
      findValues(arg, 'tag').join(','),
      findValues(arg, 'q').join(','),
    ],
  );

  const handleFetchData = (page = 1) => {
    dispatch(fetchPartners({ page, ...prepareData(searchParamsItems) }));
  };

  useEffect(() => {
    handleFetchData();
  }, [getSearchParams]);

  return (
    <>
      <Banner />
      <StyledWrapper>
        <StyledSearchWrapper>
          <SearchField />
        </StyledSearchWrapper>
        <StyledContent>
          <SearchParamsList
            paramsKey={['area', 'role', 'edu', 'tag', 'q']}
            paramsKeyOptions={keySelections}
          />
          <PartnerList />
        </StyledContent>
        {partners.items.length > 0 && current < totalPages && (
          <Box
            sx={
              mobileScreen
                ? { textAlign: 'center', padding: '32px 0' }
                : { textAlign: 'center', padding: '72px 0' }
            }
          >
            <Button
              onClick={() => handleFetchData(current + 1)}
              variant="outlined"
              sx={{
                fontSize: '16px',
                color: '#536166',
                borderColor: '#16B9B3',
                borderRadius: '20px',
                padding: '6px 48px',
              }}
            >
              顯示更多
            </Button>
          </Box>
        )}
      </StyledWrapper>
    </>
  );
}

export default Partner;
