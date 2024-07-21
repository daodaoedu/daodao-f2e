import Select from '@/shared/components/Select';
import { TAIWAN_DISTRICT } from '@/constants/areas';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

export default function SelectedAreas() {
  const QUERY_KEY = 'area';
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleChange = ({ target: { value } }) => {
    pushState(QUERY_KEY, value.toString());
  };

  const AREAS = TAIWAN_DISTRICT.map(({ name }) => ({
    name,
    label: name,
  })).concat([{ name: '國外', label: '國外' }]);

  return (
    <Select
      multiple
      value={getSearchParams(QUERY_KEY)}
      onChange={handleChange}
      items={AREAS}
      renderValue={(selected) =>
        selected.length === 0 ? '地區' : selected.join('、')
      }
      sx={{
        '@media (max-width: 767px)': {
          width: '100%',
        },
      }}
    />
  );
}
