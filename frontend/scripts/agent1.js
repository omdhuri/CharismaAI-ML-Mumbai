// Agent 1: Context Architect - Frontend Logic

let selectedFile = null;
let selectedRole = '';
let inputMethod = 'resume'; // 'resume' or 'description'

// DOM Elements
const roleSelect = document.getElementById('role-select');
const customRoleContainer = document.getElementById('custom-role-container');
const customRoleInput = document.getElementById('custom-role');
const btnResume = document.getElementById('btn-resume');
const btnDescription = document.getElementById('btn-description');
const resumeContainer = document.getElementById('resume-container');
const descriptionContainer = document.getElementById('description-container');
const uploadArea = document.getElementById('upload-area');
const resumeUpload = document.getElementById('resume-upload');
const resumePreview = document.getElementById('resume-preview');
const fileName = document.getElementById('file-name');
const removeResumeBtn = document.getElementById('remove-resume');
const descriptionText = document.getElementById('description-text');
const generateBtn = document.getElementById('generate-questions-btn');
const loadingAgent1 = document.getElementById('loading-agent1');
const questionsContainer = document.getElementById('questions-container');
const questionsList = document.getElementById('questions-list');

// Role Selection Handler
roleSelect.addEventListener('change', (e) => {
    selectedRole = e.target.value;

    if (selectedRole === 'custom') {
        customRoleContainer.classList.remove('hidden');
        customRoleInput.required = true;
        selectedRole = '';
    } else {
        customRoleContainer.classList.add('hidden');
        customRoleInput.required = false;
    }

    validateForm();
});

customRoleInput.addEventListener('input', (e) => {
    selectedRole = e.target.value.trim();
    validateForm();
});

// Toggle between Resume and Description
btnResume.addEventListener('click', () => {
    inputMethod = 'resume';
    btnResume.classList.add('active');
    btnDescription.classList.remove('active');
    resumeContainer.classList.remove('hidden');
    descriptionContainer.classList.add('hidden');
    validateForm();
});

btnDescription.addEventListener('click', () => {
    inputMethod = 'description';
    btnDescription.classList.add('active');
    btnResume.classList.remove('active');
    descriptionContainer.classList.remove('hidden');
    resumeContainer.classList.add('hidden');
    validateForm();
});

// File Upload Handlers
uploadArea.addEventListener('click', () => {
    resumeUpload.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent-purple)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--card-border)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--card-border)';

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        handleFileSelect(files[0]);
    }
});

resumeUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

removeResumeBtn.addEventListener('click', () => {
    selectedFile = null;
    resumeUpload.value = '';
    resumePreview.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    validateForm();
});

function handleFileSelect(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    uploadArea.classList.add('hidden');
    resumePreview.classList.remove('hidden');
    validateForm();
}

// Description Input Handler
descriptionText.addEventListener('input', validateForm);

// Form Validation
function validateForm() {
    let isValid = false;

    // Check role
    const hasRole = selectedRole && selectedRole !== '';

    // Check content
    if (inputMethod === 'resume') {
        isValid = hasRole && selectedFile !== null;
    } else {
        const description = descriptionText.value.trim();
        isValid = hasRole && description.length > 20;
    }

    generateBtn.disabled = !isValid;
}

// Generate Questions Handler
generateBtn.addEventListener('click', async () => {
    try {
        // Show loading
        loadingAgent1.classList.remove('hidden');
        generateBtn.disabled = true;
        questionsContainer.classList.add('hidden');

        // Prepare form data
        const formData = new FormData();
        formData.append('role', selectedRole);

        if (inputMethod === 'resume') {
            formData.append('resume', selectedFile);
        } else {
            formData.append('description', descriptionText.value.trim());
        }

        // Call API
        const response = await api.generateQuestions(formData);

        // Display questions
        displayQuestions(response.questions);

    } catch (error) {
        alert('Error generating questions: ' + error.message);
        generateBtn.disabled = false;
    } finally {
        loadingAgent1.classList.add('hidden');
    }
});

function displayQuestions(questions) {
    questionsList.innerHTML = '';

    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <strong>Question ${index + 1}:</strong> ${question}
        `;
        questionsList.appendChild(questionDiv);
    });

    questionsContainer.classList.remove('hidden');
}

// Start Recording Button (transitions to Agent 2)
document.getElementById('start-recording-btn').addEventListener('click', () => {
    document.getElementById('agent1-section').classList.add('hidden');
    document.getElementById('agent2-section').classList.remove('hidden');
});
