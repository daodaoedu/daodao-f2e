import styled from '@emotion/styled';
import { TextField, Box, Typography, Icon } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const Tag = ({ label, onCancel }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: '#293A3D',
        bgcolor: '#DEF5F5',
        borderRadius: '4px',
        padding: '4px 8px',
        mr: '8px',
      }}
    >
      <Typography
        sx={{
          whiteSpace: 'nowrap',
          paddingRight: '2px',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '140%',
          mr: '4px',
        }}
      >
        {label}
      </Typography>
      <Icon
        sx={{ cursor: 'pointer', fontSize: '12px' }}
        component={CloseOutlinedIcon}
        onClick={onCancel}
      />
    </Box>
  );
};

const StyledTagsField = styled(TextField)`
  input {
    padding-left: 0;
  }
`;

function InputTags({ value = [], change }) {
  const keyDownHandle = (e) => {
    if (e.keyCode === 13) {
      if (!value.includes(e.target.value)) {
        change(e.target.value);
        e.target.value = '';
      }
    }
  };
  return (
    <StyledTagsField
      fullWidth="true"
      placeholder="搜尋或新增標籤"
      onKeyDown={keyDownHandle}
      className="input-tags"
      InputProps={
        value.length && {
          startAdornment: (
            <Box sx={{ marginTop: '5px', display: 'flex' }}>
              {Array.isArray(value) &&
                value.map(
                  (item) =>
                    typeof item === 'string' && (
                      <Tag
                        key={item}
                        label={item}
                        onCancel={() => change(item)}
                      />
                    ),
                )}
            </Box>
          ),
        }
      }
    />
  );
}

export default InputTags;
