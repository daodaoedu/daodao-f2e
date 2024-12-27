/* eslint-disable react/jsx-wrap-multilines */
import { useRouter } from 'next/router';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const names = ['學齡前', '國小', '國高中', '大學以上'];

const AgeDropdown = () => {
  const { query, push } = useRouter();
  const ages = query?.ages ? (query?.ages).split(',') : [];
  const handleChange = (event) => {
    const newAges = query?.ages ? (query?.ages).split(',') : [];
    const { name } = event.target;
    const { checked } = event.target;
    if (checked) {
      newAges.push(name);
    } else {
      const index = newAges.indexOf(name);
      newAges.splice(index, 1);
    }
    if (newAges.length === 0) {
      delete query.ages;
      push({
        pathname: '/search',
        query,
      });
    } else {
      push({
        pathname: '/search',
        query: {
          ...query,
          ages: newAges.join(','),
        },
      });
    }
  };
  return (
    <FormControl sx={{ minWidth: 150, margin: '5px' }}>
      <FormLabel>年齡層</FormLabel>
      <FormGroup
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        {names.map((name) => (
          <FormControlLabel
            key={name}
            label={name}
            control={
              <Checkbox
                checked={ages.includes(name)}
                onClick={handleChange}
                name={name}
                sx={{
                  whiteSpace: 'nowrap',
                }}
              />
            }
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};

export default AgeDropdown;
