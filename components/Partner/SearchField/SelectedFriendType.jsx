import Select from '@/shared/components/Select';
import { ROLE } from '@/constants/member';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

const ROLE_TYPE = ROLE.map(({ label, key }) => ({ label, key }));

const SelectedFriendType = () => {
  const QUERY_KEY = 'role';
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleChange = ({ target: { value } }) => {
    pushState(QUERY_KEY, value.toString());
  };

  return (
    <Select
      multiple
      value={getSearchParams(QUERY_KEY)}
      onChange={handleChange}
      items={ROLE_TYPE}
      itemValue="label"
      itemLabel="label"
      renderValue={(selected) =>
        selected.length === 0 ? '夥伴類型' : selected.join('、')
      }
      sx={{
        '@media (max-width: 767px)': {
          width: '100%',
        },
      }}
    />
  );
};

export default SelectedFriendType;
