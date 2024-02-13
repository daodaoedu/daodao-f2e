import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { StyledLabel, StyledGroup } from '../Form.styled';

const popperProps = {
  popper: {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -14],
        },
      },
    ],
  },
};

export default function Wrapper({ id, required, label, children, tooltip }) {
  return (
    <StyledGroup>
      <StyledLabel htmlFor={id} required={required}>
        {label}
        {tooltip && (
          <Tooltip
            title={tooltip}
            slotProps={popperProps}
            placement="top"
            arrow
          >
            <InfoOutlinedIcon sx={{ width: 14, height: 14, mx: '4px' }} />
          </Tooltip>
        )}
      </StyledLabel>
      {children}
    </StyledGroup>
  );
}
