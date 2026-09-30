const form = document.querySelector('#curiosity-form');
const nameInput = document.querySelector('#name');
const speakButton = document.querySelector('#speak-button');
const downloadButton = document.querySelector('#download-button');
const downloadStatus = document.querySelector('#download-status');
const analysis = document.querySelector('#analysis');
const result = document.querySelector('#result');
const progressBar = document.querySelector('#progress-bar');
const analysisStep = document.querySelector('#analysis-step');
const analysisStatus = document.querySelector('#analysis-status');
const formContent = document.querySelectorAll('.form-content');
const resultName = document.querySelector('#result-name');
const verdictAudio = document.querySelector('#verdict-audio');
let currentName = document.querySelector('#certificate-name')?.value || '';

if (verdictAudio && currentName) {
  verdictAudio.src = `/verdict-audio/?name=${encodeURIComponent(currentName)}`;
}

verdictAudio?.addEventListener('ended', () => {
  speakButton?.classList.remove('is-speaking');
  if (speakButton) speakButton.innerHTML = '<span>◖</span> HEAR THE VERDICT';
  if (downloadStatus) downloadStatus.textContent = 'Verdict complete.';
});

verdictAudio?.addEventListener('error', () => {
  if (downloadStatus) downloadStatus.textContent = 'Audio could not be generated. Tap to try again.';
});

function speakVerdict() {
  if (!currentName || !speakButton) return;
  if (verdictAudio?.src) {
    verdictAudio.currentTime = 0;
    const playRequest = verdictAudio.play();
    if (playRequest) {
      playRequest.then(() => {
        speakButton.innerHTML = '<span>◖</span> VERDICT PLAYING...';
        speakButton.classList.add('is-speaking');
        if (downloadStatus) downloadStatus.textContent = 'Playing your verdict...';
      }).catch(() => {
        if (downloadStatus) downloadStatus.textContent = 'Tap “Hear the Verdict” to enable audio.';
      });
    }
    return;
  }
  if (!('speechSynthesis' in window)) {
    speakButton.innerHTML = '<span>!</span> SPEECH IS NOT SUPPORTED';
    if (downloadStatus) downloadStatus.textContent = 'Try Chrome, Edge, or Safari for spoken audio.';
    return;
  }
  const speech = window.speechSynthesis;
  speech.cancel();
  speech.resume();
  const utterance = new SpeechSynthesisUtterance(`Congratulations ${currentName}, you're gay.`);
  const voices = speech.getVoices();
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));
  if (englishVoice) utterance.voice = englishVoice;
  utterance.lang = englishVoice?.lang || 'en-US';
  utterance.rate = 0.92;
  utterance.volume = 1;
  utterance.onstart = () => {
    speakButton.innerHTML = '<span>◖</span> VERDICT PLAYING...';
    speakButton.classList.add('is-speaking');
    if (downloadStatus) downloadStatus.textContent = 'Playing your verdict...';
  };
  utterance.onerror = () => {
    speakButton.innerHTML = '<span>◖</span> TAP TO HEAR VERDICT';
    speakButton.classList.remove('is-speaking');
    if (downloadStatus) downloadStatus.textContent = 'Audio was blocked. Tap “Hear the Verdict” to try again.';
  };
  utterance.onend = () => {
    speakButton.innerHTML = '<span>◖</span> HEAR THE VERDICT';
    speakButton.classList.remove('is-speaking');
    if (downloadStatus) downloadStatus.textContent = 'Verdict complete.';
  };
  speech.speak(utterance);
  if (!voices.length) {
    speech.addEventListener('voiceschanged', () => {
      if (speech.pending || speech.speaking) return;
      speech.speak(utterance);
    }, { once: true });
  }
}

function drumRoll() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const start = context.currentTime;
  for (let index = 0; index < 18; index += 1) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 95 + index * 3;
    gain.gain.setValueAtTime(0.0001, start + index * 0.055);
    gain.gain.exponentialRampToValueAtTime(0.12, start + index * 0.055 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.055 + 0.05);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start + index * 0.055);
    oscillator.stop(start + index * 0.055 + 0.06);
  }
  window.setTimeout(() => context.close(), 1200);
}

function confettiBurst() {
  const colors = ['#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#277da1', '#7b2cbf'];
  for (let index = 0; index < 70; index += 1) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 220}px`);
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 2300);
  }
}

function revealCertificate() {
  analysis.hidden = true;
  result.hidden = false;
  result.classList.add('is-visible');
  document.body.classList.add('revealed');
  confettiBurst();
  drumRoll();
  speakVerdict();
}

function runAnalysis() {
  if (!analysis || !result || !progressBar || !analysisStep || !analysisStatus) return;
  const steps = ['Analyzing name patterns...', 'Checking official records...', 'Calculating IQ...', 'Result found...'];
  let step = 0;
  progressBar.style.width = '0%';
  analysisStep.textContent = 'Connecting to the assessment engine...';
  analysisStatus.textContent = 'STARTING';
  const interval = window.setInterval(() => {
    analysisStep.textContent = steps[step];
    progressBar.style.width = `${((step + 1) / steps.length) * 100}%`;
    analysisStatus.textContent = 'RUNNING';
    step += 1;
    if (step === steps.length) {
      window.clearInterval(interval);
      analysisStatus.textContent = 'COMPLETE';
      window.setTimeout(revealCertificate, 250);
    }
  }, 350);
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  currentName = nameInput.value.trim().replace(/\s+/g, ' ');
  if (!currentName) return;
  if (!analysis || !result) {
    window.location.assign(`/certificate/view/?name=${encodeURIComponent(currentName)}`);
    return;
  }
  resultName.textContent = currentName;
  if (verdictAudio) {
    verdictAudio.src = `/verdict-audio/?name=${encodeURIComponent(currentName)}`;
    verdictAudio.load();
  }
  formContent.forEach((element) => { element.hidden = true; });
  analysis.hidden = false;
  runAnalysis();
});

speakButton?.addEventListener('click', speakVerdict);

downloadButton?.addEventListener('click', async () => {
  if (!currentName) return;
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  downloadButton.disabled = true;
  downloadStatus.textContent = 'Preparing your highly official document...';
  try {
    const response = await fetch('/certificate/', {
      method: 'POST',
      headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: currentName }),
    });
    if (!response.ok) throw new Error('certificate request failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentName.replace(/\s+/g, '-')}-gay-certificate.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    downloadStatus.textContent = 'Certificate downloaded. Frame it immediately.';
  } catch (error) {
    downloadStatus.textContent = 'Something went wrong. Please try again.';
  } finally {
    downloadButton.disabled = false;
  }
});

if (!form) runAnalysis();
