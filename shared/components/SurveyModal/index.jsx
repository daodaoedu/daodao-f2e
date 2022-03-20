import React, { useState } from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack, Avatar } from "@mui/material";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import toast from "react-hot-toast";

const SurveyModal = ({ open, setOpen }) => {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  //   console.log("debug: ", author, text);
  const onSubmit = () => {
    fetch("https://api.daoedu.tw/slackbot/send", {
      method: "POST",
      body: JSON.stringify({
        channel: "#主頻道-大會報告島",
        // For test
        // channel: "#daodao-notion",
        text: `[意見調查即時推播]\n${
          author || "訪客匿名"
        }給予意見反饋：\n${text}`,
      }),
    }).then(() => {
      toast.success("送上意見反饋成功！感謝你的分享", {
        style: {
          color: "#16b9b3",
          border: "1px solid #16b9b3",
          marginTop: "70px",
        },
        iconTheme: {
          primary: "#16b9b3",
        },
      });
    });
  };
  return (
    <Dialog open={open} onClose={setOpen} closeAfterTransition>
      <DialogTitle>快速給予反饋</DialogTitle>
      <DialogContent>
        <DialogContentText>
          你的每一個想法對我們來說都很重要，歡迎留下你的反饋！
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="author"
          label="名稱"
          fullWidth
          variant="standard"
          placeholder="不填則為匿名"
          onChange={(event) => setAuthor(event.target.value)}
        />
        <TextField
          autoFocus
          margin="dense"
          id="text"
          label="反饋"
          type="email"
          fullWidth
          variant="standard"
          onChange={(event) => setText(event.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>取消</Button>
        <Button
          disabled={!text}
          onClick={() => {
            setOpen(false);
            onSubmit();
          }}
        >
          送出
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyModal;
