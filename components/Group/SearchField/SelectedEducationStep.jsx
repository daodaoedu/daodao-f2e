import Select from '@/shared/components/Select';
import { EDUCATION_STAGE } from '@/constants/member';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

export default function SelectedEducationStep() {
  const QUERY_KEY = 'partnerEducationStep';
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleChange = ({ target: { value } }) => {
    pushState(QUERY_KEY, value.toString());
  };

  return (
    <Select
      multiple
      value={getSearchParams(QUERY_KEY)}
      onChange={handleChange}
      items={EDUCATION_STAGE}
      itemLabel="label"
      itemValue="label"
      renderValue={(selected) =>
        selected.length === 0 ? '適合的學習階段' : selected.join('、')
      }
      sx={{
        '@media (max-width: 767px)': {
          width: '100%',
        },
      }}
    />
  );
}
