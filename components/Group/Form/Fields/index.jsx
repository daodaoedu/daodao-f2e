import { useId } from 'react';
import TagEditor from '@/shared/components/TagEditor';
import AreaCheckbox from './AreaCheckbox';
import Select from './Select';
import TextField from './TextField';
import Upload from './Upload';
import Wrapper from './Wrapper';
import CheckboxGroup from './CheckboxGroup';
import DateRadio from './DateRadio';

const withWrapper = (Component) => (props) => {
  const id = useId();
  const formItemId = `form-item-${id}`;
  const { required, label, tooltip } = props;

  return (
    <Wrapper
      id={formItemId}
      required={required}
      label={label}
      tooltip={tooltip}
    >
      <Component {...props} />
    </Wrapper>
  );
};

const Fields = {
  AreaCheckbox: withWrapper(AreaCheckbox),
  CheckboxGroup: withWrapper(CheckboxGroup),
  DateRadio: withWrapper(DateRadio),
  Select: withWrapper(Select),
  TagsField: withWrapper(TagEditor),
  TextField: withWrapper(TextField),
  Upload: withWrapper(Upload),
};

export default Fields;
