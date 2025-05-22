let stream = null;
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let captureBtn = document.getElementById('captureBtn');
let previewArea = document.getElementById('previewArea');
let errorMessage = document.getElementById('errorMessage');

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

async function openCamera() {
    try {
        // Request camera permission
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Use back camera if available
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        captureBtn.style.display = 'inline-flex';
        
        // Hide preview area while camera is active
        previewArea.style.display = 'none';
        
    } catch (err) {
        console.error('Error accessing camera:', err);
        if (err.name === 'NotAllowedError') {
            showError('Camera permission denied. Please allow camera access and try again.');
        } else if (err.name === 'NotFoundError') {
            showError('No camera found on this device.');
        } else {
            showError('Error accessing camera: ' + err.message);
        }
    }
}

function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);
    
    // Convert to blob and display
    canvas.toBlob(function(blob) {
        displayImage(blob);
        stopCamera();
    }, 'image/jpeg', 0.8);
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.style.display = 'none';
    captureBtn.style.display = 'none';
    previewArea.style.display = 'block';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        displayImage(file);
    } else {
        showError('Please select a valid image file.');
    }
}

function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewArea.innerHTML = `
            <img src="${e.target.result}" alt="Living room photo" class="preview-image">
            <p class="instructions">Great! Your living room photo is ready for configuration.</p>
        `;
    };
    reader.readAsDataURL(file);
}

// Drag and drop functionality
function handleDragOver(event) {
    event.preventDefault();
    previewArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    previewArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    previewArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            displayImage(file);
        } else {
            showError('Please drop a valid image file.');
        }
    }
}

// Stop camera when page is unloaded
window.addEventListener('beforeunload', stopCamera);