import { useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box } from '@mui/material';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import { setQuery } from '@/redux/actions/group';
import GroupCard from './GroupCard';

export const StyledGroupItem = styled.li`
  position: relative;
  margin-top: 1rem;
  flex-basis: 33.33%;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    z-index: 1;
    transform: scale(1.0125);
    box-shadow: 0 0 6px 2px #0001;
  }

  @media (max-width: 767px) {
    flex-basis: 50%;
  }

  @media (max-width: 560px) {
    flex-basis: 100%;
  }
`;

const StyledDivider = styled.li`
  flex-basis: 100%;
  background: #dbdbdb;
  height: 1px;
`;

const StyledGroupList = styled.ul`
  display: flex;
  flex-wrap: wrap;
`;

function GroupList() {
  const dispatch = useDispatch();
  const [getSearchParams] = useSearchParamsManager();
  const { items, isLoading } = useSelector((state) => state.group);

  const isMobileScreen = useMediaQuery('(max-width: 560px)');
  const isPadScreen = useMediaQuery('(max-width: 767px)') && !isMobileScreen;
  const isDeskTopScreen = !isPadScreen;

  useEffect(() => {
    dispatch(setQuery(getSearchParams()));
  }, [getSearchParams]);

  return (
    <>
      <StyledGroupList>
        {items?.length || isLoading ? (
          items.map((data, index) => {
            const isLast = index === items.length - 1;
            const shouldRenderDivider =
              (isMobileScreen && !isLast) ||
              (isPadScreen && !isLast && index % 2 === 1) ||
              (isDeskTopScreen && !isLast && index % 3 === 2);

            return (
              <Fragment key={data._id}>
                <StyledGroupItem>
                  <GroupCard {...data} />
                </StyledGroupItem>
                {shouldRenderDivider && <StyledDivider />}
              </Fragment>
            );
          })
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
