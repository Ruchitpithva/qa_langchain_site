# 📄 PDF Chatbot UI (Frontend)

This is the frontend for a **PDF Question-Answer Chatbot** built using **React.js**, **Vite**, **Material-UI (MUI)**, and **Redux Toolkit**. It allows users to upload a PDF, choose between Gemini or ChatGPT as the backend, and interact in a real-time chat-style interface to ask questions based on the PDF content.

---

## 🚀 Features

- 📁 PDF upload (only once per session)
- 💬 Chat-style interface for Q&A
- 🧠 AI model selection: Gemini (free) or ChatGPT (requires access code)
- 🗂️ Session-based interaction (file, chat history stored per session)
- 🧹 "End Chat" feature to clear chat and start fresh
- ⚙️ Redux store for managing session ID, chat history, model type, and ChatGPT key
- 🧊 Responsive UI with Material-UI components

---

## 🧑‍💻 Tech Stack

- **React.js (Vite)**
- **Material-UI (MUI)**
- **Redux Toolkit**
- **Axios** (for API requests)
- **Redux Persist** (for ChatGPT key persistence)

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/Ruchitpithva/qa_langchain_site.git
```

### 2. Install dependecies

```bash
npm install
```

### 3. Start the app

```bash
npm run dev
```
