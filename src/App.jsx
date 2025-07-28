import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  resetChat,
  setSessionId,
  setSecretCode,
} from "./store/chatSlice";
import { useSnackbar } from "notistack";
import _ from "lodash";

const API_BASE = "https://qa-langchain-openai.onrender.com/api"; // update if needed

function App() {
  const dispatch = useDispatch();
  const { sessionId, messages, secretCode } = useSelector(
    (state) => state.chat
  );

  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [endChatLoading, setEndChatLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedProvider, setSelectedProvider] = useState("");
  const [secretInput, setSecretInput] = useState("");

  const [errors, setErrors] = useState({
    provider: false,
    file: false,
    secret: false,
  });

  const validateFields = () => {
    let valid = true;
    const newErrors = { provider: false, file: false, secret: false };

    if (!selectedProvider) {
      newErrors.provider = true;
      valid = false;
    }
    if (!file) {
      newErrors.file = true;
      valid = false;
    }
    if (selectedProvider === "chatgpt" && !secretInput.trim()) {
      newErrors.secret = true;
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleUpload = async () => {
    if (!validateFields()) return;

    setFileLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (secretInput) formData.append("secret_code", secretInput);

    try {
      const res = await axios.post(`${API_BASE}/upload-file`, formData);
      if (res?.data?.status) {
        dispatch(setSessionId(res?.data?.data));
        dispatch(setSecretCode(secretInput));
        enqueueSnackbar(res?.data?.message, { variant: "success" });
      } else {
        setSecretInput("");
        setSelectedProvider("");
        enqueueSnackbar(res?.data?.message, { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.message, { variant: "error" });
    } finally {
      setFileLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ask`, {
        session_id: sessionId,
        question,
        platform: selectedProvider,
      });
      if (res?.data?.status) {
        enqueueSnackbar(res?.data?.message, { variant: "success" });
        dispatch(addMessage({ question, answer: res?.data?.data?.answer }));
        setQuestion("");
      } else {
        enqueueSnackbar(res?.data?.message, { variant: "error" });
      }
    } catch (err) {
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
      if (endChat?.data?.status) {
        dispatch(resetChat());
        setFile(null);
        setSecretInput("");
        setSelectedProvider("");
        if (fileInputRef.current) fileInputRef.current.value = null;
        enqueueSnackbar(endChat?.data?.message, { variant: "success" });
      } else {
        enqueueSnackbar(endChat?.data?.message, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error?.message, { variant: "error" });
    } finally {
      setEndChatLoading(false);
    }
  };

  const handleProviderChange = (event) => {
    setSelectedProvider(event.target.value);
    setSecretInput("");
    setErrors({ ...errors, provider: false, secret: false });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrors({ ...errors, file: false });
  };

  return (
    <Box className="chat-container" sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        PDF QA Chatbot
      </Typography>

      {!sessionId && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }} error={errors.provider}>
            <InputLabel id="provider-label">Select Provider</InputLabel>
            <Select
              labelId="provider-label"
              value={selectedProvider}
              onChange={handleProviderChange}
              label="Select Provider"
            >
              <MenuItem value="gemini">Gemini</MenuItem>
              <MenuItem value="chatgpt">ChatGPT</MenuItem>
            </Select>
            {errors.provider && (
              <FormHelperText>Provider is required</FormHelperText>
            )}
          </FormControl>

          {selectedProvider === "chatgpt" && (
            <TextField
              label="Secret Code"
              fullWidth
              sx={{ mb: 2 }}
              value={secretInput}
              error={errors.secret}
              helperText={errors.secret ? "Secret code is required" : ""}
              onChange={(e) => {
                setSecretInput(e.target.value);
                if (e.target.value.trim()) {
                  setErrors({ ...errors, secret: false });
                }
              }}
            />
          )}

          <Box mb={2}>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ marginBottom: "0.5rem" }}
            />
            {errors.file && (
              <Typography color="error" variant="body2">
                File is required
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={
              fileLoading ||
              !selectedProvider ||
              !file ||
              (selectedProvider === "chatgpt" && !secretInput.trim())
            }
          >
            {fileLoading ? "Uploading..." : "Upload File"}
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
              disabled={loading || !question.trim()}
            >
              {loading ? "Finding Answer..." : "Ask A Question"}
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
            disabled={endChatLoading}
          >
            {endChatLoading ? "Ending..." : "End Chat"}
          </Button>
        </>
      )}
    </Box>
  );
}

export default App;
