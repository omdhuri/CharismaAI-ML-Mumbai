// Agent 2: Multimodal Coach - Frontend Logic

// Session data passed from Agent 1
let interviewQuestions = [];
let candidateRole = '';
let candidateContext = '';

// Video recording state
let mediaRecorder = null;
let recordedChunks = [];
let recordingStream = null;
let recordingTimer = null;
let recordingSeconds = 0;
const MAX_RECORDING_SECONDS = 120; // 2 minutes

// DOM Elements
const agent2Section = document.getElementById('agent2-section');
const btnWebcam = document.getElementById('btn-webcam');
const btnUploadVideo = document.getElementById('btn-upload-video');
const webcamSection = document.getElementById('webcam-section');
const uploadVideoSection = document.getElementById('upload-video-section');
const videoPreview = document.getElementById('video-preview');
const startRecordBtn = document.getElementById('start-record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const recordingTimerDisplay = document.getElementById('recording-timer');
const videoUploadInput = document.getElementById('video-upload');
const videoUploadArea = document.getElementById('video-upload-area');
const recordedPreview = document.getElementById('recorded-preview');
const recordedVideo = document.getElementById('recorded-video');
const retakeBtn = document.getElementById('retake-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingAgent2 = document.getElementById('loading-agent2');
const feedbackContainer = document.getElementById('feedback-container');
const cameraStatus = document.getElementById('camera-status');
const cameraStatusText = document.getElementById('camera-status-text');
const retryCameraBtn = document.getElementById('retry-camera-btn');

// Initialize when Agent 2 section becomes visible
function initializeAgent2(questions, role, context) {
    console.log('Initializing Agent 2 with:', { questions, role, context });

    interviewQuestions = questions;
    candidateRole = role;
    candidateContext = context;

    // Display questions for reference
    displayQuestionsForRecording(questions);

    // Automatically initialize webcam if webcam option is active
    if (btnWebcam.classList.contains('active')) {
        initializeWebcam();
    }
}

function displayQuestionsForRecording(questions) {
    const questionsDisplay = document.getElementById('questions-display');
    if (questionsDisplay) {
        questionsDisplay.innerHTML = '<h4>Answer these questions:</h4>';
        questions.forEach((q, i) => {
            const qDiv = document.createElement('p');
            qDiv.innerHTML = `<strong>${i + 1}.</strong> ${q}`;
            questionsDisplay.appendChild(qDiv);
        });
    }
}

// Toggle between Webcam and Upload
btnWebcam.addEventListener('click', () => {
    btnWebcam.classList.add('active');
    btnUploadVideo.classList.remove('active');
    webcamSection.classList.remove('hidden');
    uploadVideoSection.classList.add('hidden');
    recordedPreview.classList.add('hidden');

    // Initialize webcam
    initializeWebcam();
});

btnUploadVideo.addEventListener('click', () => {
    btnUploadVideo.classList.add('active');
    btnWebcam.classList.remove('active');
    uploadVideoSection.classList.remove('hidden');
    webcamSection.classList.add('hidden');
    recordedPreview.classList.add('hidden');

    // Stop webcam if running
    stopWebcam();
});

// Retry Camera Button
retryCameraBtn.addEventListener('click', () => {
    console.log('Retrying camera initialization...');
    cameraStatus.classList.add('hidden');
    retryCameraBtn.classList.add('hidden');
    initializeWebcam();
});

// Initialize Webcam with better error handling
async function initializeWebcam() {
    try {
        console.log('Checking camera availability...');

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Edge.');
        }

        // Check if there are any video devices available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
            throw new Error('No camera detected. Please connect a webcam or use the Upload Video option.');
        }

        console.log(`Found ${videoDevices.length} camera(s). Requesting access...`);

        // Request camera and microphone access
        recordingStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: true
        });

        console.log('Camera access granted');
        videoPreview.srcObject = recordingStream;

        // Wait for video to be ready
        await new Promise((resolve) => {
            videoPreview.onloadedmetadata = () => {
                console.log('Video preview ready');
                resolve();
            };
        });

        startRecordBtn.disabled = false;
        console.log('Camera initialized successfully');

    } catch (error) {
        console.error('Camera initialization failed:', error);

        let errorMessage = '';

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage = `Camera permission denied. 

📷 To fix this:
1. Click the camera icon in your browser's address bar
2. Allow camera access for this site
3. Click the "Record with Webcam" button again

Or use the "Upload Video" option instead.`;
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage = `No camera found. 

📷 Please:
1. Connect a webcam
2. Refresh the page

Or use the "Upload Video" option instead.`;
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage = `Camera is in use by another application. 

📷 Please:
1. Close other apps using the camera
2. Try again

Or use the "Upload Video" option instead.`;
        } else if (error.name === 'SecurityError') {
            errorMessage = `Camera access blocked due to security restrictions. 

📷 Please:
1. Ensure you're accessing via http://localhost:3000
2. Check browser security settings

Or use the "Upload Video" option instead.`;
        } else {
            errorMessage = `Camera error: ${error.message}

Please use the "Upload Video" option instead.`;
        }

        alert(errorMessage);

        // Automatically switch to upload mode
        btnUploadVideo.click();
    }
}


function stopWebcam() {
    if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop());
        recordingStream = null;
        videoPreview.srcObject = null;
    }
}

// Start Recording
startRecordBtn.addEventListener('click', async () => {
    try {
        recordedChunks = [];
        recordingSeconds = 0;

        // Initialize MediaRecorder
        const options = { mimeType: 'video/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
        }

        mediaRecorder = new MediaRecorder(recordingStream, options);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            console.log('Recording stopped, chunks:', recordedChunks.length);
            showRecordedPreview();
        };

        mediaRecorder.start(100); // Collect data every 100ms

        // UI updates
        startRecordBtn.classList.add('hidden');
        stopRecordBtn.classList.remove('hidden');
        recordingTimerDisplay.classList.remove('hidden');
        videoPreview.classList.add('recording');

        // Start timer
        recordingTimer = setInterval(() => {
            recordingSeconds++;
            updateTimerDisplay();

            // Auto-stop at 2 minutes
            if (recordingSeconds >= MAX_RECORDING_SECONDS) {
                stopRecordBtn.click();
            }
        }, 1000);

        console.log('Recording started');

    } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Failed to start recording: ' + error.message);
    }
});

// Stop Recording
stopRecordBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        clearInterval(recordingTimer);

        // UI updates
        stopRecordBtn.classList.add('hidden');
        startRecordBtn.classList.remove('hidden');
        recordingTimerDisplay.classList.add('hidden');
        videoPreview.classList.remove('recording');

        console.log('Recording stopped by user');
    }
});

function updateTimerDisplay() {
    const minutes = Math.floor(recordingSeconds / 60);
    const seconds = recordingSeconds % 60;
    recordingTimerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showRecordedPreview() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const videoUrl = URL.createObjectURL(blob);

    recordedVideo.src = videoUrl;
    recordedVideo.videoBlob = blob; // Store for later upload

    // Hide webcam, show preview
    webcamSection.classList.add('hidden');
    recordedPreview.classList.remove('hidden');

    console.log('Preview ready, video size:', blob.size, 'bytes');
}

// Video Upload Handler
videoUploadArea.addEventListener('click', () => {
    videoUploadInput.click();
});

videoUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleUploadedVideo(file);
    }
});

function handleUploadedVideo(file) {
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Video file is too large. Maximum size is 50MB.');
        return;
    }

    const videoUrl = URL.createObjectURL(file);
    recordedVideo.src = videoUrl;
    recordedVideo.videoBlob = file; // Store for upload

    // Show preview
    uploadVideoSection.classList.add('hidden');
    recordedPreview.classList.remove('hidden');

    console.log('Uploaded video ready:', file.name, file.size, 'bytes');
}

// Retake Button
retakeBtn.addEventListener('click', () => {
    recordedPreview.classList.add('hidden');
    recordedVideo.src = '';
    recordedVideo.videoBlob = null;
    recordedChunks = [];

    // Return to original input method
    if (btnWebcam.classList.contains('active')) {
        webcamSection.classList.remove('hidden');
    } else {
        uploadVideoSection.classList.remove('hidden');
        videoUploadInput.value = '';
    }
});

// Analyze Button - Upload and get feedback
analyzeBtn.addEventListener('click', async () => {
    try {
        if (!recordedVideo.videoBlob) {
            alert('No video to analyze');
            return;
        }

        // Validate we have session data
        if (!interviewQuestions.length || !candidateRole) {
            alert('Missing interview context. Please start from Agent 1.');
            return;
        }

        // Show loading
        loadingAgent2.classList.remove('hidden');
        analyzeBtn.disabled = true;
        feedbackContainer.classList.add('hidden');

        // Prepare form data
        const formData = new FormData();
        formData.append('video', recordedVideo.videoBlob, 'interview-response.webm');
        formData.append('questions', JSON.stringify(interviewQuestions));
        formData.append('role', candidateRole);
        formData.append('context', candidateContext);

        console.log('Uploading video for analysis...');

        // Call API
        const response = await api.analyzeVideo(formData);

        console.log('Analysis complete:', response);

        // Display feedback
        displayFeedback(response.feedback);

    } catch (error) {
        console.error('Analysis failed:', error);
        alert('Analysis failed: ' + error.message);
        analyzeBtn.disabled = false;
    } finally {
        loadingAgent2.classList.add('hidden');
    }
});

// Display Feedback Results
function displayFeedback(feedback) {
    // Overall score
    document.getElementById('overall-score').textContent = feedback.overall_score;

    // Content feedback
    displayFeedbackCard('content-feedback', 'Content Quality', feedback.content_feedback);

    // Verbal feedback
    displayFeedbackCard('verbal-feedback', 'Verbal Delivery', feedback.verbal_feedback);

    // Non-verbal feedback
    displayFeedbackCard('nonverbal-feedback', 'Non-Verbal Communication', feedback.nonverbal_feedback);

    // Actionable tips
    const tipsContainer = document.getElementById('actionable-tips');
    tipsContainer.innerHTML = '<h4>🎯 Actionable Tips</h4>';
    const tipsList = document.createElement('ul');
    feedback.actionable_tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
    tipsContainer.appendChild(tipsList);

    // Show feedback container
    feedbackContainer.classList.remove('hidden');

    // Scroll to feedback
    feedbackContainer.scrollIntoView({ behavior: 'smooth' });
}

function displayFeedbackCard(elementId, title, feedbackData) {
    const card = document.getElementById(elementId);
    card.innerHTML = `
        <h4>${title}</h4>
        <div class="score-badge">${feedbackData.score}/100</div>
        <div class="strengths">
            <strong>✅ Strengths:</strong>
            <ul>
                ${feedbackData.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
        <div class="improvements">
            <strong>🔧 Areas to Improve:</strong>
            <ul>
                ${feedbackData.improvements.map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Export for use by agent1.js
window.agent2 = {
    initialize: initializeAgent2
};
