import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Divider,
} from "@mui/material";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, resetChat, setSessionId } from "./store/chatSlice";
import { useSnackbar } from "notistack";
import _ from "lodash";

const API_BASE = "http://localhost:3000/api"; // change if deployed

function App() {
  const dispatch = useDispatch();
  const { sessionId, messages } = useSelector((state) => state.chat);

  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [endChatLoading, setEndChatLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  // dispatch(resetChat());

  const handleUpload = async () => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API_BASE}/upload-file`, formData);
      if (res?.data?.status) {
        setFileLoading(false);
        dispatch(setSessionId(res?.data?.data));
        enqueueSnackbar(res?.data?.message, { variant: "success" });
      } else {
        setFileLoading(false);
        enqueueSnackbar(res?.data?.message, { variant: "error" });
      }
    } catch (err) {
      setFileLoading(false);
      enqueueSnackbar(err?.message, { variant: "error" });
    }
  };

  const handleAsk = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ask`, {
        session_id: sessionId,
        question,
      });
      if (res?.data?.status) {
        enqueueSnackbar(res?.data?.message, { variant: "success" });
        dispatch(addMessage({ question, answer: res?.data?.data?.answer }));
        setQuestion("");
      } else {
        enqueueSnackbar(res?.data?.message, { variant: "error" });
      }
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(err?.message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEndChat = async () => {
    setEndChatLoading(true);
    try {
      const endChat = await axios.post(`${API_BASE}/end-chat`, {
        session_id: sessionId,
      });
      console.log("endChat", endChat);
      if (endChat?.data?.status) {
        dispatch(resetChat());
        setFile(null);
        setEndChatLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = null;
        enqueueSnackbar(endChat?.data?.message, { variant: "success" });
      } else {
        setEndChatLoading(false);
        enqueueSnackbar(endChat?.data?.message, { variant: "error" });
      }
    } catch (error) {
      setEndChatLoading(false);
      enqueueSnackbar(error?.message, { variant: "error" });
    }
  };

  return (
    <Box className="chat-container" sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        PDF QA Chatbot
      </Typography>

      {!sessionId && (
        <>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileInputRef}
            style={{ marginBottom: "1rem" }}
          />
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file | fileLoading ? true : false}
          >
            {fileLoading ? "Uploding..." : "Upload file"}
          </Button>
        </>
      )}

      {sessionId && (
        <>
          <Box my={2}>
            <TextField
              label="Ask a question"
              fullWidth
              multiline
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              onClick={handleAsk}
              disabled={loading | !question ? true : false}
              size="medium"
            >
              {loading ? "Find Answer..." : "Ask A Question"}
            </Button>
          </Box>

          {!_.isEmpty(messages) && (
            <Paper
              elevation={3}
              sx={{ p: 2, mt: 2, maxHeight: 400, overflowY: "auto" }}
            >
              {messages.map((msg, idx) => (
                <Box key={idx} mb={2}>
                  <Typography fontWeight="bold">Q: {msg.question}</Typography>
                  <Typography variant="body1">A: {msg.answer}</Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </Paper>
          )}

          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={handleEndChat}
            disabled={endChatLoading ? true : false}
          >
            {endChatLoading ? "Ending" : "End Chat"}
          </Button>
        </>
      )}
    </Box>
  );
}

export default App;
