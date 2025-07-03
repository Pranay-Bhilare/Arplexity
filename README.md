# Arplexity

> **Arplexity, inspired by Perplexity.ai, is a next-gen AI chat experience that combines real-time intelligence, web search, and a classy interface—while putting privacy first.**

---

## Overview
Arplexity is a futuristic AI chat platform designed for instant, natural conversations. It features:
- **Real-time AI chat** powered by state-of-the-art language models
- **Live web search** for up-to-date answers with source links
- **Modern UI** for a good user experience
- **Privacy-first** approach: your data stays yours, with no tracking

## Features
- 🚀 **Real-time AI Chat:** Instant, natural conversations with Arplexity AI. No lag, no limits.
- 🌐 **Web Search:** Get up-to-date answers using live web search and source links.
- 🪩 **3D Experience:** Futuristic, glassy, and animated chat UI like no other.
- 🔒 **Privacy First:** Your data stays yours. No tracking, no compromise.

## Tech Stack
**Frontend:**
- Next.js (React 19)
- TypeScript
- TailwindCSS
- Framer Motion
- Three.js (3D UI)
- Radix UI, shadcn/ui

**Backend:**
- FastAPI (Python)
- LangGraph, LangChain
- Google Generative AI (Gemini)
- TavilySearch (live web search)
- Groq

## How It Works
- The frontend provides a intuitive chat interface built using NextJS.
- The backend streams AI responses, leveraging Google Generative AI and TavilySearch for real-time, factual, and up-to-date answers.
- The system is designed to always use web search for any information that could be looked up, ensuring accuracy and recency.

## Getting Started
### Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+
- [pnpm](https://pnpm.io/) or npm/yarn

### Frontend Setup
```bash
cd frontend
pnpm install # or npm install
pnpm dev     # or npm run dev
```

### Backend Setup
```bash
cd backend
# Create a .env file with your API keys (see .env.example if available)
# install dependecies using uv
uv add -r requirements.txt 
# or if using pip to install dependencies
pip install -r requirements.txt
# run the backend fastapi server
uvicorn main:app --reload
```

### Environment Variables
- The backend requires API keys for Google Generative AI, TavilySearch, and Groq. Add them to your `.env` file in the `backend` directory.

## Usage
- Visit the frontend (usually at `http://localhost:3000`) and start chatting!
- The backend runs on `http://127.0.0.1:8000` by default.
