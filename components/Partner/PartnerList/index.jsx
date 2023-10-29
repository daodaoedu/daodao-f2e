import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Box } from '@mui/material';
import PartnerCard from './PartnerCard';

const LIST = [
  {
    id: 1,
    name: '許浪手',
    image:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    subTitle: '實驗教育老師',
    canShare: '心智圖法',
    canTogether: '學習交流、教學相長',
    tagList: ['tag1', 'tag2', 'tag3'],
    location: '台北市松山區',
    share: '',
    wantToDoList: [],
  },
  {
    id: 2,
    name: '許浪手2',
    image:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    subTitle: '實驗教育老師',
    canShare: 'make-friends',
    canTogether: '學習交流、教學相長',
    tagList: ['tag1', 'tag2'],
    location: '台北市松山區',
    date: '兩天前更新',
    share: '',
    wantToDoList: [],
  },
  {
    id: 3,
    name: '許浪手3',
    image:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    subTitle: '實驗教育老師',
    canShare: '心智圖法',
    canTogether: '學習交流、教學相長',
    tagList: ['tag12', 'tag2'],
    location: '台北市松山區',
    date: '兩天前更新',
    share: '',
    wantToDoList: [],
  },
  {
    id: 4,
    name: '許浪手4',
    image:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    subTitle: '實驗教育老師',
    canShare: '心智圖法',
    canTogether: '學習交流、教學相長',
    tagList: ['tag1', 'tag2'],
    location: '台北市松山區',
    date: '兩天前更新',
    share: '',
    wantToDoList: [],
  },
];

function PartnerList() {
  // TODO: get data from backend
  // const user = useSelector((state) => state.user);
  // const userURL = `http://localhost:3000/user/all_User`;
  const lists = LIST;
  return (
    <Grid
      container
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {lists.map((item, idx) => (
        <>
          <Grid item xs={6}>
            <PartnerCard
              key={`${item.id}-${item.name}`}
              id={item.id}
              image={item.image}
              name={item.name}
              subTitle={item.subTitle}
              share={item.share}
              roleList={item.roleList}
              tagList={item.tagList}
              wantToDoList={item.wantToDoList}
              location={item.location}
            />
          </Grid>
          {(idx + 1) % 2 == 0 && idx + 1 !== lists.length && (
            <Grid item xs={12} py={'12px'}>
              <Box height={1} width={'100%'} border={'1px solid #E5E5E5'} />
            </Grid>
          )}
        </>
      ))}
    </Grid>
  );
}

export default PartnerList;
