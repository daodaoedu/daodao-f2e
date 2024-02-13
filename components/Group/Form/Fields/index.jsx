import AreaCheckbox from './AreaCheckbox';
import Select from './Select';
import TagsField from './TagsField';
import TextField from './TextField';
import Upload from './Upload';
import Wrapper from './Wrapper';
import useWrapperProps from './useWrapperProps';

const Fields = {};

Fields.AreaCheckbox = (props) => {
  const wrapperProps = useWrapperProps(props);
  return (
    <Wrapper {...wrapperProps}>
      <AreaCheckbox {...props} />
    </Wrapper>
  );
};

Fields.Select = (props) => {
  const wrapperProps = useWrapperProps(props);
  return (
    <Wrapper {...wrapperProps}>
      <Select {...props} />
    </Wrapper>
  );
};

Fields.TagsField = (props) => {
  const wrapperProps = useWrapperProps(props);
  return (
    <Wrapper {...wrapperProps}>
      <TagsField {...props} />
    </Wrapper>
  );
};

Fields.TextField = (props) => {
  const wrapperProps = useWrapperProps(props);
  return (
    <Wrapper {...wrapperProps}>
      <TextField {...props} />
    </Wrapper>
  );
};

Fields.Upload = (props) => {
  const wrapperProps = useWrapperProps(props);
  return (
    <Wrapper {...wrapperProps}>
      <Upload {...props} />
    </Wrapper>
  );
};

export default Fields;
