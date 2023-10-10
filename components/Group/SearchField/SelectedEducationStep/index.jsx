import Select from '@/shared/components/Select';
import { EDUCATION_STEP } from '@/constants/member';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

const EDUCATION_STEP_WITH_ALL = [{ label: '不拘' }, ...EDUCATION_STEP];

function SelectedEducationStep({ placeholder, queryKey }) {
  const [getSearchParams, pushState] = useSearchParamsManager();

  const handleChange = ({ target: { value } }) => {
    pushState(queryKey, value.toString());
  };
  return (
    <Select
      value={getSearchParams(queryKey)}
      onChange={handleChange}
      items={EDUCATION_STEP_WITH_ALL}
      itemLabel="label"
      itemValue="label"
      placeholder={placeholder}
      sx={{
        '@media (max-width: 767px)': {
          width: '100%',
        },
      }}
    />
  );
}

export function SelectedInitiatorEducationStep() {
  return (
    <SelectedEducationStep placeholder="發起人學習階段" queryKey="initiator" />
  );
}

export function SelectedPartnerEducationStep() {
  return (
    <SelectedEducationStep placeholder="夥伴學習階段" queryKey="partner" />
  );
}
