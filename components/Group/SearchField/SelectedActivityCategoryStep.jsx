import Select from '@/shared/components/Select';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import { activityCategoryList } from '@/constants/activityCategory';

export default function SelectedActivityCategoryStep() {
  const QUERY_KEY = 'activityCategory';
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleChange = ({ target: { value } }) => {
    pushState(QUERY_KEY, value.toString());
  };

  return (
    <Select
      multiple
      value={getSearchParams(QUERY_KEY)}
      onChange={handleChange}
      items={activityCategoryList}
      itemLabel="label"
      itemValue="value"
      renderValue={(selected) =>
        selected.length === 0
          ? '揪團類型'
          : activityCategoryList
              .filter((item) => selected.includes(item.value))
              .map((item) => item.label)
              .join('、')
      }
      sx={{
        '@media (max-width: 767px)': {
          width: '100%',
        },
      }}
    />
  );
}
