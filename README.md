# AI-Powered Sentiment Analyzer (Full-Stack)

This is a production-ready Full-Stack AI application designed to analyze customer support conversation transcripts and extract actionable business insights such as Sentiment, Emotion, CSAT estimates, and Action Items.

## Architecture

- **Frontend:** Next.js (React), Tailwind CSS (Dark Mode Glassmorphism Theme), Recharts
- **Backend:** FastAPI (Python), LangChain
- **AI Engine:** Groq (Llama-4 70B via JsonOutputParser)
- **Deployment:** Docker & Docker Compose

## Features

- **Secure Access:** Basic authentication (`admin` / `password`) guarding the application.
- **Modern SaaS Dashboard:** A sleek, dark-mode dashboard featuring glassmorphism (`backdrop-blur`), dynamic gradients, and rich typography.
- **Granular Insights:** Breaks down transcripts by literal sentence punctuation to provide highly accurate, sentence-level sentiment scoring.
- **KPI Extraction:** Automatically calculates CSAT Estimates, Empathy Scores, Resolution Status, and Churn Risk based on conversational context.

## Prerequisites
- Docker & Docker Compose installed on your machine.
- A free Groq API key (`GROQ_API_KEY`)

## Setup Instructions

1. **Environment Variables**
   Navigate to the `backend/` directory and ensure your `.env` file has your key:
   ```bash
   GROQ_API_KEY=your_groq_api_key_here
   ```

2. **Run with Docker Compose**
   From the root directory (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
     - **Username:** `admin`
     - **Password:** `password`
   - **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

## Advanced Prompt Engineering & Anti-Hallucination Measures
To ensure 100% consistent outputs and eliminate LLM variance between runs, the following engineering techniques were implemented:
- **Zero-Shot / Few-Shot Prompting:** The LangChain prompt includes a structured 'Few-Shot Example' to lock the LLM into a strict, repeatable parsing pattern for Action Items and Sentences.
- **Granular Token Splitting:** The AI is strictly instructed to split the transcript by literal punctuation (periods, exclamation marks) rather than grouping speaker turns, ensuring mathematically accurate sentence-level sentiment tracking.
- **Strict Grading Rubrics:** Instead of allowing the LLM to guess scores subjectively, hardcoded boundaries were added (e.g., explicit rules on how to score CSAT based on customer gratitude).
- **Temperature Control:** Set to `0.0` for highly deterministic and strict outputs.
- **Strict JSON Parsing:** LangChain's `JsonOutputParser` forces the LLM to adhere to a strict Pydantic schema, guaranteeing frontend types will never break.
