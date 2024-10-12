import { useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import useMediaQuery from '@mui/material/useMediaQuery';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import { setQuery } from '@/redux/actions/group';
import Image from '@/shared/components/Image';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import GroupCard from './GroupCard';
import SkeletonGroupCard from './SkeletonGroupCard';

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

const StyledEmptyData = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 412px;

  p {
    margin-top: 20px;
    color: #536166;
  }

  span {
    margin-top: 6px;
    font-size: 14px;
    color: #92989a;
  }
`;

function shouldRenderDivider(
  index,
  isLast,
  isMobileScreen,
  isPadScreen,
  isDeskTopScreen,
) {
  return (
    (isMobileScreen && !isLast) ||
    (isPadScreen && !isLast && index % 2 === 1) ||
    (isDeskTopScreen && !isLast && index % 3 === 2)
  );
}

function GroupItems({ items, isMobileScreen, isPadScreen, isDeskTopScreen }) {
  return items.map((data, index) => {
    const isLast = index === items.length - 1;
    return (
      <Fragment key={data._id}>
        <StyledGroupItem>
          <GroupCard {...data} />
        </StyledGroupItem>
        {shouldRenderDivider(
          index,
          isLast,
          isMobileScreen,
          isPadScreen,
          isDeskTopScreen,
        ) && <StyledDivider />}
      </Fragment>
    );
  });
}

function SkeletonItems({ isMobileScreen, isPadScreen, isDeskTopScreen }) {
  return Array.from({ length: isMobileScreen ? 3 : 6 }, (_, index) => {
    const isLast = index === (isMobileScreen ? 2 : 5);
    return (
      <Fragment key={index}>
        <StyledGroupItem>
          <SkeletonGroupCard />
        </StyledGroupItem>
        {shouldRenderDivider(
          index,
          isLast,
          isMobileScreen,
          isPadScreen,
          isDeskTopScreen,
        ) && <StyledDivider />}
      </Fragment>
    );
  });
}

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
    <StyledGroupList>
      <GroupItems
        items={items}
        isMobileScreen={isMobileScreen}
        isPadScreen={isPadScreen}
        isDeskTopScreen={isDeskTopScreen}
      />
      {isLoading && (
        <SkeletonItems
          isMobileScreen={isMobileScreen}
          isPadScreen={isPadScreen}
          isDeskTopScreen={isDeskTopScreen}
        />
      )}
      {!isLoading && items.length === 0 && (
        <StyledEmptyData>
          <Image
            alt="查無資料"
            src={emptyCoverImg.src}
            width={160}
            height={120}
          />
          <p>哎呀！這裡沒有符合條件的揪團</p>
          <span>試著更改條件或搜尋其他關鍵字吧</span>
        </StyledEmptyData>
      )}
    </StyledGroupList>
  );
}

export default GroupList;
