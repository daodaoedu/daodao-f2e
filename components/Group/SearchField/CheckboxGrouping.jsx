import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

export default function CheckboxGrouping() {
  const QUERY_KEY = 'isGrouping';
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleClick = ({ target: { checked } }) => {
    pushState(QUERY_KEY, checked || '');
  };

  const checkbox = (
    <Checkbox
      size="small"
      checked={Boolean(getSearchParams(QUERY_KEY).length)}
      onChange={handleClick}
      name={QUERY_KEY}
      sx={{ p: 0.5 }}
    />
  );

  return (
    <FormControlLabel
      label="揪團中"
      control={checkbox}
      sx={{
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '140%',
        color: '#536166',
      }}
    />
  );
}
