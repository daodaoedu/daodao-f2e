// import { keyframes, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import MenuItem from './MenuItem';
import UserAvatar from '../SubList/UserAvatar';
import { useSelector } from 'react-redux';

const MenuWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: ${(props) => (props.open ? '100%' : 0)};
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #16b9b3;
  opacity: 0.95;
  color: #fafafa;
  transition: height 0.3s ease;
  z-index: 100;
  overflow: auto;
`;

const MenuListWrapper = styled.div`
  padding: 3rem;
  margin-top: 30px;
  position: relative;
  z-index: 100;
`;

const Menu = ({ open, list, onCloseMenu }) => {
  const router = useRouter();


  const user = useSelector((state) => state.user);
  console.log("MenuList", user);
  return (
    <MenuWrapper open={open}>
      {open && (
        <MenuListWrapper>
          <UserAvatar user={user} />
          {list.map((value, index) => {
            return (
              <MenuItem
                key={value.name}
                delay={`${index * 0.1}s`}
                onClick={onCloseMenu}
                text={value.name}
                link={value.link}
              />
            );
          })}
        </MenuListWrapper>
      )}
    </MenuWrapper>
  );
};

export default Menu;
