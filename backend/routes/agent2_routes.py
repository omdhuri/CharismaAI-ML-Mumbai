from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from services.gemini_service import gemini_service
import os
import json
import aiofiles
from pathlib import Path
import uuid

router = APIRouter(prefix="/agent2", tags=["Agent 2 - Multimodal Coach"])

# Create temp directory for videos
TEMP_DIR = Path(__file__).parent.parent / "temp"
TEMP_DIR.mkdir(exist_ok=True)

@router.post("/analyze-video")
async def analyze_video(
    video: UploadFile = File(...),
    questions: str = Form(...),  # JSON string of questions array
    role: str = Form(...),
    context: str = Form(...)
):
    """
    Analyze video interview response using Gemini's multimodal capabilities
    
    Args:
        video: Video file (WebM, MP4, MOV)
        questions: JSON array of interview questions
        role: Target role
        context: Candidate background
    
    Returns:
        Structured feedback with scores and recommendations
    """
    temp_video_path = None
    
    try:
        # Validate video file
        if not video.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Parse questions JSON
        try:
            questions_list = json.loads(questions)
            if not isinstance(questions_list, list):
                raise ValueError("Questions must be an array")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid questions format")
        
        # Generate unique filename
        file_extension = video.filename.split('.')[-1] if '.' in video.filename else 'webm'
        temp_filename = f"{uuid.uuid4()}.{file_extension}"
        temp_video_path = TEMP_DIR / temp_filename
        
        # Save video file temporarily
        print(f"[DEBUG] Saving video to {temp_video_path}")
        async with aiofiles.open(temp_video_path, 'wb') as out_file:
            content = await video.read()
            await out_file.write(content)
        
        print(f"[DEBUG] Video saved ({len(content)} bytes)")
        
        # Analyze video using Gemini
        feedback = gemini_service.analyze_video_response(
            video_path=str(temp_video_path),
            questions=questions_list,
            role=role,
            context=context
        )
        
        return {
            "success": True,
            "feedback": feedback
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Video analysis endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temporary file
        if temp_video_path and temp_video_path.exists():
            try:
                os.remove(temp_video_path)
                print(f"[DEBUG] Cleaned up temporary video file")
            except Exception as e:
                print(f"[WARNING] Failed to clean up temp file: {e}")

@router.get("/health")
async def agent2_health():
    """Health check for Agent 2"""
    return {"status": "healthy", "agent": "Agent 2 - Multimodal Coach"}
