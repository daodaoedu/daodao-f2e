import { keyframes, css } from '@emotion/react';
import styled from '@emotion/styled';
import MenuItem from './MenuItem';

const appearFrames = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const slideInFrames = keyframes`
  0% {
    transform: translateX(-2%);
  }
  100% {
    transform: translateX(0);
  }
`;

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
    z-Index: 100;
`;

const MenuListWrapper = styled.div`
    padding: 3rem;
    margin-top: 30px;
    position: relative;
    z-index: 100;
`;

const MenuItemWrapper = styled.li`
    animation: 1s ${appearFrames} forwards;
    ${(props) => css`
    animation-delay: ${props.delay};
    `}
`;

const ItemWrapper = styled.div`
      font-size: 30px;
      padding: 1rem 0;
      margin: 0 5%;
      cursor: pointer;
      color:#fafafa;
      transition: color 0.2s ease-in-out;
      animation: 0.5s ${slideInFrames} forwards;
      ${(props) => css`
    animation-delay: ${props.delay};
    `}
      &:hover {
          color: 'gray';
      }
`;

const UserStatusWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px;
    color: rgba(255,255,255,0.7);
    .login, .logout {
      cursor: pointer;
    }
    .icon {
      width: 32px;
      border-radius: 50%;
    }

    .coin-field {
      display: flex;
      align-items: center;
      span {
        margin: 10px;
      }
    }
`;

const Menu = ({
  isUserLogin, open, list, onClick, onLogin, onLogout, avatar,
}) => {
  return (
    <MenuWrapper open={open}>
      {
          open && (
          <MenuListWrapper>
              {
              isUserLogin
                ? (
                  <>
                    <MenuItemWrapper>
                      <UserStatusWrapper>
                        <img className="icon" src={avatar} alt="avatar" />
                        <div className="coin-field">
                          <img className="icon" src="/coin.png" alt="coin" />
                          <span>0</span>
                        </div>
                      </UserStatusWrapper>
                    </MenuItemWrapper>
                    <MenuItemWrapper>
                      <ItemWrapper>
                        <p className="logout" onClick={onLogout} onKeyPress={onLogout} role="presentation">登出</p>
                      </ItemWrapper>
                    </MenuItemWrapper>
                  </>
                )
                : (
                  <MenuItemWrapper>
                    <ItemWrapper>
                      <p className="login" onClick={onLogin} onKeyPress={onLogin} role="presentation">登入</p>
                    </ItemWrapper>
                  </MenuItemWrapper>
                )
            }
            {
            list.map((value, index) => {
              return (
                <MenuItem
                  key={value.name}
                  delay={`${index * 0.1}s`}
                  onClick={onClick}
                  text={value.name}
                  link={value.link}
                  o
                />
              );
            })
            }
          </MenuListWrapper>
          )
        }
    </MenuWrapper>
  );
};

export default Menu;
