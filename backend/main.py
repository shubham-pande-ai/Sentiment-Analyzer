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
    parser = JsonOutputParser(pydantic_object=AnalysisResult)
    
    prompt = PromptTemplate(
        template="""You are an expert customer support AI analyst. 
        Analyze the following conversation transcript and extract the requested insights.
        
        CRITICAL RULES TO PREVENT HALLUCINATION & ENSURE CONSISTENCY:
        1. GROUNDING: Do NOT invent information. Base answers STRICTLY on the text.
        2. CONSISTENCY (CSAT): Score CSAT 1-10. If the customer ends angry, score 1-4. If neutral, 5-7. If they explicitly thank the agent and say it helps, score exactly 9.
        3. CONSISTENCY (SENTENCES): Keep the exact speaker format for sentences (e.g., "Customer: [text]"). Do not split a single speaker's continuous turn into multiple tiny sentences unless there is a clear topic change.
        4. UNKNOWN: If a KPI is not present, return an empty list.
        
        FEW-SHOT EXAMPLE:
        Transcript: 
        Agent: Hello.
        Customer: My app is crashing.
        Agent: I fixed it.
        Customer: Thanks!
        
        Expected JSON logic: CSAT=9, Resolution=Resolved, Action Items=[], Sentences=[{"sentence": "Agent: Hello.", "sentiment": "Neutral"}, ...]
        
        {format_instructions}
        
        Transcript:
        {transcript}
        """,
        input_variables=["transcript"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    
    try:
        chain = prompt | llm | parser
        result = await chain.ainvoke({"transcript": text})
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
