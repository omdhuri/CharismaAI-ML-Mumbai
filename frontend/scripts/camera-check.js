// Check for camera availability and decide initialization method
async function checkCameraAndInitialize() {
    try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('Browser does not support camera access - defaulting to upload');
            btnUploadVideo.click();
            return;
        }

        // Try to enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
            console.log('No camera detected - defaulting to upload mode');
            // Show helpful message
            cameraStatusText.textContent = 'ℹ️ No camera detected. Please use the Upload Video option to proceed.';
            cameraStatus.classList.remove('hidden');
            // Switch to upload mode
            btnUploadVideo.click();
        } else {
            // Camera available - initialize it
            console.log(`Found ${videoDevices.length} camera(s) - initializing...`);
            if (btnWebcam.classList.contains('active')) {
                initializeWebcam();
            }
        }
    } catch (error) {
        console.error('Error checking camera:', error);
        // Default to upload on any error
        btnUploadVideo.click();
    }
}
