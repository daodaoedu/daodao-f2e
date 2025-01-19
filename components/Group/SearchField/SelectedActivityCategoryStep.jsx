import Select from '@/shared/components/Select';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import { ACTIVITY_CATEGORIES } from '@/constants/category';

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
      items={ACTIVITY_CATEGORIES}
      itemLabel="label"
      itemValue="label"
      renderValue={(selected) =>
        selected.length === 0
          ? '揪團類型'
          : ACTIVITY_CATEGORIES
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
