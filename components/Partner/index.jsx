import { useMemo } from 'react';
import { Box, Button } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ABROAD_OPTION, TAIWAN_DISTRICT } from '@/constants/areas';
import { EDUCATION, ROLE } from '@/constants/member';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import { useUsers } from '@/services/modules/users';
import { useTags } from '@/services/modules/tags';

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

const createObjFromArray = (arr, keyProp = 'label', valueProp = 'label') => {
  return arr.reduce(
    (obj, item) => ({
      ...obj,
      [item[keyProp]]: item[valueProp],
    }),
    {},
  );
};

const AREAS = TAIWAN_DISTRICT.map(({ name, value }) => ({
  label: name,
  value,
})).concat(ABROAD_OPTION);

const eduObj = createObjFromArray(EDUCATION, 'label', 'key');
const roleObj = createObjFromArray(ROLE, 'label', 'key');
const areaObj = createObjFromArray(AREAS, 'label', 'value');

function Partner() {
  const mobileScreen = useMediaQuery('(max-width: 767px)');

  const { data: tags } = useTags();

  // constants
  const keySelections = {
    area: _map(AREAS, 'label'),
    edu: _map(EDUCATION, 'label'),
    role: _map(ROLE, 'label'),
    tag: tags,
    q: 'PASS_STRING',
  };

  // queryStr
  const [getSearchParams, , generateParamsItems] = useSearchParamsManager();
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
      mapValues(findValues(arg, 'area'), (item) => areaObj[item]),
      mapValues(findValues(arg, 'edu'), (item) => eduObj[item]),
      mapValues(findValues(arg, 'role'), (item) => roleObj[item]),
      findValues(arg, 'tag').join(','),
      findValues(arg, 'q').join(','),
    ],
  );

  const { data: partnerItems, hasMore, setSize } = useUsers(prepareData(searchParamsItems));

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
          <PartnerList items={partnerItems} />
        </StyledContent>
        {partnerItems && partnerItems.length > 0 && hasMore && (
          <Box
            sx={
              mobileScreen
                ? { textAlign: 'center', padding: '32px 0' }
                : { textAlign: 'center', padding: '72px 0' }
            }
          >
            <Button
              onClick={() => setSize((pre) => pre + 1)}
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
