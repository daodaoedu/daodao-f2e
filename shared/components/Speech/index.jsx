import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { keyframes } from "@emotion/react";
import {
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { Clear as ClearIcon, Mic as MicIcon } from "@mui/icons-material";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
// import { CentralBlock, HorizontalBlock } from "./general";
import useUnchanger from "../../../hooks/useUnchanger";
// import { speech as i18n } from "../i18n";
// en - US;
// eslint-disable-next-line react/display-name
// const HorizontalBlock = forwardRef(({ children = <></>, minWidth = 0, style = {}, Tag = "div", width = "auto", ...otherProps }, ref) => {
//   return (
//     <Tag
//       sx={{
//         alignItems: "center",
//         display: "flex",
//         justifyContent: "space-between",
//       }}
//       ref={ref}
//       style={{ minWidth, width, ...style }}
//       {...otherProps}
//     >
//       {children}
//     </Tag>
//   );
// });

const pulse = keyframes`
    0% {
		transform: scale(0.85);
		box-shadow: 0 0 0 0 #32aeddb4;
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 72px #32aedd00;
	}

	100% {
		transform: scale(0.85);
		box-shadow: 0 0 0 0 #32aedd00;
	}
`;

const SpeechWrapper = styled(Box)`
  height: calc(100vh - 80px);
  padding-top: 80px;
  background: white;
  box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%),
    0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
  left: 0;
  top: 80px;
  position: fixed;
  z-index: 10;
`;

const Speech = ({ lang, setIsSpeechMode }) => {
  const router = useRouter();
  const { query = {} } = router;
  const [text, setText] = useState("說些什麼");
  const [flag, setFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const { listening, transcript, resetTranscript } = useSpeechRecognition();
  const unchange = useUnchanger(transcript, listening && transcript !== "");

  useEffect(() => {
    if (!listening) {
      SpeechRecognition.startListening({
        language: lang,
      });
    }

    const timeout1 = setTimeout(() => {
      if (!reset && !flag) {
        setText("正在聽");
      }
    }, 1500);

    const timeout2 = setTimeout(() => {
      if (!reset && !flag) {
        SpeechRecognition.stopListening();
      }
    }, 6000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  useEffect(() => {
    if (transcript !== "") {
      setFlag(true);
      setText(transcript);
    } else {
      setText("說些什麼");
      setFlag(false);
    }
  }, [transcript, lang]);

  useEffect(() => {
    if (unchange) {
      SpeechRecognition.stopListening();
    }
  }, [unchange]);

  useEffect(() => {
    if (listening === false && transcript !== "" && flag) {
      setIsLoading(true);
      setIsSpeechMode(false);

      router.push({
        pathname: "/search",
          query: {
            ...query,
          q: transcript,
        },
      });
    }

    if (listening === false && text === "正在聽") {
      setText("確認中");
      setReset(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  const resetSpeeching = (event) => {
    event.stopPropagation();
    resetTranscript();
    setFlag(false);
    setReset(false);
    setText("說些什麼");
    SpeechRecognition.startListening({
      language: lang,
    });
  };
    
  const isPulsing = flag && listening;

  return (
    <SpeechWrapper
      onClick={() => {
        resetTranscript();
        setIsSpeechMode(false);
      }}
      width="100%"
    >
      {isLoading ? (
        <CircularProgress color="secondary" />
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <IconButton
              sx={{
                animation: isPulsing ? `${pulse} 1s infinite` : null,
                background: isPulsing ? "#16b9b3" : null,
                border: "1px solid #ccc",
                height: 165,
                width: 165,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "50px",
                  color: isPulsing ? "white" : "#16b9b3",
                  height: 87,
                  width: 87,
                }}
              >
                島
              </Box>
              {/* <MicIcon
                color="secondary"
                sx={{
                  color: isPulsing ? "#fff" : null,
                  height: 87,
                  width: 87,
                }}
              /> */}
            </IconButton>
            <Box
              sx={{
                color: "#777",
                fontSize: 32,
                fontWeight: 400,
                lineHeight: "48px",
                maxWidth: "calc(100% - 200px)",
                display: "flex",
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '20px 0',
              }}
            >
                <Box>{text}</Box>
                <Box>
                {reset && (
                    <Button
                    color="primary"
                    onClick={resetSpeeching}
                    size="large"
                    variant="outlined"
                    sx={{
                        margin: '10px 0'
                    }}
                    >
                        再試一次
                    </Button>
                )}
                </Box>
            </Box>
          </Box>
          <IconButton
            sx={{ opacity: 0.7, position: "absolute", right: 30, top: 10 }}
            size="small"
          >
            <ClearIcon />
          </IconButton>
        </>
      )}
    </SpeechWrapper>
  );
}

export default Speech;