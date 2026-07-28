// Shared utilities for Educational Hub

// 1. Initialize Page Header & Background Blobs
function initSharedPage(title, isSubdir = true) {
  // Set page title
  document.title = `${title} - មជ្ឈមណ្ឌលឧបករណ៍អប់រំ`;

  // Add glowing background blobs if they don't exist
  if (!document.querySelector('.bg-blobs')) {
    const blobs = document.createElement('div');
    blobs.className = 'bg-blobs';
    blobs.innerHTML = `
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    `;
    document.body.prepend(blobs);
  }

  // Create standard header with Back button
  const header = document.createElement('header');
  header.className = 'app-header';
  
  const backPath = isSubdir ? '../../index.html' : 'index.html';
  
  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem;">
      <a href="${backPath}" class="back-btn" onclick="playClickSound()">
        <span>⬅️</span> ត្រលប់ក្រោយ
      </a>
      <h1 style="font-size: 1.5rem; font-weight: 700; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        ${title}
      </h1>
    </div>
    <div style="font-size: 1.5rem;">🎒🏫</div>
  `;
  
  document.body.prepend(header);
}

// 2. Play Sound Effects using Web Audio API (No files required!)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Quick ascending major arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.3);
    });
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function playFailSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

// 3. Trigger Beautiful Confetti Burst
function triggerConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316'];
  const count = 100;
  
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    
    // Randomize properties
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = Math.random() * 12 + 6 + 'px';
    piece.style.height = piece.style.width;
    
    // Random custom shapes (circles, squares, triangles)
    const shapes = ['50%', '0%', '10% 50% 50% 50%'];
    piece.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
    
    const delay = Math.random() * 2;
    const duration = Math.random() * 2 + 2;
    piece.style.animationDelay = delay + 's';
    piece.style.animationDuration = duration + 's';
    
    container.appendChild(piece);
  }
  
  // Clean up
  setTimeout(() => {
    container.remove();
  }, 4500);
}

// 4. Custom Toast Notifications
function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  // Reset classes and set type
  toast.className = `toast toast-${type}`;
  
  let emoji = 'ℹ️';
  if (type === 'success') emoji = '✅';
  if (type === 'error') emoji = '❌';
  
  toast.innerHTML = `<span>${emoji}</span> <span>${message}</span>`;
  
  // Show
  setTimeout(() => toast.classList.add('show'), 50);
  
  // Auto hide
  const hideTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
  
  // Store timeout on element to cancel if called again
  if (toast.dataset.timeoutId) {
    clearTimeout(parseInt(toast.dataset.timeoutId));
  }
  toast.dataset.timeoutId = hideTimeout;
}

// 5. Local Storage Student Helpers
const STORAGE_KEY = 'edu_hub_students';

function getStudents() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}
