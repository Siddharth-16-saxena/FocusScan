/* ==========================================================================
   FOCUSSCAN - SYSTEM CONTROLLER & CORE JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. STATE & THEME CONFIGURATION
  // ==========================================================================
  const state = {
    focusScore: 85,
    isTracking: false,
    cameraActive: false,
    cameraInterval: null,
    gazeState: 'LOCK', // LOCK, DRIFT
    restlessness: 0.0, // 0 to 100%
    blinkCount: 0,
    distractionCount: 0,
    
    // Timer
    timerSeconds: 1500, // 25:00
    timerInterval: null,
    timerRunning: false,
    timerMode: 'FOCUS', // FOCUS, BREAK

    // Web Audio Soundscape
    audioCtx: null,
    soundscapeNode: null,
    isPlayingSound: false,
    lowpassFilter: null,

    // Task Checklist
    tasks: [
      { id: 1, text: "Formulate structured MySQL model definitions", done: false, category: "DATABASE" },
      { id: 2, text: "Establish Node.js backend task bottleneck listeners", done: false, category: "BACKEND" },
      { id: 3, text: "Integrate Python Pandas metrics analyzer script", done: false, category: "ANALYTICS" }
    ],

    // Ingested CSV log rows
    ingestedLogs: null,
    activeChart: null,

    // Simulated Relational Database Records (Live state queryable by custom SQL)
    mysqlDatabase: [
      { task_id: 1, task_name: "Data Migration Pipeline", duration_hours: 4.2, delay_hours: 1.8, service_node: "NodeJS-Gateway" },
      { task_id: 2, task_name: "MySQL Index Optimization", duration_hours: 2.5, delay_hours: 0.4, service_node: "NodeJS-Gateway" },
      { task_id: 3, task_name: "Pandas Trend Synthesis", duration_hours: 5.1, delay_hours: 3.2, service_node: "Python-Analytics" },
      { task_id: 4, task_name: "REST Schema Syncing", duration_hours: 1.1, delay_hours: 0.1, service_node: "NodeJS-Gateway" },
      { task_id: 5, task_name: "Java Job Synchronization", duration_hours: 8.4, delay_hours: 4.9, service_node: "Java-Scheduler" }
    ]
  };

  // Color Theme Config Palette
  const themeColors = {
    cobalt: {
      primary: '#2563eb',
      subtle: 'rgba(37, 99, 235, 0.1)',
      glow: 'rgba(37, 99, 235, 0.15)',
      chartBg1: 'rgba(37, 99, 235, 0.4)',
      chartBorder1: '#2563eb'
    },
    emerald: {
      primary: '#10b981',
      subtle: 'rgba(16, 185, 129, 0.1)',
      glow: 'rgba(16, 185, 129, 0.15)',
      chartBg1: 'rgba(16, 185, 129, 0.4)',
      chartBorder1: '#10b981'
    },
    amber: {
      primary: '#f59e0b',
      subtle: 'rgba(245, 158, 11, 0.1)',
      glow: 'rgba(245, 158, 11, 0.15)',
      chartBg1: 'rgba(245, 158, 11, 0.4)',
      chartBorder1: '#f59e0b'
    },
    lavender: {
      primary: '#8b5cf6',
      subtle: 'rgba(139, 92, 246, 0.1)',
      glow: 'rgba(139, 92, 246, 0.15)',
      chartBg1: 'rgba(139, 92, 246, 0.4)',
      chartBorder1: '#8b5cf6'
    },
    rose: {
      primary: '#f43f5e',
      subtle: 'rgba(244, 63, 94, 0.1)',
      glow: 'rgba(244, 63, 94, 0.15)',
      chartBg1: 'rgba(244, 63, 94, 0.4)',
      chartBorder1: '#f43f5e'
    }
  };

  let activeThemeKey = 'cobalt';

  // ==========================================================================
  // 2. DOM CACHE SELECTORS
  // ==========================================================================
  const el = {
    // Header
    btnToggleCam: document.getElementById('btn-toggle-camera'),
    btnAmbientSound: document.getElementById('btn-ambient-sound'),
    systemStateVal: document.getElementById('system-state-val'),
    currentFlowVal: document.getElementById('current-flow-val'),
    themePicker: document.getElementById('theme-accent-picker'),

    // Camera HUD
    cameraPlaceholder: document.getElementById('camera-placeholder'),
    cameraSecureWarning: document.getElementById('camera-secure-warning'),
    copyServerCmd: document.getElementById('copy-server-cmd'),
    btnCamInlineStart: document.getElementById('btn-camera-inline-start'),
    webcam: document.getElementById('webcam'),
    cameraCanvas: document.getElementById('camera-canvas'),
    attentionHud: document.getElementById('attention-hud'),
    cameraStatusBadge: document.getElementById('camera-status-badge'),
    
    hudGazeState: document.getElementById('hud-gaze-state'),
    hudRestlessVal: document.getElementById('hud-restless-val'),
    hudAttentionVal: document.getElementById('hud-attention-val'),
    camEngagementStat: document.getElementById('cam-engagement-stat'),
    camBlinkStat: document.getElementById('cam-blink-stat'),
    camDistractionStat: document.getElementById('cam-distraction-stat'),

    // Mascot Viewport & Elements
    mascotViewport: document.getElementById('mascot-viewport-element'),
    mascotSvg: document.getElementById('mascot-svg'),
    pupilLeft: document.getElementById('pupil-left'),
    pupilRight: document.getElementById('pupil-right'),
    flowyMouth: document.getElementById('flowy-mouth'),
    mascotCore: document.getElementById('mascot-core'),
    mascotMoodText: document.getElementById('mascot-mood-text'),
    mascotSpeech: document.getElementById('mascot-speech'),

    // Timer
    timerDigits: document.getElementById('timer-digits'),
    timerProgressBar: document.getElementById('timer-progress-bar'),
    timerModeLabel: document.getElementById('timer-mode-label'),
    btnTimerStart: document.getElementById('btn-timer-start'),
    btnTimerReset: document.getElementById('btn-timer-reset'),
    btnTimerBreak: document.getElementById('btn-timer-break'),

    // Tasks
    taskInput: document.getElementById('task-input'),
    btnAddTask: document.getElementById('btn-add-task'),
    taskList: document.getElementById('task-list-element'),
    taskFraction: document.getElementById('task-completed-fraction'),

    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Tab 1: Pandas
    downloadSample: document.getElementById('download-sample-link'),
    logUploader: document.getElementById('log-uploader'),
    logFileInput: document.getElementById('log-file-input'),
    pandasLog: document.getElementById('pandas-console-log'),

    // Tab 2: MySQL Explorer
    sqlQueryPreset: document.getElementById('sql-query-preset'),
    sqlCustomInput: document.getElementById('sql-custom-input'),
    btnExecuteSql: document.getElementById('btn-execute-sql'),
    sqlResultsMeta: document.getElementById('sql-results-meta'),
    sqlResultTable: document.getElementById('sql-result-table-el'),

    // Tab 3: REST Swagger
    btnTryApis: document.querySelectorAll('.btn-try-api'),
    apiResponseStatus: document.getElementById('api-response-status'),
    apiJsonViewer: document.getElementById('api-json-viewer-el'),

    // AI Coach Chat
    coachMessages: document.getElementById('coach-messages'),
    coachInput: document.getElementById('coach-input'),
    btnCoachSend: document.getElementById('btn-coach-send')
  };

  // ==========================================================================
  // 3. TAB CONTROLLER ROUTER
  // ==========================================================================
  el.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      el.tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      el.tabContents.forEach(content => {
        if (content.id === targetTab) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // ==========================================================================
  // 4. ZOOM / MAXIMIZE FOCUS CONTROLLERS
  // ==========================================================================
  document.querySelectorAll('.btn-card-zoom').forEach(zoomBtn => {
    zoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = zoomBtn.getAttribute('data-zoom-target');
      const card = document.getElementById(targetId);
      
      if (!card) return;

      const isMaximized = card.classList.toggle('maximized');
      
      // Update Zoom Icon paths
      if (isMaximized) {
        zoomBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/>
          </svg>
        `;
        zoomBtn.setAttribute('title', 'Collapse Card');
      } else {
        zoomBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
        `;
        zoomBtn.setAttribute('title', 'Toggle Fullscreen Focus');
      }
    });
  });

  // ==========================================================================
  // 5. WEBCAM COMPUTER VISION & GRID TELEMETRY
  // ==========================================================================
  let lastFrameData = null;

  async function startCamera() {
    // Diagnose Secure Browser context requirements
    if (window.location.protocol === 'file:') {
      showCameraSecureWarning();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraSecureWarning();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, frameRate: { max: 15 } }, 
        audio: false 
      });
      el.webcam.srcObject = stream;
      el.webcam.style.display = 'block';
      el.cameraCanvas.style.display = 'block';
      el.cameraPlaceholder.style.display = 'none';
      el.cameraSecureWarning.style.display = 'none';
      el.attentionHud.style.display = 'block';
      el.cameraStatusBadge.textContent = 'MONITORING';
      el.cameraStatusBadge.className = 'badge text-blue';
      state.cameraActive = true;
      
      el.btnToggleCam.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" class="margin-right-sm">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
        STOP TELEMETRY
      `;

      // Start actual gray-scale pixel variance delta analyzer
      const ctx = el.cameraCanvas.getContext('2d');
      state.cameraInterval = setInterval(() => {
        analyzeCameraFrame(ctx);
      }, 250); // Scan 4 times per second
      
      appendLog("pandas-console-log", "[info] Webcam attention monitor stream active. calibrating ocular vectors.");
    } catch (err) {
      console.warn("Camera access failed: ", err);
      el.cameraStatusBadge.textContent = 'ERROR';
      el.cameraStatusBadge.className = 'badge text-rose';
      appendLog("pandas-console-log", "[error] Secure camera frame ingestion denied by client device.", "error-line");
    }
  }

  function stopCamera() {
    if (el.webcam.srcObject) {
      el.webcam.srcObject.getTracks().forEach(track => track.stop());
    }
    el.webcam.srcObject = null;
    el.webcam.style.display = 'none';
    el.cameraCanvas.style.display = 'none';
    el.cameraPlaceholder.style.display = 'flex';
    el.cameraSecureWarning.style.display = 'none';
    el.attentionHud.style.display = 'none';
    el.cameraStatusBadge.textContent = 'STANDBY';
    el.cameraStatusBadge.className = 'badge';
    state.cameraActive = false;
    
    if (state.cameraInterval) {
      clearInterval(state.cameraInterval);
      state.cameraInterval = null;
    }
    el.btnToggleCam.innerHTML = `
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" class="margin-right-sm">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      ACTIVATE CAMERA
    `;
    
    state.restlessness = 0;
    state.gazeState = 'LOCK';
    updateHUDStats();
    resetMascotFace();
  }

  function showCameraSecureWarning() {
    el.cameraPlaceholder.style.display = 'none';
    el.webcam.style.display = 'none';
    el.cameraCanvas.style.display = 'none';
    el.attentionHud.style.display = 'none';
    el.cameraSecureWarning.style.display = 'flex';
    el.cameraStatusBadge.textContent = 'SECURE REQ';
    el.cameraStatusBadge.className = 'badge text-rose';
    appendLog("pandas-console-log", "[error] Ocular stream blocked: Browser requires HTTPS or http://localhost pathways to activate cameras.", "error-line");
  }

  // Double-Click/Click copy command actions
  el.copyServerCmd.addEventListener('click', () => {
    navigator.clipboard.writeText("npx http-server ./");
    const oldText = el.copyServerCmd.innerText;
    el.copyServerCmd.innerText = "COPIED TO CLIPBOARD!";
    el.copyServerCmd.style.borderColor = "var(--accent-emerald)";
    el.copyServerCmd.style.color = "var(--accent-emerald)";
    setTimeout(() => {
      el.copyServerCmd.innerText = oldText;
      el.copyServerCmd.style.borderColor = "";
      el.copyServerCmd.style.color = "";
    }, 1500);
  });

  // Mathematical Grayscale Grid Difference Computer Vision
  function analyzeCameraFrame(ctx) {
    if (!el.webcam.videoWidth) return;
    
    el.cameraCanvas.width = 160;
    el.cameraCanvas.height = 120;
    ctx.drawImage(el.webcam, 0, 0, 160, 120);

    const frameData = ctx.getImageData(0, 0, 160, 120);
    const data = frameData.data;

    if (lastFrameData) {
      let totalDiff = 0;
      // Fast sampling matrix calculation
      for (let i = 0; i < data.length; i += 16) {
        const rDiff = Math.abs(data[i] - lastFrameData[i]);
        const gDiff = Math.abs(data[i+1] - lastFrameData[i+1]);
        const bDiff = Math.abs(data[i+2] - lastFrameData[i+2]);
        totalDiff += (rDiff + gDiff + bDiff);
      }
      
      const pixelCount = data.length / 16;
      const normalizedDiff = (totalDiff / (pixelCount * 3 * 255)) * 100;
      
      // Calculate restless motion index
      let currentMovement = Math.min(100, normalizedDiff * 9.5); 
      state.restlessness = (state.restlessness * 0.6) + (currentMovement * 0.4); // smooth dampening
      
      if (state.restlessness > 8.5) {
        state.gazeState = 'DRIFT';
        if (Math.random() < 0.1) {
          state.distractionCount++;
          triggerDistractionAlert();
        }
      } else {
        state.gazeState = 'LOCK';
        // Eye Blink Simulation using localized micro brightness shifts
        if (Math.random() < 0.04) {
          state.blinkCount++;
          animateMascotBlink();
        }
      }
      
      updateHUDStats();
      updateMascotExpression();
    }
    
    lastFrameData = data;
  }

  function updateHUDStats() {
    el.hudGazeState.textContent = state.gazeState;
    el.hudGazeState.className = state.gazeState === 'LOCK' ? 'hud-text-val text-blue' : 'hud-text-val text-rose';
    el.hudRestlessVal.textContent = state.restlessness.toFixed(1) + '%';
    
    let focusStatus = 'HIGH';
    if (state.restlessness > 8.5) {
      focusStatus = 'LOW';
      el.hudAttentionVal.style.color = 'var(--accent-rose)';
    } else if (state.restlessness > 4) {
      focusStatus = 'STABLE';
      el.hudAttentionVal.style.color = 'var(--accent-amber)';
    } else {
      focusStatus = 'LOCK';
      el.hudAttentionVal.style.color = 'var(--accent-primary)';
    }
    el.hudAttentionVal.textContent = focusStatus;

    // Live Flow Score math
    let calculatedFlow = Math.max(10, 100 - (state.restlessness * 4) - (state.distractionCount * 3.5));
    state.focusScore = Math.round(calculatedFlow);
    el.currentFlowVal.textContent = state.focusScore + '%';
    el.camEngagementStat.textContent = Math.round(state.focusScore) + '%';
    el.camBlinkStat.textContent = state.blinkCount;
    el.camDistractionStat.textContent = state.distractionCount;

    if (state.focusScore > 80) {
      el.systemStateVal.textContent = "FLOW CORE";
      el.systemStateVal.style.color = "var(--accent-emerald)";
    } else if (state.focusScore > 50) {
      el.systemStateVal.textContent = "STABLE";
      el.systemStateVal.style.color = "var(--accent-primary)";
    } else {
      el.systemStateVal.textContent = "ATTN_DRIFT";
      el.systemStateVal.style.color = "var(--accent-rose)";
    }

    // Web Audio deep soundscape feedback binding
    if (state.isPlayingSound && state.lowpassFilter) {
      const activeFilterFreq = state.gazeState === 'DRIFT' ? 220 : 380; // deeper wash on focus drift
      state.lowpassFilter.frequency.setTargetAtTime(activeFilterFreq, state.audioCtx.currentTime, 0.4);
    }
  }

  function triggerDistractionAlert() {
    appendLog("pandas-console-log", `[warning] Gaze alignment variance detected: low attention vectors recorded.`, "error-line");
  }

  // ==========================================================================
  // 6. GEOMETRIC MASCOT EYE-TRACKING & ALIVE INTERACTIONS
  // ==========================================================================
  
  // Dynamic eye tracking of cursor coordinates anywhere on screen
  window.addEventListener('mousemove', (e) => {
    if (!el.mascotViewport || state.gazeState === 'DRIFT') return;

    const rect = el.mascotViewport.getBoundingClientRect();
    const mascotCenterX = rect.left + rect.width / 2;
    const mascotCenterY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - mascotCenterY, e.clientX - mascotCenterX);
    const distance = Math.sqrt(Math.pow(e.clientX - mascotCenterX, 2) + Math.pow(e.clientY - mascotCenterY, 2));

    const maxEyeOffset = 4.5; // Constrain pupils inside orbits
    const eyeMovementRatio = Math.min(maxEyeOffset, distance / 70);

    const pupilXOffset = Math.cos(angle) * eyeMovementRatio;
    const pupilYOffset = Math.sin(angle) * eyeMovementRatio;

    // Apply translations to pupils
    el.pupilLeft.setAttribute('cx', (88 + pupilXOffset).toString());
    el.pupilLeft.setAttribute('cy', (96 + pupilYOffset).toString());
    el.pupilRight.setAttribute('cx', (112 + pupilXOffset).toString());
    el.pupilRight.setAttribute('cy', (96 + pupilYOffset).toString());
  });

  function resetMascotFace() {
    el.pupilLeft.setAttribute('cx', '88');
    el.pupilLeft.setAttribute('cy', '96');
    el.pupilRight.setAttribute('cx', '112');
    el.pupilRight.setAttribute('cy', '96');
    el.flowyMouth.setAttribute('d', 'M92 110 L108 110');
    el.mascotCore.setAttribute('stroke', 'var(--accent-primary)');
    el.mascotMoodText.textContent = "STATE: DYNAMIC_CALIBRATION";
    el.mascotSpeech.textContent = '"Awaiting metrics execution or camera stream calibration."';
  }

  function updateMascotExpression() {
    if (state.gazeState === 'DRIFT') {
      el.pupilLeft.setAttribute('cx', '84');
      el.pupilLeft.setAttribute('cy', '98');
      el.pupilRight.setAttribute('cx', '116');
      el.pupilRight.setAttribute('cy', '98');
      el.flowyMouth.setAttribute('d', 'M93 113 Q100 110 107 113');
      el.mascotCore.setAttribute('stroke', 'var(--accent-rose)');
      el.mascotMoodText.textContent = "STATE: FOCUS_DRIFT";
      
      const speeches = [
        '"Gaze alignment tracking deviation recorded."',
        '"Restlessness index threshold exceeded."',
        '"Workflow focus resilience dropping. Center screen alignment suggested."'
      ];
      if (Math.random() < 0.04) {
        el.mascotSpeech.textContent = speeches[Math.floor(Math.random() * speeches.length)];
      }
    } else {
      el.mascotCore.setAttribute('stroke', 'var(--accent-primary)');
      
      if (state.focusScore > 80) {
        el.flowyMouth.setAttribute('d', 'M92 108 Q100 118 108 108'); // Smile
        el.mascotMoodText.textContent = "STATE: FLOW_ZONE";
        if (Math.random() < 0.02) {
          el.mascotSpeech.textContent = '"Metrics show stable focus bounds. Continuous flow locked."';
        }
      } else {
        el.flowyMouth.setAttribute('d', 'M92 110 L108 110'); // Flat focused
        el.mascotMoodText.textContent = "STATE: FOCUS_CALIBRATED";
      }
    }
  }

  function animateMascotBlink() {
    el.pupilLeft.setAttribute('r', '1');
    el.pupilRight.setAttribute('r', '1');
    setTimeout(() => {
      el.pupilLeft.setAttribute('r', '4');
      el.pupilRight.setAttribute('r', '4');
    }, 120);
  }

  // Click & Double-Click Mascot Warping physics trigger
  el.mascotViewport.addEventListener('click', () => {
    el.mascotSvg.classList.remove('warp-pulse');
    void el.mascotSvg.offsetWidth; // Reflow reset hack
    el.mascotSvg.classList.add('warp-pulse');

    const warps = [
      '"Matrix recalibration sequence active! Flow core stabilized."',
      '"Ocular variance offset reset to 0.00ms. Grid clear."',
      '"Brownian procedural filter centering. Attention index peak values locked."',
      '"Relational query pools compiled. Ready to scan custom log backlogs."'
    ];
    el.mascotSpeech.textContent = warps[Math.floor(Math.random() * warps.length)];
    
    // Emerald color pulse flash on mascot core
    el.mascotCore.setAttribute('stroke', 'var(--accent-emerald)');
    setTimeout(() => {
      el.mascotCore.setAttribute('stroke', 'var(--accent-primary)');
    }, 600);
  });

  // ==========================================================================
  // 7. POMODORO TIMER WORKFLOW (AUTONOMOUS DATABASE LOG INSERTS)
  // ==========================================================================
  function updateTimerUI() {
    const mins = Math.floor(state.timerSeconds / 60);
    const secs = state.timerSeconds % 60;
    el.timerDigits.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const maxSeconds = state.timerMode === 'FOCUS' ? 1500 : 300;
    const percentage = state.timerSeconds / maxSeconds;
    const offset = 477 - (percentage * 477);
    el.timerProgressBar.style.strokeDashoffset = offset.toString();
  }

  function startTimer() {
    if (state.timerInterval) return;
    
    state.timerRunning = true;
    el.btnTimerStart.textContent = "PAUSE";
    el.btnTimerStart.className = "btn btn-secondary btn-sm";
    
    state.timerInterval = setInterval(() => {
      if (state.timerSeconds > 0) {
        state.timerSeconds--;
        updateTimerUI();
      } else {
        // Pomodoro Cycle Complete
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.timerRunning = false;
        
        if (state.timerMode === 'FOCUS') {
          // INSERT actual Completion Record directly into local MySQL Relational Database
          const newId = state.mysqlDatabase.length + 1;
          const pomodoroTask = {
            task_id: newId,
            task_name: "Focus block complete",
            duration_hours: 0.42,
            delay_hours: 0.0,
            service_node: "Pomodoro-Scheduler"
          };
          
          state.mysqlDatabase.push(pomodoroTask);
          executeMockSQL("all"); // Refresh tables
          renderChart(state.mysqlDatabase); // Refresh charts
          
          appendLog("pandas-console-log", "[success] Completed 25m Focus Block. MySQL database updated.", "success-line");
          state.timerSeconds = 300; // Break
          state.timerMode = 'BREAK';
          el.timerModeLabel.textContent = "REST BREAK";
          el.timerProgressBar.style.stroke = "var(--accent-emerald)";
        } else {
          state.timerSeconds = 1500; // Focus
          state.timerMode = 'FOCUS';
          el.timerModeLabel.textContent = "FOCUS BLOCK";
          el.timerProgressBar.style.stroke = "var(--accent-primary)";
        }
        el.btnTimerStart.textContent = "START WORK";
        el.btnTimerStart.className = "btn btn-primary btn-sm";
        updateTimerUI();
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.timerRunning = false;
    el.btnTimerStart.textContent = "RESUME";
    el.btnTimerStart.className = "btn btn-primary btn-sm";
  }

  function resetTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.timerRunning = false;
    state.timerSeconds = state.timerMode === 'FOCUS' ? 1500 : 300;
    el.btnTimerStart.textContent = "START WORK";
    el.btnTimerStart.className = "btn btn-primary btn-sm";
    updateTimerUI();
  }

  // ==========================================================================
  // 8. PROCEDURAL BROWNIAN SOUNDSCAPE ENGINE
  // ==========================================================================
  function toggleAmbientSound() {
    if (state.isPlayingSound) {
      if (state.soundscapeNode) {
        state.soundscapeNode.stop();
        state.soundscapeNode = null;
      }
      state.isPlayingSound = false;
      el.btnAmbientSound.style.color = "var(--text-slate-400)";
      el.btnAmbientSound.style.background = "var(--bg-slate-800)";
    } else {
      try {
        if (!state.audioCtx) {
          state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const ctx = state.audioCtx;
        const bufferSize = 4 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.06; // extremely low volume comfortable safety limits
          b6 = white * 0.115926;
        }

        const whiteNoiseSource = ctx.createBufferSource();
        whiteNoiseSource.buffer = noiseBuffer;
        whiteNoiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

        whiteNoiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoiseSource.start(0);
        state.soundscapeNode = whiteNoiseSource;
        state.lowpassFilter = filter;
        state.isPlayingSound = true;
        
        el.btnAmbientSound.style.color = "var(--text-white)";
        el.btnAmbientSound.style.background = "var(--accent-primary)";
      } catch (e) {
        console.warn("Audio Context blocked: ", e);
      }
    }
  }

  // ==========================================================================
  // 9. PANDAS INGESTION CORE & FILE DRAG DRAG PARSER
  // ==========================================================================
  el.downloadSample.addEventListener('click', (e) => {
    e.preventDefault();
    const csvContent = 
`task_id,task_name,duration_hours,delay_hours,service_node,db_writes
1,Data Migration Pipeline,4.2,1.8,NodeJS-Gateway,1242
2,MySQL Index Optimization,2.5,0.4,NodeJS-Gateway,420
3,Pandas Trend Synthesis,5.1,3.2,Python-Analytics,0
4,REST Schema Syncing,1.1,0.1,NodeJS-Gateway,80
5,Java Job Synchronization,8.4,4.9,Java-Scheduler,2240`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "focusscan_workflow_metrics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    appendLog("pandas-console-log", "[info] Downloaded workflow CSV sample structure.", "success-line");
  });

  // Drag actions
  el.logUploader.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.logUploader.classList.add('dragover');
  });
  el.logUploader.addEventListener('dragleave', () => {
    el.logUploader.classList.remove('dragover');
  });
  el.logUploader.addEventListener('drop', (e) => {
    e.preventDefault();
    el.logUploader.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleCSVFile(e.dataTransfer.files[0]);
  });
  el.logUploader.addEventListener('click', () => el.logFileInput.click());
  el.logFileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleCSVFile(e.target.files[0]);
  });

  function handleCSVFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      processCSVContent(e.target.result, file.name);
    };
    reader.readAsText(file);
  }

  function processCSVContent(text, filename) {
    appendLog("pandas-console-log", `>>> import pandas as pd`, "pandas-stat");
    appendLog("pandas-console-log", `>>> df = pd.read_csv('${filename}')`, "pandas-stat");

    try {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const headers = lines[0].split(',');
      const rows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const r = {};
        headers.forEach((h, idx) => {
          r[h.trim()] = cols[idx] ? cols[idx].trim() : '';
        });
        rows.push(r);
      }

      state.ingestedLogs = rows;
      
      // Update simulated MySQL relational model
      state.mysqlDatabase = rows.map(r => ({
        task_id: parseInt(r.task_id) || Math.floor(Math.random()*100),
        task_name: r.task_name,
        duration_hours: parseFloat(r.duration_hours) || 0,
        delay_hours: parseFloat(r.delay_hours) || 0,
        service_node: r.service_node || 'Gateway'
      }));

      // Refresh outputs
      renderChart(state.mysqlDatabase);
      executeMockSQL("SELECT * FROM workflow_metrics;");

      appendLog("pandas-console-log", `>>> print(df.describe())`, "pandas-stat");
      appendLog("pandas-console-log", `df.shape = (${rows.length}, ${headers.length})`, "success-line");
      
      const bottlenecks = rows.filter(r => (parseFloat(r.delay_hours) || 0) > 1.5);
      appendLog("pandas-console-log", `Detected ${bottlenecks.length} tasks with delay > 1.5h.`, "error-line");
    } catch (err) {
      appendLog("pandas-console-log", `>>> [error] Failed to clean metrics dataframe.`, "error-line");
    }
  }

  function appendLog(elemId, text, className = "") {
    const parent = document.getElementById(elemId);
    if (!parent) return;
    const line = document.createElement('div');
    line.className = `log-line ${className}`;
    line.textContent = text;
    parent.appendChild(line);
    parent.scrollTop = parent.scrollHeight;
  }

  // ==========================================================================
  // 10. LIGHTWEIGHT CLIENT-SIDE SQL INTERPRETER ENGINE
  // ==========================================================================
  
  // Prest selects copy into Custom Text Input
  el.sqlQueryPreset.addEventListener('change', () => {
    el.sqlCustomInput.value = el.sqlQueryPreset.value;
  });

  el.btnExecuteSql.addEventListener('click', () => {
    const query = el.sqlCustomInput.value.trim();
    executeCustomSQL(query);
  });

  // Keep select options aligned
  function executeMockSQL(preset) {
    if (preset === "all") executeCustomSQL("SELECT * FROM workflow_metrics;");
    else if (preset === "bottlenecks") executeCustomSQL("SELECT * FROM workflow_metrics WHERE delay_hours > 1.5;");
    else if (preset === "heavy") executeCustomSQL("SELECT * FROM workflow_metrics ORDER BY duration_hours DESC;");
  }

  function executeCustomSQL(queryStr) {
    if (!queryStr) return;

    let resultRows = [];
    const normalized = queryStr.toLowerCase().replace(/\s+/g, ' ').replace(/;$/, '').trim();

    try {
      // Regex 1: SELECT * FROM workflow_metrics;
      if (normalized === "select * from workflow_metrics") {
        resultRows = [...state.mysqlDatabase];
      } 
      // Regex 2: SELECT * FROM workflow_metrics WHERE delay_hours > [Decimal]
      else if (normalized.startsWith("select * from workflow_metrics where delay_hours >")) {
        const thresholdMatch = normalized.match(/delay_hours\s*>\s*(\d+\.?\d*)/);
        if (thresholdMatch) {
          const limit = parseFloat(thresholdMatch[1]);
          resultRows = state.mysqlDatabase.filter(r => r.delay_hours > limit);
        } else {
          throw new Error("Syntax error inside SQL WHERE evaluation");
        }
      } 
      // Regex 3: SELECT * FROM workflow_metrics ORDER BY [field] [DESC/ASC]
      else if (normalized.startsWith("select * from workflow_metrics order by")) {
        const sortMatch = normalized.match(/order\s+by\s+(\w+)\s*(desc|asc)?/);
        if (sortMatch) {
          const field = sortMatch[1];
          const desc = sortMatch[2] === 'desc';
          
          if (field !== 'duration_hours' && field !== 'delay_hours' && field !== 'task_id') {
            throw new Error(`Execution error: Field '${field}' is not indexed for ordering.`);
          }
          
          resultRows = [...state.mysqlDatabase].sort((a, b) => {
            if (desc) return b[field] - a[field];
            return a[field] - b[field];
          });
        } else {
          throw new Error("Syntax error inside SQL ORDER BY evaluation");
        }
      } 
      // Regex 4: INSERT INTO workflow_metrics VALUES (ID, 'Name', Duration, Delay, 'Node')
      else if (normalized.startsWith("insert into workflow_metrics")) {
        const insertMatch = queryStr.match(/values\s*\(\s*(\d+)\s*,\s*'([^']*)'\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*'([^']*)'\s*\)/i);
        if (insertMatch) {
          const newRow = {
            task_id: parseInt(insertMatch[1]),
            task_name: insertMatch[2],
            duration_hours: parseFloat(insertMatch[3]),
            delay_hours: parseFloat(insertMatch[4]),
            service_node: insertMatch[5]
          };

          // Check duplicate key
          if (state.mysqlDatabase.some(r => r.task_id === newRow.task_id)) {
            throw new Error(`Unique constraint breach: Primary Key duplicate for ID ${newRow.task_id}`);
          }

          state.mysqlDatabase.push(newRow);
          resultRows = [newRow];
          
          appendLog("pandas-console-log", `>>> INSERT INTO workflow_metrics VALUE (${newRow.task_id}, ...)`, "success-line");
          renderChart(state.mysqlDatabase); // Repaint chart instantly
        } else {
          throw new Error("SQL Parse error: INSERT syntax invalid. Use format: INSERT INTO workflow_metrics VALUES (6, 'Task Name', 2.5, 0.4, 'Gateway')");
        }
      } 
      // General fallbacks
      else {
        throw new Error("Query rejected: Client execution sandbox only supports queries against table 'workflow_metrics' (SELECT, WHERE, ORDER BY, INSERT).");
      }

      // Display query outputs
      el.sqlResultsMeta.textContent = `Query executed: "${queryStr}" - Returned ${resultRows.length} rows.`;
      el.sqlResultsMeta.style.color = "";
      
      // Render SQL table rows
      const tbody = el.sqlResultTable.querySelector('tbody');
      tbody.innerHTML = '';

      if (resultRows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-slate-500">Query returned empty record set.</td></tr>`;
        return;
      }

      resultRows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.task_id}</td>
          <td>${r.task_name}</td>
          <td>${r.duration_hours.toFixed(2)}h</td>
          <td class="${r.delay_hours > 1.5 ? 'text-rose' : ''}">${r.delay_hours.toFixed(2)}h</td>
        `;
        tbody.appendChild(tr);
      });

    } catch (sqlErr) {
      el.sqlResultsMeta.textContent = `[SQL Error] ${sqlErr.message}`;
      el.sqlResultsMeta.style.color = "var(--accent-rose)";
      appendLog("pandas-console-log", `>>> [sql error] ${sqlErr.message}`, "error-line");
    }
  }

  // ==========================================================================
  // 11. OPENAPI SWAGGER REST GATEWAY (LIVE SYNC DATA BINDINGS)
  // ==========================================================================
  el.btnTryApis.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const apiKey = btn.getAttribute('data-api');
      triggerRESTSandbox(apiKey);
    });
  });

  function triggerRESTSandbox(apiKey) {
    el.apiResponseStatus.textContent = "200 OK";
    el.apiResponseStatus.style.color = "var(--accent-emerald)";
    
    let payload = {};
    const timestamp = Math.floor(Date.now() / 1000);

    if (apiKey === "focus") {
      // Pulls active telemetry stats live
      payload = {
        status: "success",
        timestamp: timestamp,
        telemetry: {
          gaze_lock_state: state.gazeState,
          restlessness_index: state.restlessness.toFixed(2) + "%",
          attention_score: state.focusScore + "/100",
          cumulative_blink_count: state.blinkCount,
          distraction_triggers: state.distractionCount
        },
        device: {
          webcam_active: state.cameraActive,
          protocol: window.location.protocol,
          secure_context: window.isSecureContext || false
        }
      };
    } else if (apiKey === "bottlenecks") {
      // Live parses the relational DB array
      const bottlenecks = state.mysqlDatabase.filter(r => r.delay_hours > 1.5);
      payload = {
        status: "success",
        records_scanned: state.mysqlDatabase.length,
        bottlenecks_detected: bottlenecks.length,
        anomalies: bottlenecks.map(r => ({
          task_id: r.task_id,
          task: r.task_name,
          duration: r.duration_hours.toFixed(2) + "h",
          operational_delay: r.delay_hours.toFixed(2) + "h",
          service_impacted: r.service_node
        })),
        pandas_rules: [
          "IF operational_delay > 1.5 THEN trigger_alert",
          "IF duration_hours > 6.0 THEN request_requeue"
        ]
      };
    } else if (apiKey === "tasks") {
      el.apiResponseStatus.textContent = "201 CREATED";
      // Live syncs from Task checklist
      payload = {
        status: "created",
        records_inserted: state.tasks.length,
        backlog_details: state.tasks.map(t => ({
          task_id: t.id,
          target_description: t.text,
          state: t.done ? "COMPLETED" : "ACTIVE",
          classification: t.category
        }))
      };
    }

    el.apiJsonViewer.textContent = JSON.stringify(payload, null, 2);
  }

  // ==========================================================================
  // 12. OPERATIONAL DYNAMIC CHART CANVAS (CHART.JS BINDINGS)
  // ==========================================================================
  function renderChart(dataRows) {
    const canvas = document.getElementById('insights-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (state.activeChart) {
      state.activeChart.destroy();
    }

    const labels = dataRows.map(r => r.task_name.length > 15 ? r.task_name.slice(0, 13) + '...' : r.task_name);
    const durations = dataRows.map(r => parseFloat(r.duration_hours) || 0);
    const delays = dataRows.map(r => parseFloat(r.delay_hours) || 0);

    const activeTheme = themeColors[activeThemeKey];

    state.activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Task Completion (Hours)',
            data: durations,
            backgroundColor: activeTheme.chartBg1,
            borderColor: activeTheme.primary,
            borderWidth: 1.5,
            borderRadius: 4
          },
          {
            label: 'Operational Delay (Hours)',
            data: delays,
            backgroundColor: 'rgba(244, 63, 94, 0.4)',
            borderColor: '#f43f5e',
            borderWidth: 1.5,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: 'Outfit', size: 9 }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 8.5 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.02)' },
            ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 8.5 } }
          }
        }
      }
    });
  }

  // ==========================================================================
  // 13. DYNAMIC COLOR ACCENT SWITCHER CORE
  // ==========================================================================
  el.themePicker.querySelectorAll('.theme-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const themeKey = pill.getAttribute('data-accent');
      if (!themeColors[themeKey]) return;

      // Update pill states
      el.themePicker.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      activeThemeKey = themeKey;
      const palette = themeColors[themeKey];

      // Update root variables
      document.documentElement.style.setProperty('--accent-primary', palette.primary);
      document.documentElement.style.setProperty('--accent-primary-subtle', palette.subtle);
      document.documentElement.style.setProperty('--accent-primary-glow', palette.glow);

      // Repaint Chart with new colors
      if (state.activeChart) {
        state.activeChart.data.datasets[0].backgroundColor = palette.chartBg1;
        state.activeChart.data.datasets[0].borderColor = palette.primary;
        state.activeChart.update();
      }

      // Sync Mascot Core glows
      el.mascotCore.setAttribute('stroke', palette.primary);

      // Synchronize ambient sound theme background
      if (state.isPlayingSound) {
        el.btnAmbientSound.style.background = palette.primary;
      }

      appendLog("pandas-console-log", `[theme] Synchronized UI palette accent to: ${themeKey.toUpperCase()}`);
    });
  });

  // ==========================================================================
  // 14. TASK BACKLOG HANDLERS (CSS CONFETTI SPARKS TRIGGERS)
  // ==========================================================================
  function updateTaskStats() {
    const total = state.tasks.length;
    const done = state.tasks.filter(t => t.done).length;
    el.taskFraction.textContent = `${done}/${total} DONE`;
  }

  function renderTasks() {
    el.taskList.innerHTML = '';
    state.tasks.forEach(t => {
      const li = document.createElement('li');
      li.className = 'task-item';
      
      li.innerHTML = `
        <label class="custom-checkbox-label">
          <input type="checkbox" class="task-checkbox" ${t.done ? 'checked' : ''} />
          <span class="checkbox-box"></span>
          <span class="task-text">${t.text}</span>
        </label>
        <span class="task-category-tag ${t.category.toLowerCase().slice(0,2)}">${t.category}</span>
      `;

      const chk = li.querySelector('.task-checkbox');
      chk.addEventListener('change', (e) => {
        t.done = chk.checked;
        updateTaskStats();
        updateMascotExpression();

        if (chk.checked) {
          triggerConfettiParticles(e.target);
          
          // Mascot voice reaction
          const successPhrases = [
            '"Task backlog updated. Relational index cleared!"',
            '"Milestone resolution synchronized. Excellent workflow tempo."',
            '"Database query pool metric updated. Keep maintaining focus."'
          ];
          el.mascotSpeech.textContent = successPhrases[Math.floor(Math.random() * successPhrases.length)];
          el.mascotCore.setAttribute('stroke', 'var(--accent-emerald)');
          setTimeout(() => {
            el.mascotCore.setAttribute('stroke', 'var(--accent-primary)');
          }, 700);
        }
      });

      el.taskList.appendChild(li);
    });
    updateTaskStats();
  }

  // Pure self-contained CSS DOM confetti particle burst
  function triggerConfettiParticles(checkboxElement) {
    const rect = checkboxElement.getBoundingClientRect();
    const originX = rect.left + rect.width / 2 + window.scrollX;
    const originY = rect.top + rect.height / 2 + window.scrollY;

    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];

    for (let i = 0; i < 18; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      
      // Random coordinates inside circular sweep
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 45;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;

      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      particle.style.left = `${originX}px`;
      particle.style.top = `${originY}px`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      document.body.appendChild(particle);

      // Clean memory after finish
      setTimeout(() => {
        particle.remove();
      }, 600);
    }
  }

  function handleAddTask() {
    const text = el.taskInput.value.trim();
    if (!text) return;
    
    const categories = ["DATABASE", "BACKEND", "ANALYTICS"];
    const randCat = categories[Math.floor(Math.random() * categories.length)];
    
    state.tasks.push({
      id: Date.now(),
      text: text,
      done: false,
      category: randCat
    });

    el.taskInput.value = '';
    renderTasks();
  }

  // ==========================================================================
  // 15. AI COACH INTUITIVE ADVISER (NO AUDIO SYNTHESIS)
  // ==========================================================================
  function handleCoachMessage() {
    const text = el.coachInput.value.trim();
    if (!text) return;

    appendChatMessage(text, 'user');
    el.coachInput.value = '';

    setTimeout(() => {
      let reply = "System diagnostics active. Query details regarding database schemas, REST payloads, or attention metrics.";
      const lower = text.toLowerCase();

      if (lower.includes('bottleneck') || lower.includes('pandas') || lower.includes('delay')) {
        reply = "Pandas analyzer locates operational gaps inside log streams. Current logs indicate service pipeline bottlenecks inside 'Java Job Synchronization' (delay 4.9 hours). Recommend indexing the MySQL workflow keys.";
      } else if (lower.includes('db') || lower.includes('mysql') || lower.includes('schema')) {
        reply = "MySQL architecture records tasks and duration metrics. The relational model links unique workflow IDs to gateway logs. Review the schema CREATE definitions inside the 'MySQL Disk' tab.";
      } else if (lower.includes('rest') || lower.includes('swagger') || lower.includes('api')) {
        reply = "REST gateway exposes active endpoints for logging telemetry metrics. Open the 'REST Swagger' tab to execute mock calls and inspect specific JSON payloads.";
      } else if (lower.includes('attention') || lower.includes('camera') || lower.includes('gaze')) {
        reply = "Ocular tracking gauges focus by comparing pixel matrix variance across consecutive frames. Stable posture keeps the attention index at peak values.";
      } else if (lower.includes('timer') || lower.includes('pomodoro')) {
        reply = "Countdown tracks 25-minute focus periods. Completed timers write directly to the database backend tables.";
      }

      appendChatMessage(reply, 'coach');
    }, 450);
  }

  function appendChatMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar-sm';
    avatar.textContent = sender === 'user' ? 'USR' : 'SYS';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = `<p>${text}</p><div class="message-timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
    
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    el.coachMessages.appendChild(msg);
    el.coachMessages.scrollTop = el.coachMessages.scrollHeight;
  }

  // ==========================================================================
  // 16. EVENT REGISTRATIONS & INITIALIZATIONS
  // ==========================================================================
  el.btnToggleCam.addEventListener('click', () => {
    if (state.cameraActive) stopCamera();
    else startCamera();
  });
  el.btnCamInlineStart.addEventListener('click', startCamera);
  el.btnAmbientSound.addEventListener('click', toggleAmbientSound);

  el.btnTimerStart.addEventListener('click', () => {
    if (state.timerRunning) pauseTimer();
    else startTimer();
  });
  el.btnTimerReset.addEventListener('click', resetTimer);
  el.btnTimerBreak.addEventListener('click', () => {
    state.timerSeconds = 300;
    state.timerMode = 'BREAK';
    el.timerModeLabel.textContent = "REST BREAK";
    resetTimer();
  });

  el.btnAddTask.addEventListener('click', handleAddTask);
  el.taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddTask();
  });

  el.btnCoachSend.addEventListener('click', handleCoachMessage);
  el.coachInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCoachMessage();
  });

  // Bootstrap Inits
  updateTimerUI();
  renderTasks();
  executeCustomSQL("SELECT * FROM workflow_metrics;");
  resetMascotFace();

  // Load active chart
  renderChart(state.mysqlDatabase);
});
