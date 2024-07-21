import MuiButton from '@mui/material/Button';

const Button = ({ variant = 'contained', sx, ...props }) => {
  return (
    <MuiButton
      variant={variant}
      sx={{
        fontSize: '16px',
        marginTop: '40px',
        color: '#FFFFFF',
        boxShadow: '0px 4px 10px rgba(89, 182, 178, 0.5)',
        borderRadius: '20px',
        padding: '6px 48px',
        ...sx,
      }}
      {...props}
    />
  );
};

export default Button;
