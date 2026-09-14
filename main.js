// Lipstick symbols data
const LIPSTICKS = {
  // MAC - bold black/red theme
  MAC_RUBY: { brand: 'MAC', shade: 'Ruby Woo', color: '#d31818', cap: '#000' },
  MAC_VELVET: { brand: 'MAC', shade: 'Velvet Teddy', color: '#9b5b5b', cap: '#000' },
  MAC_CANDY: { brand: 'MAC', shade: 'Candy Yum-Yum', color: '#ff3399', cap: '#000' },
  
  // YSL - gold/black luxury theme
  YSL_ROUGE: { brand: 'YSL', shade: 'Rouge Pur', color: '#b91b1b', cap: '#d4af37' },
  YSL_NUDE: { brand: 'YSL', shade: 'Nude Beige', color: '#c4a088', cap: '#d4af37' },
  YSL_ROSE: { brand: 'YSL', shade: 'Rose Stiletto', color: '#e91e63', cap: '#d4af37' },
  
  // NYX - playful neon/black theme
  NYX_NEON: { brand: 'NYX', shade: 'Neon Pink', color: '#ff10f0', cap: '#000' },
  NYX_BERRY: { brand: 'NYX', shade: 'Berry Blast', color: '#8e24aa', cap: '#000' },
  NYX_CORAL: { brand: 'NYX', shade: 'Coral Pop', color: '#ff6b6b', cap: '#000' }
};

const SYMBOL_KEYS = Object.keys(LIPSTICKS);

// Game state
let credits = 100;
let currentBet = 1;
let isSpinning = false;
let isMuted = false;

// Audio context for sounds
let audioContext = null;
let isAudioInitialized = false;

// Initialize audio on first user interaction
function initAudio() {
  if (!isAudioInitialized) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      isAudioInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }
}

// Play sound effect
function playSound(type) {
  if (isMuted || !audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (type === 'spin') {
    oscillator.frequency.value = 200;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } else if (type === 'win') {
    // Play a nice chord for wins
    [400, 500, 600].forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc.start(audioContext.currentTime + i * 0.05);
      osc.stop(audioContext.currentTime + 0.5 + i * 0.05);
    });
  }
}

// Create SVG lipstick symbol
function createLipstickSVG(symbolKey) {
  const lipstick = LIPSTICKS[symbolKey];
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  
  // Cap
  const cap = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  cap.setAttribute('x', '35');
  cap.setAttribute('y', '10');
  cap.setAttribute('width', '30');
  cap.setAttribute('height', '25');
  cap.setAttribute('rx', '3');
  cap.setAttribute('fill', lipstick.cap);
  cap.setAttribute('stroke', lipstick.cap === '#000' ? '#333' : '#b8860b');
  cap.setAttribute('stroke-width', '1');
  svg.appendChild(cap);
  
  // Cap detail
  const capDetail = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  capDetail.setAttribute('x1', '38');
  capDetail.setAttribute('y1', '22');
  capDetail.setAttribute('x2', '62');
  capDetail.setAttribute('y2', '22');
  capDetail.setAttribute('stroke', lipstick.cap === '#000' ? '#555' : '#ffd700');
  capDetail.setAttribute('stroke-width', '1');
  svg.appendChild(capDetail);
  
  // Base tube
  const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  base.setAttribute('x', '38');
  base.setAttribute('y', '35');
  base.setAttribute('width', '24');
  base.setAttribute('height', '45');
  base.setAttribute('rx', '2');
  base.setAttribute('fill', '#1a1a1a');
  base.setAttribute('stroke', '#333');
  base.setAttribute('stroke-width', '1');
  svg.appendChild(base);
  
  // Brand label area
  const label = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  label.setAttribute('x', '40');
  label.setAttribute('y', '50');
  label.setAttribute('width', '20');
  label.setAttribute('height', '15');
  label.setAttribute('fill', lipstick.cap);
  label.setAttribute('opacity', '0.3');
  svg.appendChild(label);
  
  // Lipstick tip
  const tip = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  tip.setAttribute('points', '50,15 45,32 55,32');
  tip.setAttribute('fill', lipstick.color);
  tip.setAttribute('stroke', '#000');
  tip.setAttribute('stroke-width', '0.5');
  svg.appendChild(tip);
  
  // Lipstick shine
  const shine = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  shine.setAttribute('cx', '48');
  shine.setAttribute('cy', '22');
  shine.setAttribute('rx', '2');
  shine.setAttribute('ry', '4');
  shine.setAttribute('fill', '#fff');
  shine.setAttribute('opacity', '0.4');
  svg.appendChild(shine);
  
  // Brand text
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '50');
  text.setAttribute('y', '90');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '8');
  text.setAttribute('font-weight', 'bold');
  text.setAttribute('fill', lipstick.cap === '#d4af37' ? '#d4af37' : '#fff');
  text.textContent = lipstick.brand;
  svg.appendChild(text);
  
  return svg;
}

// Get random symbol
function getRandomSymbol() {
  return SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
}

// Check for wins
function checkWin(reels) {
  const [reel1, reel2, reel3] = reels;
  
  // Three of the same symbol (exact match)
  if (reel1 === reel2 && reel2 === reel3) {
    return { type: 'exact', multiplier: 10, symbols: [0, 1, 2] };
  }
  
  // Three of the same brand (any shades)
  const brand1 = LIPSTICKS[reel1].brand;
  const brand2 = LIPSTICKS[reel2].brand;
  const brand3 = LIPSTICKS[reel3].brand;
  
  if (brand1 === brand2 && brand2 === brand3) {
    return { type: 'brand', multiplier: 3, symbols: [0, 1, 2] };
  }
  
  return null;
}

// Update UI
function updateStats() {
  document.getElementById('credits').textContent = credits;
  document.getElementById('bet').textContent = currentBet;
}

function updateBetButtons() {
  document.querySelectorAll('.bet-button').forEach(btn => {
    const bet = parseInt(btn.dataset.bet);
    btn.classList.toggle('active', bet === currentBet);
    btn.disabled = isSpinning || credits < bet;
  });
}

function showWinBanner(amount) {
  const banner = document.querySelector('.win-banner');
  banner.textContent = `Gewonnen! ${amount}`;
  banner.classList.add('show');
  
  setTimeout(() => {
    banner.classList.remove('show');
  }, 2000);
}

// Spin logic
async function spin() {
  if (isSpinning || credits < currentBet) return;
  
  initAudio();
  isSpinning = true;
  credits -= currentBet;
  updateStats();
  updateBetButtons();
  
  const spinButton = document.getElementById('spin-button');
  spinButton.disabled = true;
  spinButton.textContent = 'Dreht...';
  
  playSound('spin');
  
  // Get reel elements
  const reelElements = document.querySelectorAll('.reel');
  
  // Add spinning animation
  reelElements.forEach(reel => {
    reel.classList.add('spinning');
  });
  
  // Generate random results
  const results = [
    getRandomSymbol(),
    getRandomSymbol(),
    getRandomSymbol()
  ];
  
  // Wait for animation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Update symbols
  reelElements.forEach((reel, i) => {
    reel.classList.remove('spinning');
    const symbolDiv = reel.querySelector('.symbol');
    symbolDiv.innerHTML = '';
    symbolDiv.appendChild(createLipstickSVG(results[i]));
  });
  
  // Check for win
  const win = checkWin(results);
  
  if (win) {
    const winAmount = currentBet * win.multiplier;
    credits += winAmount;
    
    // Highlight winning reels
    win.symbols.forEach(i => {
      reelElements[i].classList.add('winning');
    });
    
    playSound('win');
    showWinBanner(winAmount);
    
    setTimeout(() => {
      reelElements.forEach(reel => reel.classList.remove('winning'));
    }, 1000);
  }
  
  updateStats();
  updateBetButtons();
  
  isSpinning = false;
  spinButton.disabled = credits < currentBet;
  spinButton.textContent = 'Drehen';
}

// Initialize app
function init() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="header">
      <h1>💄 Lipstick Slot</h1>
      <p>MAC · YSL · NYX</p>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Guthaben</div>
        <div class="stat-value" id="credits">${credits}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Einsatz</div>
        <div class="stat-value" id="bet">${currentBet}</div>
      </div>
    </div>
    
    <div class="slot-machine">
      <div class="reels">
        <div class="reel">
          <div class="symbol"></div>
        </div>
        <div class="reel">
          <div class="symbol"></div>
        </div>
        <div class="reel">
          <div class="symbol"></div>
        </div>
      </div>
      
      <div class="win-banner"></div>
      
      <div class="controls">
        <div class="bet-selector">
          <button class="bet-button active" data-bet="1">1</button>
          <button class="bet-button" data-bet="5">5</button>
          <button class="bet-button" data-bet="10">10</button>
        </div>
        
        <button class="spin-button" id="spin-button">Drehen</button>
      </div>
    </div>
    
    <div class="footer">
      <div class="disclaimer">Nur zur Unterhaltung. Kein echtes Geld.</div>
      <button class="mute-toggle" id="mute-toggle">🔊</button>
    </div>
  `;
  
  // Initialize symbols
  const reelElements = document.querySelectorAll('.reel');
  reelElements.forEach(reel => {
    const symbolDiv = reel.querySelector('.symbol');
    symbolDiv.appendChild(createLipstickSVG(getRandomSymbol()));
  });
  
  // Event listeners
  document.getElementById('spin-button').addEventListener('click', spin);
  
  document.querySelectorAll('.bet-button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isSpinning) {
        currentBet = parseInt(btn.dataset.bet);
        updateStats();
        updateBetButtons();
      }
    });
  });
  
  document.getElementById('mute-toggle').addEventListener('click', () => {
    isMuted = !isMuted;
    const toggle = document.getElementById('mute-toggle');
    toggle.textContent = isMuted ? '🔇' : '🔊';
    toggle.classList.toggle('muted', isMuted);
  });
  
  updateBetButtons();
}

// Start the app
init();
