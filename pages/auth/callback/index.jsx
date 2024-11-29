import { useState, useEffect } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserByToken } from "@/redux/actions/user";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const me = useSelector((state) => state.user);

  useEffect(() => {
    const tempToken = searchParams.get("token");

    if (tempToken) {
      dispatch(fetchUserByToken(tempToken));
    } else {
      console.error("unfound token");
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (window.opener && isLoading && me) {
      if (me._id) {
        window.opener.postMessage({ type: 'USER_UPDATED' }, window.location.origin);
        setIsLoading(false);
        window.close();
      }

      if (me.tempToken) {
        window.opener.postMessage({ type: 'TEMP_TOKEN_UPDATED' }, window.location.origin);
        setIsLoading(false);
        window.close();
      }
    }
  }, [me._id, me.tempToken, isLoading]);

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
