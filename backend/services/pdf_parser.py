import PyPDF2
from io import BytesIO

def extract_text_from_pdf(pdf_file) -> str:
    """
    Extract text content from uploaded PDF file
    """
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    
    except Exception as e:
        raise Exception(f"Error parsing PDF: {str(e)}")

def summarize_resume(text: str) -> str:
    """
    Extract key points from resume text
    For now, just clean and return the text
    Future: Could use Gemini to extract structured data
    """
    # Basic cleaning
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return '\n'.join(lines)
