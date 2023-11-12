import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Box, Button } from '@mui/material';
import AreaChips from './AreaChips';
import Banner from './Banner';
import SearchField from './SearchField';
import SelectedCategory from './SelectedCategory';
import GroupList from './GroupList';

const StyledGroup = styled.div`
  position: relative;
  margin: 70px auto 0;
  width: 924px;

  @media (max-width: 1024px) {
    width: 768px;
  }

  @media (max-width: 800px) {
    padding: 0 16px;
    width: 100%;
  }
`;

const ContainerWrapper = styled(Box)`
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0px 4px 6px rgba(196, 194, 193, 0.2);
  background: #fff;
  z-index: 2;
`;

const createTemplate = (_, id) => ({
  id,
  title: '颱風天不衝浪要幹嘛',
  photoURL:
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
  photoAlt: '封面圖',
  category: ['語言與文學', '人文社會', '自然科學', '生活'],
  partnerEducationStep: '高中',
  description:
    '希望能像朋友，一起讀有興趣的科目，每週1-2次見面練習這兩種，每次總時數2-3小時不限，希望你跟我一樣很想追求有效進步也不怕辛苦！一起讀日文也可以喔！',
  area: '台北市',
});

const mockData = (length) =>
  new Promise((res) =>
    setTimeout(() => {
      res(Array.from({ length }, createTemplate));
    }, 600),
  );

function Group() {
  const [total, setTotal] = useState(12);
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setDataAndLoaded = (data) => {
      setList(data);
      setIsLoading(false);
    };

    setIsLoading(true);
    mockData(total).then(setDataAndLoaded);
  }, [total]);

  return (
    <Box sx={{ background: '#f3fcfc' }}>
      <Banner />
      <StyledGroup>
        <ContainerWrapper>
          <SearchField />
          <SelectedCategory />
        </ContainerWrapper>
        <ContainerWrapper as="main" sx={{ marginTop: '24px' }}>
          <AreaChips />
          <GroupList list={list} isLoading={isLoading} />
          {isLoading && (
            <Box sx={{ textAlign: 'center', paddingTop: '32px' }}>
              搜尋揪團中～
            </Box>
          )}
        </ContainerWrapper>
      </StyledGroup>
      <Box
        sx={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '100px' }}
      >
        <Button
          variant="outlined"
          sx={{
            fontSize: '16px',
            color: '#536166',
            borderColor: '#16B9B3',
            borderRadius: '20px',
            padding: '6px 48px',
          }}
          onClick={() => setTotal((pre) => pre + 12)}
        >
          顯示更多
        </Button>
      </Box>
    </Box>
  );
}

export default Group;
