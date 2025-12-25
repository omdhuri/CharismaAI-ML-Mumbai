// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// API Helper Functions
const api = {
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    },

    async generateQuestions(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/agent1/generate-questions`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to generate questions');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Question generation failed:', error);
            throw error;
        }
    },

    async analyzeVideo(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/agent2/analyze-video`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to analyze video');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Video analysis failed:', error);
            throw error;
        }
    }
};

// Check backend connection on load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const health = await api.checkHealth();
        console.log('✅ Backend connected:', health);
    } catch (error) {
        console.error('❌ Backend connection failed. Make sure the backend is running on port 8000');
    }
});
