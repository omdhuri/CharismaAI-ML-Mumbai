import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    def generate_questions(self, role: str, context: str) -> list:
        """
        Generate personalized interview questions based on role and context
        """
        prompt = f"""You are an expert interview coach. Generate 5 highly specific, technical interview questions for a {role} position based on the candidate's background below.

CRITICAL RULES:
1. Questions MUST be directly related to specific projects, technologies, or experiences mentioned in the background
2. Avoid generic questions like "Tell me about yourself" or "What are your strengths"
3. Focus on technical depth and real-world scenarios
4. Each question should probe understanding of decisions they made in their past work

Candidate Background:
{context}

Generate exactly 5 questions. Return ONLY a JSON array of strings, nothing else.
Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
"""
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean the response - remove markdown code blocks if present
            if text.startswith('```'):
                lines = text.split('\n')
                text = '\n'.join(lines[1:-1])  # Remove first and last lines
            
            # Parse JSON
            import json
            questions = json.loads(text)
            
            return questions
            
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            # Fallback questions
            return [
                f"Can you walk me through a challenging project you worked on as a {role}?",
                f"What technical decisions did you make in your recent work and why?",
                f"How do you approach problem-solving in your role as a {role}?",
                f"Describe a time when you had to learn a new technology quickly.",
                f"What's the most complex technical challenge you've solved?"
            ]
    
    def analyze_video(self, video_path: str, questions: list, context: str) -> dict:
        """
        Analyze interview video response using multimodal capabilities
        This will be implemented in Agent 2
        """
        pass

gemini_service = GeminiService()
