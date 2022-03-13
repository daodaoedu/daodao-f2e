import styled from '@emotion/styled';

const MenuButtonWrapper = styled.div`
    height: '32px';
    width: '32px';
    display:'flex';
    flex-direction: 'column';
    justify-content: 'center';
    align-items: 'center';
    cursor: 'pointer';
    padding: '4px';
    position: relative;
    z-index: 100;
    cursor: pointer;
`;

const MenuButton = ({ onClick, color, open }) => {
  const styles = {
    container: {
      height: '32px',
      width: '32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '4px',
      position: 'relative',
      zIndex: 150,
    },
    line: {
      height: '2px',
      width: '20px',
      background: color,
      transition: 'all 0.2s ease',
    },
    lineTop: {
      transform: open ? 'rotate(45deg)' : 'none',
      transformOrigin: 'top left',
      marginBottom: '5px',
    },
    lineMiddle: {
      opacity: open ? 0 : 1,
      transform: open ? 'translateX(-16px)' : 'none',
    },
    lineBottom: {
      transform: open ? 'translateX(-1px) rotate(-45deg)' : 'none',
      transformOrigin: 'top left',
      marginTop: '5px',
    },
  };
  return (
    <MenuButtonWrapper
      onClick={onClick}
    >
      <div style={{ ...styles.line, ...styles.lineTop }} />
      <div style={{ ...styles.line, ...styles.lineMiddle }} />
      <div style={{ ...styles.line, ...styles.lineBottom }} />
    </MenuButtonWrapper>
  );
};

export default MenuButton;
