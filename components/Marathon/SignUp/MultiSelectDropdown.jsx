import styled from '@emotion/styled';
import {
  Select,
  MenuItem,
  ListItemText,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';

const StyledMenuItem = styled(MenuItem)`
  padding: 8px;
  margin-bottom: 4px;
  margin-right: 4px;
  border-radius: 4px;
`;
const StyledListItemText = styled(ListItemText)`
  .MuiTypography-root {
    color: #2D3648;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
`;
export default function MultiSelectDropdown({
  listItems = [],
  selectedItems = [],
  onChange,
  placeholder,
  type = '',
}) {
  // 設定選擇的項目

  const handleChange = (event) => {
    const value = event.target?.value;
    onChange({
      type,
      payload: {
        key: 'tags',
        value,
      },
    });
  };

  return (
    <FormControl fullWidth>
      <InputLabel>選擇項目</InputLabel>
      <Select
        multiple
        value={selectedItems}
        onChange={handleChange}
        input={<OutlinedInput label="選擇項目" />}
        renderValue={(selected) => selected.join(', ')}
        placeholder={placeholder}
        sx={{
          backgroundColor: '#DEF5F5',
          marginBottom: '8px',
        }}
        MenuProps={{
          PaperProps: {
            style: {
              padding: '12px',
              maxHeight: 300,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
            },
          },
        }}
      >
        {
          listItems.map((item) => (
            <StyledMenuItem
              key={item}
              value={item}
              style={{
                backgroundColor: selectedItems.includes(item) ? '#DEF5F5' : 'transparent',
              }}
            >
              <StyledListItemText
                primary={item}
              />
            </StyledMenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
}
