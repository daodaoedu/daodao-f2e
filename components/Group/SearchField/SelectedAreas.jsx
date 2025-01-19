import Select from '@/shared/components/Select';
import { AREAS, ONLINE_OPTION, TBD_OPTION } from '@/constants/areas';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

const areaOptions = AREAS.concat(ONLINE_OPTION, TBD_OPTION);

export default function SelectedAreas() {
  const QUERY_KEY = 'area';
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleChange = ({ target: { value } }) => {
    pushState(QUERY_KEY, value.toString());
  };

  return (
    <Select
      multiple
      value={getSearchParams(QUERY_KEY)}
      onChange={handleChange}
      items={areaOptions}
      renderValue={(selected) =>
        selected.length === 0 ? '地點' : selected.join('、')
      }
      sx={{
        '@media (max-width: 767px)': {
          width: '100%',
        },
      }}
    />
  );
}
