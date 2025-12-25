import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

class GeminiService:
    def __init__(self):
        # Use Gemini 2.0 Flash (latest model)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
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
            
            print(f"[DEBUG] Raw Gemini response: {text[:200]}...")  # Log first 200 chars
            
            # Clean the response - remove markdown code blocks if present
            if text.startswith('```'):
                lines = text.split('\n')
                # Remove language identifier if present (e.g., ```json)
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines[-1].startswith('```'):
                    lines = lines[:-1]
                text = '\n'.join(lines)
            
            # Remove any "json" prefix
            text = text.replace('```json', '').replace('```', '').strip()
            
            print(f"[DEBUG] Cleaned text: {text[:200]}...")
            
            # Parse JSON
            import json
            questions = json.loads(text)
            
            # Validate it's a list of strings
            if not isinstance(questions, list) or len(questions) == 0:
                raise ValueError("Response is not a valid list of questions")
            
            print(f"[SUCCESS] Generated {len(questions)} questions")
            return questions
            
        except Exception as e:
            print(f"[ERROR] Failed to generate questions: {str(e)}")
            print(f"[ERROR] Exception type: {type(e).__name__}")
            # Fallback questions
            return [
                f"Can you walk me through a challenging project you worked on as a {role}?",
                f"What technical decisions did you make in your recent work and why?",
                f"How do you approach problem-solving in your role as a {role}?",
                f"Describe a time when you had to learn a new technology quickly.",
                f"What's the most complex technical challenge you've solved?"
            ]
    
    def analyze_video_response(self, video_path: str, questions: list, role: str, context: str) -> dict:
        """
        Analyze interview video response using Gemini's multimodal capabilities
        
        Args:
            video_path: Path to the video file
            questions: List of interview questions asked
            role: Target role for the interview
            context: Candidate's background context
            
        Returns:
            Structured feedback dictionary with scores and recommendations
        """
        try:
            print(f"[DEBUG] Starting video analysis for {video_path}")
            
            # Upload video to Gemini
            print("[DEBUG] Uploading video file to Gemini...")
            video_file = genai.upload_file(path=video_path)
            
            # Wait for video processing to complete
            import time
            while video_file.state.name == "PROCESSING":
                print("[DEBUG] Video still processing...")
                time.sleep(2)
                video_file = genai.get_file(video_file.name)
            
            if video_file.state.name == "FAILED":
                raise ValueError(f"Video processing failed: {video_file.state.name}")
            
            print("[DEBUG] Video uploaded and processed successfully")
            
            # Create comprehensive multimodal prompt
            questions_text = "\n".join([f"{i+1}. {q}" for i, q in enumerate(questions)])
            
            prompt = f"""You are an expert interview coach analyzing a candidate's video interview response. 

**Interview Context:**
- Target Role: {role}
- Candidate Background: {context}

**Questions Asked:**
{questions_text}

**Your Task:**
Analyze the video comprehensively across three dimensions:

1. **Content Quality** (0-100):
   - Relevance to questions asked
   - Technical depth and accuracy
   - Structure and clarity of answers
   - Use of specific examples

2. **Verbal Delivery** (0-100):
   - Speaking pace and rhythm
   - Clarity and articulation
   - Confidence in tone
   - Filler words usage ("um", "uh", "like")
   - Pauses and hesitations

3. **Non-Verbal Communication** (0-100):
   - Facial expressions and engagement
   - Eye contact with camera
   - Posture and body language
   - Hand gestures (natural vs. distracting)
   - Overall confidence and presence

**Response Format:**
Return ONLY a JSON object with this exact structure (no markdown, no extra text):

{{
  "overall_score": <number 0-100>,
  "content_feedback": {{
    "score": <number 0-100>,
    "strengths": ["<specific strength 1>", "<specific strength 2>"],
    "improvements": ["<specific improvement 1>", "<specific improvement 2>"]
  }},
  "verbal_feedback": {{
    "score": <number 0-100>,
    "strengths": ["<specific strength 1>", "<specific strength 2>"],
    "improvements": ["<specific improvement 1>", "<specific improvement 2>"]
  }},
  "nonverbal_feedback": {{
    "score": <number 0-100>,
    "strengths": ["<specific strength 1>", "<specific strength 2>"],
    "improvements": ["<specific improvement 1>", "<specific improvement 2>"]
  }},
  "actionable_tips": [
    "<concrete action 1>",
    "<concrete action 2>",
    "<concrete action 3>"
  ],
  "similar_roles": [
    {{
      "title": "<job role title>",
      "reason": "<why this role fits based on their skills/background>"
    }},
    {{
      "title": "<job role title>",
      "reason": "<why this role fits based on their skills/background>"
    }},
    {{
      "title": "<job role title>",
      "reason": "<why this role fits based on their skills/background>"
    }}
  ]
}}

Be specific, honest, and constructive. Focus on actionable feedback.
For similar roles, suggest 3 relevant positions based on their demonstrated skills and background.
"""
            
            # Generate analysis using multimodal model
            print("[DEBUG] Generating multimodal analysis...")
            response = self.model.generate_content([video_file, prompt])
            
            # Parse response
            import json
            text = response.text.strip()
            
            print(f"[DEBUG] Raw response: {text[:200]}...")
            
            # Clean markdown code blocks if present
            if text.startswith('```'):
                lines = text.split('\n')
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines[-1].startswith('```'):
                    lines = lines[:-1]
                text = '\n'.join(lines)
            
            text = text.replace('```json', '').replace('```', '').strip()
            
            # Parse JSON
            feedback = json.loads(text)
            
            print(f"[SUCCESS] Video analysis complete. Overall score: {feedback.get('overall_score', 'N/A')}")
            
            # Clean up uploaded file from Gemini
            genai.delete_file(video_file.name)
            print("[DEBUG] Cleaned up uploaded video from Gemini")
            
            return feedback
            
        except Exception as e:
            print(f"[ERROR] Video analysis failed: {str(e)}")
            print(f"[ERROR] Exception type: {type(e).__name__}")
            
            # Return fallback feedback
            return {
                "overall_score": 70,
                "content_feedback": {
                    "score": 70,
                    "strengths": ["Good attempt at answering questions"],
                    "improvements": ["Analysis failed - please try again"]
                },
                "verbal_feedback": {
                    "score": 70,
                    "strengths": ["Video received successfully"],
                    "improvements": ["Could not analyze verbal delivery"]
                },
                "nonverbal_feedback": {
                    "score": 70,
                    "strengths": ["Video quality acceptable"],
                    "improvements": ["Could not analyze non-verbal cues"]
                },
                "actionable_tips": [
                    "Ensure good lighting for video recording",
                    "Position camera at eye level",
                    "Try recording again for detailed analysis"
                ],
                "similar_roles": [
                    {"title": f"{role} (Advanced)", "reason": "Natural progression in your current field"},
                    {"title": "Technical Lead", "reason": "Leadership opportunity based on your experience"},
                    {"title": "Solutions Architect", "reason": "Combines technical and strategic skills"}
                ]
            }

gemini_service = GeminiService()
