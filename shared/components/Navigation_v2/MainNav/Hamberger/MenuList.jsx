// import { keyframes, css } from '@emotion/react';
import styled from "@emotion/styled";
import { Box } from "@mui/material";
import MenuItem from "./MenuItem";
import UserAvatar from "./UserAvatar";
import useFirebase from "../../../../../hooks/useFirebase";

const MenuWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: ${(props) => (props.open ? "100%" : 0)};
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #16b9b3;
  opacity: 0.95;
  color: #fafafa;
  transition: height 0.3s ease;
  z-index: 100;
`;

const MenuListWrapper = styled.div`
  padding: 3rem;
  margin-top: 30px;
  position: relative;
  z-index: 100;
`;

const Menu = ({ open, list, onCloseMenu }) => {
  const { auth, user, signInWithFacebook, signOutWithFacebook } = useFirebase();
  return (
    <MenuWrapper open={open}>
      {open && (
        <MenuListWrapper>
          {user && <UserAvatar onCloseMenu={onCloseMenu} />}
          {user ? (
            <MenuItem
              key={"登出"}
              delay={`0.1s`}
              onClick={() => {
                signOutWithFacebook();
                onCloseMenu();
              }}
              text="登出"
            />
          ) : (
            <MenuItem
              key={"登入"}
              delay={`0.1s`}
              onClick={() => {
                signInWithFacebook();
              }}
              text="登入"
            />
          )}

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
