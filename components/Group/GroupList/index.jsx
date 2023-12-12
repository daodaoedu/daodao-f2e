import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { AREAS } from '@/constants/areas';
import { CATEGORIES } from '@/constants/category';
import { EDUCATION_STEP } from '@/constants/member';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import { setQuery } from '@/redux/actions/group';
import GroupCard from './GroupCard';

export const StyledGroupItem = styled.li`
  position: relative;
  margin-top: 1rem;
  flex-basis: 33.33%;
  border-bottom: 1px solid #dbdbdb;

  &:nth-of-type(1) {
    margin-top: 0;
  }

  &:nth-last-of-type(1) {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    flex-basis: calc(50% - 12px);
  }

  @media (min-width: 767px) {
    &:nth-of-type(3) {
      margin-top: 0;
    }

    &:nth-last-of-type(3) {
      border-bottom: none;
    }
  }

  @media (max-width: 560px) {
    flex-basis: calc(100% - 24px);
  }

  @media (min-width: 560px) {
    &:nth-of-type(2) {
      margin-top: 0;
    }

    &:nth-last-of-type(2) {
      border-bottom: none;
    }
  }
`;

const StyledGroupList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

function GroupList() {
  const dispatch = useDispatch();
  const [getSearchParams] = useSearchParamsManager();
  const { items, isLoading } = useSelector((state) => state.group);

  useEffect(() => {
    const filterOptions = {
      area: AREAS,
      category: CATEGORIES,
      edu: EDUCATION_STEP,
      grouping: true,
      q: true,
    };
    const params = {};
    const searchParams = getSearchParams();
    Object.keys(filterOptions).forEach((key) => {
      const searchParam = searchParams[key];
      const options = filterOptions[key];

      if (searchParam && options) {
        params[key] = Array.isArray(options)
          ? searchParam
              .split(',')
              .filter((item) => options.some((option) => option.label === item))
              .join(',')
          : searchParam;
      }
    });
    dispatch(setQuery(params));
  }, [getSearchParams]);

  return (
    <>
      <StyledGroupList>
        {items?.length || isLoading ? (
          items.map((data) => (
            <StyledGroupItem key={data.id}>
              <GroupCard {...data} />
            </StyledGroupItem>
          ))
        ) : (
          <li style={{ textAlign: 'center', width: '100%' }}>
            哎呀！這裡好像沒有符合你條件的揪團，別失望！讓我們試試其他選項。
          </li>
        )}
      </StyledGroupList>

      {isLoading && (
        <Box sx={{ textAlign: 'center', paddingTop: '32px' }}>搜尋揪團中～</Box>
      )}
    </>
  );
}

export default GroupList;
