import os
import asyncio
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List

load_dotenv()

class ActionItem(BaseModel):
    task: str = Field(description="The action item task description")
    assignee: str = Field(description="Who needs to do it")

class AnalysisResult(BaseModel):
    overall_sentiment: str = Field(description="Overall sentiment: Positive, Negative, or Neutral")
    summary: str = Field(description="A concise 2-3 sentence summary of the conversation")
    action_items: List[ActionItem] = Field(description="List of extracted action items")

async def main():
    llm = ChatGroq(model="groq/compound", temperature=0.0)
    parser = JsonOutputParser(pydantic_object=AnalysisResult)
    
    prompt = PromptTemplate(
        template="Analyze the following transcript.\n{format_instructions}\n\nTranscript: {transcript}\n",
        input_variables=["transcript"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    
    chain = prompt | llm | parser
    
    try:
        res = chain.invoke({"transcript": "Agent: Hi! Customer: Hello, fix my internet!"})
        print("SUCCESS:", res)
    except Exception as e:
        print("FAILED:", e)

asyncio.run(main())
