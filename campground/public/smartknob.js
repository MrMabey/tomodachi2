// Smart Knob Simulator - Test audio recording workflow
// Simulates dual ESP32 smart knob hardware on Mac

let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let durationInterval = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let animationId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎛️ Smart Knob Simulator loaded');

    // Initialize waveform canvas
    const canvas = document.getElementById('waveformCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f0';
        ctx.fillRect(0, canvas.height / 2, canvas.width, 1);
    }
});

// Toggle recording from switch
async function toggleSmartKnobRecording() {
    if (!isRecording) {
        await startRecording();
    } else {
        await stopRecording();
    }
}

// Start recording
async function startRecording() {
    try {
        logUART('>> Knob ESP32: Switch toggled ON');
        logUART('>> Knob ESP32 TX: START_REC');

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 16000  // Match ESP32 I2S config
            }
        });

        logUART('<< Audio ESP32 RX: START_REC received');
        logUART('<< Audio ESP32: Initializing I2S microphone...');

        // Set up audio context for visualization
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Set up media recorder
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                logUART(`<< Audio ESP32: Captured ${event.data.size} bytes`);
            }
        };

        mediaRecorder.onstop = async () => {
            logUART('<< Audio ESP32: Recording stopped, processing audio...');

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];

            // Send to API
            await sendAudioToAPI(audioBlob);

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());

            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
        };

        mediaRecorder.start(1000); // Capture in 1-second chunks
        isRecording = true;
        recordingStartTime = Date.now();

        // Update UI
        updateRecordingUI(true);
        logUART('<< Audio ESP32 TX: ACK_START');
        logUART('>> Knob ESP32 RX: ACK_START received');
        logUART('[KNOB] Audio module confirmed: Recording started');

        // Start duration timer
        updateDuration();
        durationInterval = setInterval(updateDuration, 1000);

        // Start waveform visualization
        drawWaveform();

    } catch (error) {
        logUART(`<< Audio ESP32: ERROR - ${error.message}`, 'error');
        alert('Microphone access denied. Please allow microphone access to test recording.');
        console.error('Error starting recording:', error);
    }
}

// Stop recording
async function stopRecording() {
    logUART('>> Knob ESP32: Switch toggled OFF');
    logUART('>> Knob ESP32 TX: STOP_REC');
    logUART('<< Audio ESP32 RX: STOP_REC received');

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    isRecording = false;
    clearInterval(durationInterval);

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    // Update UI
    updateRecordingUI(false);
    logUART('<< Audio ESP32 TX: ACK_STOP');
    logUART('>> Knob ESP32 RX: ACK_STOP received');
    logUART('[KNOB] Audio module confirmed: Recording stopped');
}

// Update recording UI elements
function updateRecordingUI(recording) {
    const switchEl = document.getElementById('smartKnobSwitch');
    const toggleEl = document.getElementById('smartKnobToggle');
    const statusEl = document.getElementById('smartKnobStatus');
    const micStatusEl = document.getElementById('micStatus');

    if (recording) {
        // Switch ON state
        switchEl.style.background = 'linear-gradient(135deg, #4caf50, #8bc34a)';
        switchEl.style.borderColor = 'rgba(76, 175, 80, 0.5)';
        switchEl.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.4)';
        toggleEl.style.left = '49px';
        statusEl.textContent = 'RECORDING';
        statusEl.style.background = 'linear-gradient(135deg, #f44336, #e91e63)';
        statusEl.style.animation = 'pulse 1s infinite';
        micStatusEl.innerHTML = '<span class="indicator online"></span> Recording';
    } else {
        // Switch OFF state
        switchEl.style.background = 'rgba(255,255,255,0.2)';
        switchEl.style.borderColor = 'rgba(255,255,255,0.3)';
        switchEl.style.boxShadow = 'none';
        toggleEl.style.left = '5px';
        statusEl.textContent = 'OFF';
        statusEl.style.background = 'rgba(255,255,255,0.1)';
        statusEl.style.animation = 'none';
        micStatusEl.innerHTML = '<span class="indicator offline"></span> Not Recording';

        // Reset duration
        document.getElementById('recordingDuration').textContent = '0:00';
        document.getElementById('audioLevelBar').style.width = '0%';
    }
}

// Update recording duration
function updateDuration() {
    if (!isRecording || !recordingStartTime) return;

    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('recordingDuration').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Draw waveform visualization
function drawWaveform() {
    if (!isRecording || !analyser) return;

    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    animationId = requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4caf50';
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;
    let maxAmplitude = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;

        // Calculate max amplitude for level meter
        const amplitude = Math.abs(v - 1);
        if (amplitude > maxAmplitude) {
            maxAmplitude = amplitude;
        }
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Update audio level bar
    const levelPercent = Math.min(100, maxAmplitude * 100);
    document.getElementById('audioLevelBar').style.width = levelPercent + '%';
}

// Send audio to API endpoint
async function sendAudioToAPI(audioBlob) {
    try {
        logUART('<< Audio ESP32: Sending audio to Raspberry Pi...');

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('sample_rate', '16000');
        formData.append('format', 'webm');

        const response = await fetch('http://localhost:8080/api/audio/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            logUART(`<< Audio ESP32: Audio sent successfully (${(audioBlob.size / 1024).toFixed(2)} KB)`);
            logUART(`<< Server: ${result.message || 'Audio received'}`);

            // If transcription available, show it
            if (result.transcription) {
                logUART(`<< Whisper: "${result.transcription}"`);
                addSidebarMessage('system', `🎤 Transcription: ${result.transcription}`);
            }
        } else {
            logUART(`<< Audio ESP32: Upload failed - ${response.statusText}`, 'error');
        }
    } catch (error) {
        logUART(`<< Audio ESP32: Network error - ${error.message}`, 'error');
        console.error('Error uploading audio:', error);
    }
}

// Test UART command manually
async function testUARTCommand(command) {
    logUART(`>> Manual Test: ${command}`);

    if (command === 'START_REC' && !isRecording) {
        await startRecording();
    } else if (command === 'STOP_REC' && isRecording) {
        await stopRecording();
    } else {
        logUART(`<< Ignored: Already ${isRecording ? 'recording' : 'stopped'}`, 'warning');
    }
}

// Log UART communication
function logUART(message, type = 'info') {
    const logEl = document.getElementById('uartLog');
    if (!logEl) return;

    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');

    let color = '#0f0';  // Default green
    if (type === 'error') color = '#f44';
    if (type === 'warning') color = '#fa0';
    if (message.startsWith('>>')) color = '#6af';  // Knob ESP32 (blue)
    if (message.startsWith('<<')) color = '#f6a';  // Audio ESP32 (pink)

    entry.style.color = color;
    entry.style.marginBottom = '5px';
    entry.textContent = `[${timestamp}] ${message}`;

    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;

    // Limit log size
    while (logEl.children.length > 50) {
        logEl.removeChild(logEl.children[0]);
    }
}

console.log('🎛️ Smart Knob Simulator ready');
console.log('Toggle the switch to test audio recording workflow');
