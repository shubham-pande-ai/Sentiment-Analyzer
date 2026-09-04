# AI-Powered Sentiment Analyzer (Full-Stack)

This is a production-ready, Full-Stack Agentic AI application designed to analyze customer support conversation transcripts and extract actionable business insights such as Sentiment, Emotion, CSAT estimates, and Action Items.

## Architectural Overview

- **Frontend:** Next.js (React), Tailwind CSS (Dark Mode Glassmorphism Theme), Recharts
- **Backend:** FastAPI (Python), LangChain
- **AI Engine:** Groq (Llama-3 70B via JsonOutputParser)
- **Deployment:** Docker & Vercel Serverless

## 🚀 Key "Stand-Out" Features

### 1. Zero-Trust PII Redaction (Data Privacy)
Enterprise security is the #1 priority in AI. Before any transcript is sent to the Cloud LLM, it passes through a custom backend PII Engine. Sensitive customer data (Emails, Phone Numbers, Account IDs) are actively stripped and masked via Regex. The Cloud AI never sees raw customer data.

### 2. Granular Sentence-Level Parsing
To achieve maximum mathematical accuracy for the Sentiment Pie Chart, the LangChain prompt forces the LLM to split the transcript by literal punctuation (periods/exclamation marks) rather than grouping entire speaker turns.

### 3. Modern SaaS Dashboard
The UI is not a basic boilerplate. It features a completely custom, professional SaaS dark mode utilizing glassmorphism (`backdrop-blur`), dynamic background gradients, interactive charts, and sleek typography.

### 4. Deterministic Anti-Hallucination Guardrails
LLMs naturally hallucinate formats. To ensure 100% stable API responses:
- **Zero/Few-Shot Prompting:** Locks the LLM into a strict JSON template.
- **Strict Grading Rubrics:** Hardcoded rules dictate exactly how to score CSAT based on semantic triggers in the conversation.
- **Temperature Control:** Set to `0.0` for deterministic outputs.

## Setup Instructions

### Frontend (Live Deployment)
The frontend UI is fully deployed and accessible via Vercel Serverless:
- **Link:** [https://sentiment-analyzer-g3i19q81p-shubham-pande-ai.vercel.app/](https://sentiment-analyzer-g3i19q81p-shubham-pande-ai.vercel.app/)
- **Username:** `admin`
- **Password:** `password`

*Note: Vercel only hosts Next.js frontends. To use the AI 'Analyze' button, you must run the Python Backend locally on your machine using Docker.*

### Backend (Local Docker)
To spin up the heavily orchestrated AI backend (which the Vercel frontend will securely route to via `NEXT_PUBLIC_API_URL`), follow these steps:

1. **Environment Variables**
   Navigate to the `backend/` directory and ensure your `.env` file has your Groq API key:
   ```bash
   GROQ_API_KEY=your_groq_api_key_here
   ```

2. **Run with Docker Compose**
   From the root directory, simply run:
   ```bash
   docker-compose up --build
   ```

3. **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

## Future Roadmap (Scalability)
If this POC were scaled to a production enterprise environment, the following architecture would be implemented:
- **Multi-Agent 'Critic' Loop:** Implementing LangGraph so a secondary 'Critic' Agent mathematically verifies the first Agent's JSON against the transcript before sending it to the user.
- **Dynamic Fallback Routing:** Implementing LiteLLM to automatically reroute traffic from Groq to OpenAI/Gemini if API rate limits (HTTP 429) are encountered, guaranteeing zero downtime.
- **NoSQL Storage:** Connecting an Async MongoDB cluster to track CSAT trends globally across millions of analyzed transcripts.
