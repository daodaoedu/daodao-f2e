import { useId } from 'react';
import AreaCheckbox from './AreaCheckbox';
import Select from './Select';
import TagsField from './TagsField';
import TextField from './TextField';
import Upload from './Upload';
import Wrapper from './Wrapper';

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
  Select: withWrapper(Select),
  TagsField: withWrapper(TagsField),
  TextField: withWrapper(TextField),
  Upload: withWrapper(Upload),
};

export default Fields;
