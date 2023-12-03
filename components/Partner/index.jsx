import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import PartnerList from './PartnerList';
import SearchField from './SearchField';
import SearchParamsList from './SearchParamsList';
import Banner from './Banner';
import {
  StyledWrapper,
  StyledContent,
  StyledSearchWrapper,
} from './Parnter.styled';

function Partner() {
  const mobileScreen = useMediaQuery('(max-width: 767px)');
  const partners = useSelector((state) => state.partners);

  return (
    <>
      <Banner />
      <StyledWrapper>
        <StyledSearchWrapper>
          <SearchField />
        </StyledSearchWrapper>
        <StyledContent>
          <SearchParamsList paramsKey={['area', 'role', 'edu']} />
          <PartnerList />
        </StyledContent>
        {partners.items.length > 0 && (
          <Box
            sx={
              mobileScreen
                ? { textAlign: 'center', padding: '32px 0 80px' }
                : { textAlign: 'center', padding: '72px 0 100px' }
            }
          >
            <Button
              variant="outlined"
              sx={{
                fontSize: '16px',
                color: '#536166',
                borderColor: '#16B9B3',
                borderRadius: '20px',
                padding: '6px 48px',
              }}
            >
              顯示更多
            </Button>
          </Box>
        )}
      </StyledWrapper>
    </>
  );
}

export default Partner;
