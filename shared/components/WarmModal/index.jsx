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

const WarmModal = ({ open, setOpen }) => {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  //   console.log("debug: ", author, text);
  const onSubmit = () => {
    fetch("https://api.daoedu.tw/slackbot/send/warm", {
      method: "POST",
      body: JSON.stringify({
        channel: "#主頻道-大會報告島",
        // For test
        // channel: "#daodao-notion",
        author: author || "匿名",
        text: text ?? "🥳",
      }),
    }).then(() => {
      toast.success("送上祝福成功！", {
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
      <DialogTitle>送上滿滿的祝福 🎈</DialogTitle>
      <DialogContent>
        <DialogContentText>
          你的小小鼓勵是所有島島志工夥伴最大的動力🥳！歡迎留下你所想留的內容，你所留下的訊息會
          <Typography sx={{ fontWeight: "bold" }}> 即時推播 </Typography>
          給島島的夥伴看到喔！
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
          label="祝福的話"
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

export default WarmModal;
