import { Paper, Typography, Box } from "@mui/material";
import { useSearchParams } from 'next/navigation';
import { sendLoginEvent } from "@/contexts/Auth";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  sendLoginEvent(searchParams.get("token"));

  return (
    <Paper
      sx={{
        width: '90%',
        margin: '20px auto',
        padding: '20px',
        minHeight: '60vh',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: '#536166',
          marginTop: '10px',
          fontWeight: 'bold',
          fontSize: '30px',
          letterSpacing: '0.08em',
          textAlign: 'center',
          marginRight: '20px',
        }}
      >
        正在前往新的島嶼
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src="/assets/nobody-land.gif"
          alt="nobody-land"
          width="300"
          height="300"
        />
      </Box>
    </Paper>
  );
}
