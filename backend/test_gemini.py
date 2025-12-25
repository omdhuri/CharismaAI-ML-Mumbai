import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

model = genai.GenerativeModel('gemini-2.0-flash-exp')

prompt = """You are an expert interview coach. Generate 5 highly specific, technical interview questions for a Software Engineer position based on the candidate's background below.

CRITICAL RULES:
1. Questions MUST be directly related to specific projects, technologies, or experiences mentioned in the background
2. Avoid generic questions like "Tell me about yourself" or "What are your strengths"
3. Focus on technical depth and real-world scenarios
4. Each question should probe understanding of decisions they made in their past work

Candidate Background:
I built a real-time chat application using WebSockets and Redis for pub/sub. Implemented JWT authentication and used Docker for containerization. Created automated tests with Jest and deployed to AWS EC2.

Generate exactly 5 questions. Return ONLY a JSON array of strings, nothing else.
Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
"""

print("Testing Gemini API...")
print("=" * 50)

try:
    response = model.generate_content(prompt)
    text = response.text.strip()
    
    print(f"Raw response:\n{text}\n")
    print("=" * 50)
    
    # Clean
    if text.startswith('```'):
        lines = text.split('\n')
        if lines[0].startswith('```'):
            lines = lines[1:]
        if lines[-1].startswith('```'):
            lines = lines[:-1]
        text = '\n'.join(lines)
    
    text = text.replace('```json', '').replace('```', '').strip()
    
    print(f"Cleaned text:\n{text}\n")
    print("=" * 50)
    
    questions = json.loads(text)
    
    print(f"Parsed {len(questions)} questions:")
    for i, q in enumerate(questions, 1):
        print(f"{i}. {q}")
        
except Exception as e:
    print(f"ERROR: {e}")
    print(f"Type: {type(e).__name__}")
