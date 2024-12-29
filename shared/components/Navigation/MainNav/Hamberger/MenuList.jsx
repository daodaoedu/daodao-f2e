import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import UserAvatar from '../SubList/UserAvatar';
import MenuItem from './MenuItem';
import MarathonList from './MarathonList';

const MenuWrapper = styled.div`
  position: fixed;
  top: ${(props) => props.shiftTop};
  left: 0;
  height: ${(props) => (props.open ? '100dvh' : 0)};
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: white;
  transition: height 0.3s ease;
  padding-bottom: ${(props) => (props.open ? '180px' : 0)};
  z-index: 100;
  overflow: auto;
`;

const MenuListWrapper = styled.div`
  padding: 1rem;
  position: relative;
  z-index: 100;
  height: inherit;
`;

const MenuDivider = styled.div`
  height: 1px;
  width: 100%;
  background-color: #def5f5;
  margin: 1rem 0;
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 40px;
  padding: 5px 20px;
  color: #536166;
  font-size: 16px;
  line-height: 1.4;
  border-radius: 20px;
  border: 1px solid #16b9b3;
`;

const Menu = ({ open, list, onCloseMenu, shiftTop = '80px' }) => {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  return (
    <MenuWrapper open={open} shiftTop={shiftTop}>
      {open && (
        <MenuListWrapper>
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
          <MarathonList onCloseMenu={onCloseMenu} />
          <MenuDivider />
          {auth.isLoggedIn ? (
            <UserAvatar user={auth.user} onCloseMenu={onCloseMenu} />
          ) : (
            <LoginButton onClick={() => authDispatch.openLoginModal()}>
              登入
            </LoginButton>
          )}
        </MenuListWrapper>
      )}
    </MenuWrapper>
  );
};

export default Menu;
