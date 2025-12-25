# CharismaAI - AI Interview Performance Coach

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CharismaAI is an AI-powered interview coaching platform that helps candidates improve their interview performance through personalized question generation and multimodal video analysis. Built with Google Gemini 2.0 and modern web technologies.

---

## 🎯 Features

### Agent 1: Context Architect
- **Personalized Question Generation**: AI generates interview questions based on your resume and target role
- **Resume Upload**: Upload PDF resume or provide text description
- **Multiple Roles**: Support for various positions (Software Engineer, Product Manager, Data Scientist, etc.)
- **Smart Prompting**: Context-aware questions tailored to your specific experience

### Agent 2: Multimodal Coach
- **Video Recording**: Record interview responses using webcam (MediaRecorder API)
- **Video Upload**: Fallback option to upload pre-recorded videos
- **AI Analysis**: Comprehensive feedback across three dimensions:
  - **Content Quality**: Relevance, depth, structure, examples
  - **Verbal Delivery**: Pace, clarity, tone, filler words
  - **Non-Verbal Communication**: Eye contact, posture, expressions, gestures
- **Actionable Tips**: Concrete suggestions for improvement
- **Similar Job Roles**: AI-recommended career paths based on your skills

### Enhancement Features
- **📥 Download Report**: Export feedback as formatted text file
- **📋 Copy to Clipboard**: One-click copy of all feedback
- **🔄 Start New Interview**: Quick reset to begin fresh session
- **💾 Session Persistence**: Auto-saves progress in browser (survives page refresh)
- **⚡ Performance Optimizations**: Fast question generation with live timer

---

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── main.py                 # FastAPI application entry point
├── routes/
│   ├── agent1_routes.py    # Question generation endpoints
│   └── agent2_routes.py    # Video analysis endpoints
├── services/
│   └── gemini_service.py   # Gemini AI integration + Ollama fallback
└── temp/                   # Temporary video storage (auto-cleanup)
```

### Frontend (Vanilla JavaScript)
```
frontend/
├── index.html              # Main application UI
├── scripts/
│   ├── api.js             # Backend API client
│   ├── agent1.js          # Question generation logic
│   ├── agent2.js          # Video recording & analysis
│   └── enhancements.js    # Download, copy, session features
└── styles/
    └── main.css           # Premium glassmorphism design
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+**
- **Node.js** (optional, for development)
- **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
- **Ollama** (optional) - [Install for local fallback](https://ollama.com/download)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/charisma-ai.git
cd charisma-ai
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**Environment Variables (.env):**
```env
# Google Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Ollama Fallback (Optional)
# For production: https://api.ollama.com
# For development: http://localhost:11434
OLLAMA_HOST=https://api.ollama.com
OLLAMA_MODEL=llama3.2
USE_OLLAMA_FALLBACK=true
```

### 3. Run Backend
```bash
python main.py
```
Backend will start at `http://localhost:8000`

### 4. Run Frontend
```bash
cd ../frontend
python -m http.server 3000
```
Frontend will start at `http://localhost:3000`

### 5. Open Application
Navigate to `http://localhost:3000` in your browser

---

## 📖 Usage Guide

### Step 1: Generate Interview Questions
1. Select your target role from the dropdown
2. Either:
   - Upload your resume (PDF)
   - Enter a text description of your background
3. Click **"Generate Interview Questions"**
4. Wait for AI to generate personalized questions (3-8 seconds)

### Step 2: Record Your Response
1. Click **"Start Video Response"**
2. Choose between:
   - **Record with Webcam**: Live recording (max 2 minutes)
   - **Upload Video**: Pre-recorded video file (MP4, MOV, WEBM)
3. Answer the interview questions
4. Click **"Stop Recording"** or upload your video
5. Preview your video

### Step 3: Get AI Feedback
1. Click **"Analyze My Response"**
2. Wait for multimodal analysis (30-60 seconds)
3. Review comprehensive feedback:
   - Overall performance score (0-100)
   - Content quality analysis
   - Verbal delivery assessment
   - Non-verbal communication insights
   - Actionable improvement tips
   - Similar job role suggestions

### Step 4: Export & Iterate
- **Download Report**: Save feedback as text file
- **Copy Feedback**: Copy to clipboard
- **Start New Interview**: Practice with different questions

---

## 🔧 API Endpoints

### Agent 1 Endpoints
- `POST /agent1/generate-questions` - Generate interview questions
  - Form data: `role`, `resume` (file) or `description` (text)
  - Returns: `{ questions: string[] }`

- `GET /agent1/health` - Health check

### Agent 2 Endpoints
- `POST /agent2/analyze-video` - Analyze interview video
  - Form data: `video` (file), `questions` (JSON), `role`, `context`
  - Returns: Structured feedback object

- `GET /agent2/health` - Health check

### General Endpoints
- `GET /` - API status
- `GET /health` - System health check

---

## 🤖 AI Models & Fallback

### Primary: Google Gemini 2.0 Flash
- Fast, high-quality responses
- Multimodal capabilities (video + text)
- Used for both question generation and video analysis

### Fallback: Ollama
- Cloud API (`https://api.ollama.com`) for production
- Local instance (`http://localhost:11434`) for development
- Automatically engages if Gemini fails
- Models: `llama3.2`, `mistral`, etc.

### Fallback Chain
```
Gemini API (Primary)
    ↓ fails
Ollama Cloud/Local (Fallback)
    ↓ fails  
Static Questions (Last Resort)
```

---

## 🎨 Design System

### Color Palette
- **Dark Background**: `#0f0f23` (Deep space)
- **Primary Gradient**: Purple to pink (`#667eea` → `#764ba2`)
- **Secondary Gradient**: Blue to purple (`#4facfe` → `#00f2fe`)
- **Accent Colors**: Purple, pink, blue

### UI Features
- **Glassmorphism**: Frosted glass effect on cards
- **Smooth Animations**: Hover effects, transitions
- **Responsive Design**: Mobile-friendly layout
- **Dark Theme**: Optimized for low-light viewing

---

## 📦 Deployment

### Deploy to Google Cloud Run

1. **Build Docker Image**
```bash
# Create Dockerfile for backend
docker build -t charisma-ai-backend ./backend
```

2. **Push to Container Registry**
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/charisma-ai
```

3. **Deploy to Cloud Run**
```bash
gcloud run deploy charisma-ai \
  --image gcr.io/YOUR_PROJECT_ID/charisma-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,OLLAMA_HOST=https://api.ollama.com
```

4. **Deploy Frontend**
- Use Firebase Hosting, Vercel, or Netlify
- Update API URLs in `api.js` to Cloud Run URL

### Environment Variables for Production
```env
GEMINI_API_KEY=your_production_key
OLLAMA_HOST=https://api.ollama.com
OLLAMA_MODEL=llama3.2
USE_OLLAMA_FALLBACK=true
```

---

## 🧪 Testing

### Manual Testing
1. Test question generation with various roles
2. Test video recording and upload
3. Test feedback generation
4. Test enhancement features (download, copy, reset)

### API Testing
```bash
# Test health
curl http://localhost:8000/health

# Test Agent 1
curl -X POST http://localhost:8000/agent1/generate-questions \
  -F "role=Software Engineer" \
  -F "description=5 years Python and React experience"

# Test Agent 2 health
curl http://localhost:8000/agent2/health
```

---

## 🛠️ Development

### Project Structure
```
CharismaAI/
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── index.html
│   ├── scripts/
│   └── styles/
└── README.md
```

### Adding New Features
1. Update `task.md` with new checklist items
2. Implement backend changes in `routes/` and `services/`
3. Implement frontend changes in `scripts/`
4. Update this README
5. Test thoroughly

### Code Style
- **Backend**: Follow PEP 8 (Python)
- **Frontend**: ES6+ JavaScript, semantic HTML
- **CSS**: BEM methodology for class names

---

## 📊 Performance

- **Question Generation**: 3-8 seconds (Gemini), 2-5 seconds (Ollama fallback)
- **Video Analysis**: 30-60 seconds (depends on video length, max 2 min)
- **Session Persistence**: Instant (localStorage)
- **Download/Copy**: < 1 second

---

## 🔒 Security & Privacy

- **No Data Storage**: Videos are processed and immediately deleted
- **Temporary Files**: Auto-cleaned after analysis
- **API Keys**: Stored in environment variables, never exposed to frontend
- **CORS**: Configured for localhost development (update for production)

---

## 🐛 Troubleshooting

### "Camera access denied"
- Grant camera permissions in browser settings
- Use "Upload Video" option as fallback

### "Analysis failed: Not Found"
- Restart backend server
- Check `GEMINI_API_KEY` is set correctly in `.env`

### "Slow question generation"
- Check internet connection
- Gemini API may be experiencing high load
- Ollama fallback will automatically engage

### "Failed to fetch"
- Ensure backend is running on port 8000
- Ensure frontend is running on port 3000
- Refresh browser page

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini**: AI model for question generation and video analysis
- **Ollama**: Local LLM fallback
- **FastAPI**: High-performance Python backend framework
- **MediaRecorder API**: Browser-based video recording

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Google Gemini 2.0 and modern web technologies**
