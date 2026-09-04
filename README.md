# AI-Powered Sentiment Analyzer (Full-Stack)

This is a production-ready Full-Stack AI application designed to analyze customer support conversation transcripts and extract actionable business insights such as Sentiment, Emotion, CSAT estimates, and Action Items.

## Architecture

- **Frontend:** Next.js (React), Tailwind CSS, Recharts
- **Backend:** FastAPI (Python), LangChain
- **AI Engine:** Groq (Llama-3 70B via JsonOutputParser)
- **Deployment:** Docker & Docker Compose

## Prerequisites
- Docker & Docker Compose installed on your machine.
- A free Groq API key (`GROQ_API_KEY`)

## Setup Instructions

1. **Environment Variables**
   Navigate to the `backend/` directory and create/edit the `.env` file:
   ```bash
   GROQ_API_KEY=your_groq_api_key_here
   ```

2. **Run with Docker Compose**
   From the root directory (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - Frontend Dashboard: [http://localhost:3000](http://localhost:3000)
   - Backend API Docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

## Advanced Prompt Engineering & Anti-Hallucination Measures
To ensure 100% consistent outputs and eliminate LLM variance between runs, the following techniques (as requested in the JD) were implemented:
- **Few-Shot Prompting:** The LangChain prompt includes a structured 'Few-Shot Example' to lock the LLM into a strict, repeatable parsing pattern.
- **Strict Grading Rubrics:** Instead of allowing the LLM to guess scores subjectively, hardcoded boundaries were added (e.g., explicit rules on how to score CSAT based on customer gratitude).
- **Temperature Control:** Set to `0.0` for highly deterministic and strict outputs.
- **Strict JSON Parsing:** LangChain's `JsonOutputParser` forces the LLM to adhere to a Pydantic schema.
- **Grounding Prompts:** The LLM is strictly instructed to only use the provided text and output "N/A" if information is missing.


