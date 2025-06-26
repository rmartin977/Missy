let mediaRecorder;
let audioChunks = [];
let recordTimeout;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');

startBtn.onclick = async () => {
  // Remove old audio players and label
  document.querySelectorAll("audio, #audioLabel").forEach(el => el.remove());

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioURL = URL.createObjectURL(audioBlob);

    // Create or update audio player
    let audioElem = document.getElementById("audioPlayer");
    if (!audioElem) {
      audioElem = document.createElement("audio");
      audioElem.id = "audioPlayer";
      audioElem.controls = true;
      audioElem.style.display = "block";
      audioElem.style.margin = "20px auto";
      document.body.appendChild(audioElem);
    }
    audioElem.src = audioURL;

    // Add label under the audio player
    let label = document.getElementById("audioLabel");
    if (!label) {
      label = document.createElement("div");
      label.id = "audioLabel";
      label.textContent = "Play Recording";
      label.style.marginTop = "5px";
      label.style.fontSize = "14px";
      label.style.color = "#333";
      label.style.textAlign = "center";
      document.body.appendChild(label);
    }

    status.textContent = "Recording complete! Sending audio to server...";

    // Send the audioBlob to the backend
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    fetch('https://voice-backend-py8p.onrender.com', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      status.textContent = data.summary || data.error;

      if (data.plot) {
        let img = document.getElementById("waveformPlot");

        if (!img) {
          img = document.createElement("img");
          img.id = "waveformPlot";
          document.body.appendChild(img);
        }

        const mime = data.format === 'svg' ? 'image/svg+xml' : 'image/png';
        img.src = "data:" + mime + ";base64," + data.plot;

        img.style.display = "block";
        img.style.marginTop = "10px";
        img.style.marginBottom = "20px";
        img.style.maxWidth = "90%";
        img.style.marginLeft = "auto";
        img.style.marginRight = "auto";
      }
    })
    .catch(error => {
      console.error('Error sending audio:', error);
      status.textContent = "Upload failed.";
    });
  };

  mediaRecorder.start();
  status.textContent = "Recording...";

  startBtn.disabled = true;
  stopBtn.disabled = false;

  recordTimeout = setTimeout(() => {
    stopRecording();
  }, 10000);
};

stopBtn.onclick = () => {
  stopRecording();
};

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    clearTimeout(recordTimeout);
    stopBtn.disabled = true;
    startBtn.disabled = false;
    status.textContent = "Processing...";
  }
}
