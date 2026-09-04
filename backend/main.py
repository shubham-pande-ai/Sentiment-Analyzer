from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import os
import asyncio
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# Load environment variables
load_dotenv()

app = FastAPI(title="Sentiment Analyzer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Parallel Execution ---

class SentenceSentiment(BaseModel):
    sentence: str = Field(description="The exact original sentence from the text")
    sentiment: str = Field(description="Positive, Negative, or Neutral")

class ActionItem(BaseModel):
    task: str = Field(description="The action item task description")
    assignee: str = Field(description="Who needs to do it")

# Agent 1: KPIs
class KPIResult(BaseModel):
    overall_sentiment: str = Field(description="Overall sentiment: Positive, Negative, or Neutral")
    dominant_emotion: str = Field(description="The dominant emotion: Frustration, Joy, Anger, Relief, etc.")
    summary: str = Field(description="A concise 2-3 sentence summary of the conversation")
    csat_estimate: int = Field(description="Estimated CSAT score from 1-10")
    empathy_score: int = Field(description="Estimated Agent Empathy score from 1-10")
    resolution_status: str = Field(description="Resolved, Needs Follow-up, or Escalated")
    churn_risk: str = Field(description="High, Medium, or Low")

# Agent 2: Action Items
class ActionItemsResult(BaseModel):
    action_items: List[ActionItem] = Field(description="List of extracted action items")

# Agent 3: Sentences
class SentencesResult(BaseModel):
    sentence_breakdown: List[SentenceSentiment] = Field(description="Sentence-by-sentence sentiment analysis")

# Final combined result sent to frontend
class AnalysisResult(KPIResult, ActionItemsResult, SentencesResult):
    pass

def get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable not set. Please add it to backend/.env")
    
    # Using the primary model
    return ChatGroq(model="groq/compound", temperature=0.0, max_retries=3)

@app.get("/")
def read_root():
    return {"message": "Sentiment Analyzer API is running!"}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_conversation(file: UploadFile = File(...)):
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")
    
    content = await file.read()
    text = content.decode('utf-8')
    if not text.strip():
        raise HTTPException(status_code=400, detail="The file is empty")
    
    llm = get_llm()

    # --- AGENT 1: KPI Extraction ---
    kpi_parser = JsonOutputParser(pydantic_object=KPIResult)
    kpi_prompt = PromptTemplate(
        template="""Extract core KPIs and Summary from this transcript.
        CRITICAL RULES:
        1. GROUNDING: Do NOT invent information.
        2. CSAT: Score 1-10. Angry ends=1-4. Neutral=5-7. Happy/Thanks=9.
        
        {format_instructions}
        Transcript: {transcript}""",
        input_variables=["transcript"],
        partial_variables={"format_instructions": kpi_parser.get_format_instructions()},
    )
    kpi_chain = kpi_prompt | llm | kpi_parser

    # --- AGENT 2: Action Items Extraction ---
    action_parser = JsonOutputParser(pydantic_object=ActionItemsResult)
    action_prompt = PromptTemplate(
        template="""Extract Action Items from this transcript.
        CRITICAL RULES: If no action items exist, return an empty list. Do not hallucinate.
        
        {format_instructions}
        Transcript: {transcript}""",
        input_variables=["transcript"],
        partial_variables={"format_instructions": action_parser.get_format_instructions()},
    )
    action_chain = action_prompt | llm | action_parser

    # --- AGENT 3: Sentence Breakdown Extraction ---
    sentences_parser = JsonOutputParser(pydantic_object=SentencesResult)
    sentences_prompt = PromptTemplate(
        template="""Break down the transcript sentence-by-sentence and determine the sentiment for each.
        CRITICAL RULES: Keep the exact speaker format (e.g., "Customer: [text]"). Do not split a single speaker's continuous turn into multiple tiny sentences.
        
        {format_instructions}
        Transcript: {transcript}""",
        input_variables=["transcript"],
        partial_variables={"format_instructions": sentences_parser.get_format_instructions()},
    )
    sentences_chain = sentences_prompt | llm | sentences_parser

    try:
        # EXECUTE ALL 3 AGENTS IN PARALLEL
        # This reduces latency by running the heavy extraction tasks concurrently!
        kpi_res, action_res, sentences_res = await asyncio.gather(
            kpi_chain.ainvoke({"transcript": text}),
            action_chain.ainvoke({"transcript": text}),
            sentences_chain.ainvoke({"transcript": text})
        )
        
        # Combine the results
        final_result = {**kpi_res, **action_res, **sentences_res}
        return final_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text in parallel: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
