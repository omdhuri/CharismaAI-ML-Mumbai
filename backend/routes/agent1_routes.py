from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.pdf_parser import extract_text_from_pdf, summarize_resume
from services.gemini_service import gemini_service

router = APIRouter(prefix="/agent1", tags=["Agent 1 - Context Architect"])

@router.post("/generate-questions")
async def generate_questions(
    role: str = Form(...),
    resume: UploadFile = File(None),
    description: str = Form(None)
):
    """
    Generate personalized interview questions based on role and background
    Accepts either resume PDF or text description
    """
    try:
        # Validate input
        if not resume and not description:
            raise HTTPException(status_code=400, detail="Must provide either resume or description")
        
        # Extract context
        if resume:
            # Read PDF and extract text
            pdf_content = await resume.read()
            from io import BytesIO
            pdf_file = BytesIO(pdf_content)
            context = extract_text_from_pdf(pdf_file)
            context = summarize_resume(context)
        else:
            context = description
        
        # Generate questions using Gemini
        questions = gemini_service.generate_questions(role, context)
        
        return {
            "success": True,
            "role": role,
            "questions": questions,
            "context_length": len(context)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
