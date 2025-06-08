import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { EDUCATION, ROLE } from '@/constants/member';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import {
  Box,
  Typography,
  Checkbox,
  Radio,
  FormControlLabel,
} from '@mui/material';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import { AREA_DELIMITER, AREAS } from '@/constants/areas';
import { useMarathon, useMarathonMutation } from '@/services/marathons';
import { mapToTable } from '@/utils/helper';

import marathonConfig from '@/constants/marathon';
import {
  StyledSection,
  StyledButtonGroup,
  StyledButton,
  StyledGroup
} from './Edit.styled';
import MilestoneGroup from './MilestoneGroup';
import ApplyClosePopup from '../ApplyClosePopup';

const AREAS_TABLE = mapToTable(AREAS);

const StyledMarathonTitleSection = styled(Box)`
  padding: 10px;
  width: 100%;

  .tag {
    display: inline-block;
    width: auto;
    padding: 3px 10px;
    border-radius: 4px;
    background-color: #DEF5F5;

    span {
      color: #16B9B3;
      font-size: 12px;
      font-weight: 500;
      line-height: 140%;
      display: flex;
      gap: 4px;
      align-items: center;

      &:before {
        content: "";
        display: block;
        width: 8px;
        height: 8px;
        background-color: #16B9B3;
        border-radius: 100%;  
      }
    }
  }

  h2 {
    margin-top: 8px;
    color: #536166;
    font-size: 22px;
    font-style: normal;
    font-weight: 700;
    line-height: 140%;
  }
`;
const StyledSectionTitle = styled(Typography)`
  color: #293A3D;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 140%;
  margin-bottom: 8px;
`;
const StyledDivider = styled.hr`
  margin: 20px 0;
`;
const StyledUserSection = styled.div`
  width: 100%;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #DBDBDB;
  background-color: #FFF;
  margin-top: 16px;

  .content {
    width: 88%; 
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .avatar {
    width: 40px;
    height: 40px;
    margin-right: 12px;
    border-radius: 100%;
  }
  
  .user {
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin-right: 10px;
  }

  .userName {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 500;
    line-height: 140%;
  }

  .userType {
    font-size: 14px;
    font-weight: 400;
    line-height: 140%;
  }

  .userTags {
    flex-grow: 1;
    margin-bottom: auto;
  }

  .userTags .tag {
    color: #293A3D;
    font-size: 14px;
    font-weight: 400;
    line-height: 140%;
    border-radius: 4px;
    padding: 3px 10px;
    background: #F3F3F3;
  }

  .location {
    margin-bottom: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    color: #536166;
    font-family: "Noto Sans TC";
    font-size: 14px;
    font-weight: 400;
    line-height: 140%;
    
    .MuiSvgIcon-root {
      width: 16px;
      height: 16px; 
      margin-right: 4px; 
    }
  }
`;

const StyledTags = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  
  .tag {
    padding: 2px 8px;
    border-radius: 4px;
    background-color: #DEF5F5;
  }

  .tag span {
    font-size: 14px;
    font-weight: 400;
    line-height: 140%; 
    color: #293A3D;
  }
`;
const StyledFormControlLabel = styled(FormControlLabel)`
  margin: 0;

  .MuiRadio-root.Mui-disabled,
  .MuiCheckbox-root.Mui-disabled {
    padding: 0;
    margin-right: 4px;
    color: rgba(22, 185, 179, 0.5);
  }
  .MuiFormControlLabel-label.Mui-disabled {
    color: #293A3D;
  }
`;
const StyledParagraph = styled.p`
  font-size: 16px;
  font-weight: 400;
  line-height: 140%; 
  color: #011416;
`;
const StyledNote = styled(Typography)`
  font-size: 14px;
  font-weight: 400;
  line-height: 140%;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default function ConfirmForm({
  setCurrentStep,
  currentStep,
}) {
  const { data: marathonState = {} } = useMarathon();
  const { user: userState } = useAuth();
  const { createMutation, updateMutation } = useMarathonMutation();
  const router = useRouter();
  const { openLoginModal } = useAuthDispatch();
  const [user, setUser] = useState({
    name: "",
    token: "",
    roleList: "",
    education: "",
    avatar: ""
  });
  const popupRef = useRef(null);

  const onPrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  useEffect(() => {
    if (userState._id) {
      let userLocation = userState?.location;
      let userRole = userState?.roleList;
      let userEdu = userState?.educationStage;

      if (userState?.location?.length > 1) {
        if (userState?.location.includes(AREA_DELIMITER)) {
          const city = userState?.location.split(AREA_DELIMITER)[1];
          userLocation = AREAS_TABLE[city] ?? city;
        } else {
          userLocation = userState?.location;
        }
      }

      if (userState?.roleList?.length) {
        userRole = ROLE.find((item) => item.key === userState.roleList[0])?.label;
      }

      if (userState?.educationStage) {
        userEdu = EDUCATION.find((item) => item.key === userState.educationStage)?.label;
      }
      setUser({
        name: userState.name,
        token: userState.token,
        role: userRole,
        education: userEdu,
        avatar: userState.photoURL,
        location: userLocation
      });
    } else {
      openLoginModal();
    }
  }, [userState, openLoginModal]);
  const onSubmit = async () => {
    if (!marathonConfig.isMarathonApplyEnabled) {
      popupRef.current.showPopup();
      return;
    } else {
      popupRef.current.hidePopup();
    }
    if (!marathonState) {
      console.error('no data to submit');
      return;
    }

    const submitData = {
      ...marathonState,
      userId: userState._id,
      status: 'Complete'
    };

    if (marathonState._id) {
      updateMutation.trigger({ id: marathonState._id, ...submitData });
      localStorage.removeItem('newMarathon');
    } else {
      // if first time signup, create profile
      createMutation.trigger(submitData);
      localStorage.removeItem('newMarathon');
    }
  };

  useEffect(() => {
    switch (marathonState.apiStateWithType) {
      case 'updateMarathonProfileSuccess': {
        toast.success('更新成功');
        router.push(`/learning-marathon/profile?id=${marathonState._id}`);
        break;
      }
      case 'createMarathonProfileByTokenSuccess': {
        toast.success('申請成功');
        router.push('/learning-marathon/success');
        break;
      }
      case 'updateMarathonProfileFailure': {
        toast.error('更新失敗');
        break;
      }
      case 'createMarathonProfileByTokenFailure': {
        toast.error('申請失敗');
        break;
      }
      default:
    }
  }, [marathonState.apiStateWithType]);

  return (
    <>
      <StyledMarathonTitleSection>
        <div className="tag">
          <span>學習計畫</span>
        </div>
        <h2>學習主題名稱：{marathonState?.title}</h2>
      </StyledMarathonTitleSection>
      <StyledUserSection>
        <div className="content">
          <img src={user?.avatar} className="avatar" alt="" />
          <div className="user">
            <span className="userName">{user?.name}</span>
            <span className="userType">{user?.role}</span>
          </div>
          <div className="userTags">
            <span className="tag">{user?.education}</span>
          </div>
          <span className="location"><LocationOnOutlinedIcon />{user?.location}
          </span>
        </div>
      </StyledUserSection>
      <StyledSection sx={{ mt: '16px' }}>
        <StyledSectionTitle component="h3">計畫簡述</StyledSectionTitle>
        <StyledParagraph>{marathonState?.description}</StyledParagraph>
        <StyledDivider />
        <StyledSectionTitle component="h3">學習動機</StyledSectionTitle>
        <StyledTags sx={{ marginBottom: '8px' }}>
          {marathonState?.motivation?.tags?.map((tag) => {
            return (
              <div className="tag" key={tag}>
                <span>{tag}</span>
              </div>
            );
          })}
        </StyledTags>
        <p>{marathonState?.motivation?.description || ''}</p>
        <StyledDivider />
        <StyledSectionTitle component="h3">學習目標</StyledSectionTitle>
        <StyledParagraph>{marathonState?.goals}</StyledParagraph>
        <StyledDivider />
        <StyledSectionTitle component="h3">學習內容</StyledSectionTitle>
        <StyledParagraph>{marathonState?.content}</StyledParagraph>
        <StyledDivider />
        <StyledSectionTitle component="h3">學習方法與策略</StyledSectionTitle>
        <StyledTags sx={{ marginBottom: '8px' }}>
          {marathonState?.strategies?.tags.map((tag) => {
            return (
              <div className="tag" key={tag}>
                <span>{tag}</span>
              </div>
            );
          })}
        </StyledTags>
        <StyledParagraph>{marathonState?.strategies?.description || ''}</StyledParagraph>
        <StyledDivider />
        <StyledSectionTitle component="h3">學習資源</StyledSectionTitle>
        <Box
          sx={{
            backgroundColor: '#FFF',
            borderRadius: '8px',
            padding: '12px 16px',
            border: "1px solid #DBDBDB"
          }}
        >
          <Typography component="p">
            {marathonState?.resources}
          </Typography>
        </Box>
      </StyledSection>
      <StyledSection sx={{ mt: '16px' }}>
        <StyledGroup>
          <MilestoneGroup isDisabled milestones={marathonState?.milestones} />
        </StyledGroup>
      </StyledSection>
      <StyledSection sx={{ mt: '16px' }}>
        <StyledSectionTitle component="h3">學習成果及呈現方式</StyledSectionTitle>
        <StyledTags sx={{ marginBottom: '8px' }}>
          {marathonState?.outcomes?.tags?.map((tag) => {
            return (
              <div className="tag" key={tag}>
                <span>{tag}</span>
              </div>
            );
          })}
        </StyledTags>
        <StyledParagraph>{marathonState?.outcomes?.description || ''}</StyledParagraph>
        <StyledDivider />
        <StyledFormControlLabel
          label="是否公開給所有人看到 (馬拉松開始後才可以在活動網站上看到喔～）"
          control={
            (
              <Checkbox
                checked={!!marathonState.isPublic}
                disabled
                sx={{
                  borderRadius: '4px'
                }}
              />
            )
          }
        />
      </StyledSection>
      <StyledSection sx={{ mt: '16px' }}>
        <StyledSectionTitle component="h3">申請資格</StyledSectionTitle>
        <StyledFormControlLabel
          sx={{ marginBottom: '8px' }}
          value=""
          disabled
          control={
            (
              <Radio checked />
            )
          }
          label={marathonState?.pricing?.option}
        />
        {
          marathonState?.pricing?.file && (
            <Box sx={{ paddingLeft: '20px' }}>
              <Typography
                sx={{
                  color: '#92989A',
                  fontWeight: 400,
                  fontSize: '14px',
                  margin: '0 0 8px'
                }}
                component="p"
              >
                證明文件的連結
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#FFF',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  border: "1px solid #DBDBDB"
                }}
              >
                <Typography component="p">
                  {marathonState.pricing.file}
                </Typography>
              </Box>
            </Box>
          )
        }
        {
          marathonState?.pricing?.email?.length > 0 && (
            <>
              <Box>
                <Typography
                  sx={{
                    color: '#92989A',
                    fontWeight: 400,
                    fontSize: '14px',
                    margin: '8px 0'
                  }}
                  component="p"
                >
                  夥伴的 Email
                </Typography>
                {
                  marathonState.pricing.email.map((email) => {
                    return (
                      <Box
                        sx={{
                          backgroundColor: '#FFF',
                          marginLeft: '1em',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          border: "1px solid #DBDBDB"
                        }}
                        key={email}
                      >
                        <Typography component="p">
                          {email}
                        </Typography>
                      </Box>
                    );
                  })
                }
              </Box>
            </>
          )
        }
        <StyledNote
          component="p"
        >
          主辦單位將於申請成功後，確認並通知各申請者須繳交之費用
        </StyledNote>
      </StyledSection>
      <StyledButtonGroup>
        <StyledButton
          variant="outlined"
          onClick={onPrevStep}
        >
          上一步
        </StyledButton>
        <StyledButton
          variant="contained"
          onClick={onSubmit}
        >
          {marathonState._id ? '更新報名資料' : '提交申請'}
        </StyledButton>
      </StyledButtonGroup>
      <ApplyClosePopup
        ref={popupRef}
      />
    </>
  );
}
