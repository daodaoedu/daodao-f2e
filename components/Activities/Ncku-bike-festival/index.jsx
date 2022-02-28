import React, { useMemo, useState } from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { Stage, Layer, Rect, Text, Circle, Line, Image } from "react-konva";
import useImage from "use-image";

const ResourceWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
  .title {
    font-size: 24px;
    font-weight: 500;
    margin: 0 10px 0 0;
    color: black;
    &:hover {
      cursor: pointer;
      color: #37b9eb;
      transition: 0.5s;
    }
  }
  @media (max-width: 767px) {
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

const NckuBikeFestival = () => {
  const stageRef = React.useRef(null);
  const [mainState, setMainState] = useState("initial"); // initial, search, gallery, uploaded
  const [imageUploaded, setImageUploaded] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [img] = useImage(selectedFile, "Anonymous");
  const [newImage] = useImage(stageRef?.current?.toDataURL(), "Anonymous");

  const handleUploadClick = (event) => {
    var file = event.target.files[0];
    const reader = new FileReader();
    var url = reader.readAsDataURL(file);

    reader.onloadend = function (e) {
      setSelectedFile([reader.result]);
    };
    console.log(url);
    setMainState("uploaded");
    setSelectedFile(event.target.files[0]);
    setImageUploaded(1);
  };
  function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return (
    <ResourceWrapper>
      <Paper
        sx={{
          width: "80%",
          margin: "0 auto",
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              margin: "10px 0",
              fontSize: "30px",
            }}
          >
            來做做看你可愛的照片
          </Typography>
        </Box>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          {/* <Typography
            sx={{
              margin: "20px 0",
            }}
          > */}
          <Button variant="outlined">
            <input
              accept="image/*"
              multiple
              type="file"
              onChange={handleUploadClick}
            />
            上傳
          </Button>
          {/* </Typography> */}
          <Typography
            sx={{
              margin: "20px 0",
            }}
          >
            <Stage width="300" height="300" ref={stageRef}>
              <Layer>
                <Image
                  image={img}
                  x={0}
                  y={0}
                  width={300}
                  height={300}
                  fill={true}
                  //   opacity="0.3"
                  alt="image"
                />
                <Text
                  text="島島阿學 x 成大單車節"
                  fontSize={20}
                  x={50}
                  y={20}
                />
              </Layer>
            </Stage>
          </Typography>
        </Box>
        <Box>
          <a
            onClick={() => {
              var dataURL = stageRef?.current?.toDataURL({ pixelRatio: 3 });
              downloadURI(dataURL, "stage.png");
            }}
            // href={`${downloadPath}`}
            target="_blank"
            download="canvas.png"
            rel="noreferrer"
          >
            <Button variant="outlined">下載</Button>
          </a>
        </Box>
      </Paper>
    </ResourceWrapper>
  );
};

export default NckuBikeFestival;
