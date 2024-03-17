import { StyledPanelBox, StyledPanelText } from './UserTabs.styled';

function UserInfoBasic({ description = '', wantToDoList = [], share = '' }) {
  return (
    <StyledPanelBox>
      <StyledPanelText
        sx={{ borderBottom: '1px solid #F3F3F3', paddingBottom: '6px' }}
      >
        <p>可分享</p>
        <span>{share || '尚未填寫'}</span>
      </StyledPanelText>
      <StyledPanelText
        sx={{ borderBottom: '1px solid #F3F3F3', padding: '6px 0' }}
      >
        <p>想一起</p>
        <span>{wantToDoList || '尚未填寫'}</span>
      </StyledPanelText>
      <StyledPanelText sx={{ paddingTop: '6px' }}>
        <p>簡介</p>
        <div>
          {description
            ? description.split('\n').map((d) => <span>{d}</span>)
            : '尚未填寫'}
        </div>
      </StyledPanelText>
    </StyledPanelBox>
  );
}

export default UserInfoBasic;
