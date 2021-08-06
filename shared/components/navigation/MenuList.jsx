import styled from '@emotion/styled';
import MenuItem from './MenuItem';

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
    position: relative;
    z-index: 100;
`;

const Menu = ({ open, list, handleLinkClick }) => {
  console.log('open ', open);
  return (
    <MenuWrapper open={open}>
      {
          open && (
          <MenuListWrapper>
            {
            list.map((value, index) => {
              return (
                <MenuItem
                  key={value.title}
                  delay={`${index * 0.1}s`}
                  onClick={handleLinkClick}
                  text={value.title}
                  link={value.link}
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
