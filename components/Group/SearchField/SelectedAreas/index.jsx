import Select from '@/shared/components/Select';
import { AREAS } from '@/constants/areas';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

export default function SelectedAreas() {
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleChange = ({ target: { value } }) => {
    pushState('area', value.toString());
  };

  return (
    <Select
      multiple
      value={getSearchParams('area')}
      onChange={handleChange}
      width={240}
      items={AREAS}
      renderValue={(selected) =>
        selected.length === 0 ? '全部' : selected.join('、')
      }
      sx={{
        '@media (max-width: 767px)': {
          width: '100%',
        },
      }}
    />
  );
}
