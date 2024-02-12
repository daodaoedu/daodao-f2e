import styled from '@emotion/styled';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';

export const StyledHeading = styled.h1`
  margin-bottom: 8px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #536166;
`;

export const StyledDescription = styled.p`
  margin-bottom: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: #536166;
`;

export const StyledContainer = styled.main`
  position: relative;
  margin: 0 auto;
  width: 720px;

  .MuiInputBase-input,
  .MuiFormControlLabel-label {
    font-size: 14px;
  }

  @media (max-width: 760px) {
    padding: 20px;
    width: 100%;
  }
`;

export const StyledLabel = styled(InputLabel)`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #293a3d;
`;

export const StyledGroup = styled.div`
  margin-bottom: 20px;

  .error-message {
    font-size: 14px;
    color: red;
  }
`;

export const StyledFooter = styled.div`
  display: flex;
  justify-content: center;
`;

export const StyledChip = styled(Chip)`
  font-size: 14px;
  border-radius: 4px;
  background: #def5f5;
  color: #293a3d;

  .MuiChip-label {
    padding-right: 4px;
  }
`;

export const StyledTagsField = styled.div(
  ({ theme }) => `
  position: relative;
  padding: 8px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  input {
    margin: -8px -16px;
    padding: 8px 16px;
    min-height: 40px;
    width: 8rem;
    border: none;
    flex: 1;

    &:focus {
      outline: none;
    }
  }

  button {
    position: absolute;
    right: 4px;
    bottom: 4px;
  }

  &:hover::after {
    border-color: ${theme.palette.text.main};
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(0, 0, 0, 0.23);
    border-radius: 4px;
    pointer-events: none;
  }

  &:focus-within::after {
    border: 2px solid ${theme.palette.primary.main};
  }
`,
);

export const StyledUpload = styled.div`
  position: relative;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px dashed #89dad7;
  border-radius: 8px;
  background: #f3fcfc;
  color: #16b9b3;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  transition: background 0.15s;
  gap: 8px;
  svg,
  .preview {
    pointer-events: none;
  }
  svg,
  span {
    position: relative;
    z-index: 1;
  }
  input {
    display: none;
  }
  .preview {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &:hover {
    background: #def5f5;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    transition: background 0.15s;
  }

  &.has-image {
    color: #ffffff;
    border-style: solid;
    svg,
    span {
      transition: opacity 0.15s;
      opacity: 0;
    }
    &:hover {
      svg,
      span {
        opacity: 1;
      }
      &::after {
        background: #0003;
      }
    }
  }
`;
