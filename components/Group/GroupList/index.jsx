import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import GroupItem from './GroupItem';

const GroupListWrapper = styled('ul')`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  overflow: hidden;
`;

function GroupList({ list, isLoading }) {
  return (
    <GroupListWrapper>
      {list?.length || isLoading ? (
        list.map((data) => <GroupItem key={data.id} {...data} />)
      ) : (
        <Box as="li" sx={{ textAlign: 'center', width: '100%' }}>
          哎呀！這裡好像沒有符合你條件的揪團，別失望！讓我們試試其他選項。
        </Box>
      )}
    </GroupListWrapper>
  );
}

export default GroupList;
