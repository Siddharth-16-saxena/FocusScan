/* ==========================================================================
   FOCUSSCAN - MINIMAL SYSTEM CONTROLLER (JAVASCRIPT ENGINE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. STATE CONFIGURATION
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

    // Task Checklist
    tasks: [
      { id: 1, text: "Formulate structured MySQL model definitions", done: false, category: "DATABASE" },
      { id: 2, text: "Establish Node.js backend task bottleneck listeners", done: false, category: "BACKEND" },
      { id: 3, text: "Integrate Python Pandas metrics analyzer script", done: false, category: "ANALYTICS" }
    ],

    // Ingested CSV log rows
    ingestedLogs: null,
    activeChart: null,

    // MySQL Database Simulator Rows
    mysqlDatabase: [
      { task_id: 1, task_name: "Data Migration Pipeline", duration_hours: 4.2, delay_hours: 1.8, service_node: "NodeJS-Gateway" },
      { task_id: 2, task_name: "MySQL Index Optimization", duration_hours: 2.5, delay_hours: 0.4, service_node: "NodeJS-Gateway" },
      { task_id: 3, task_name: "Pandas Trend Synthesis", duration_hours: 5.1, delay_hours: 3.2, service_node: "Python-Analytics" },
      { task_id: 4, task_name: "REST Schema Syncing", duration_hours: 1.1, delay_hours: 0.1, service_node: "NodeJS-Gateway" },
      { task_id: 5, task_name: "Java Job Synchronization", duration_hours: 8.4, delay_hours: 4.9, service_node: "Java-Scheduler" }
    ]
  };

  // ==========================================================================
  // 2. DOM CACHE SELECTORS
  // ==========================================================================
  const el = {
    // Header
    btnToggleCam: document.getElementById('btn-toggle-camera'),
    btnAmbientSound: document.getElementById('btn-ambient-sound'),
    systemStateVal: document.getElementById('system-state-val'),
    currentFlowVal: document.getElementById('current-flow-val'),

    // Camera HUD
    cameraPlaceholder: document.getElementById('camera-placeholder'),
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

    // Mascot (Wireframe SVG)
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
      
      // Toggle button active classes
      el.tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle tab active content panels
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
  // 4. WEBCAM TELEMETRY & ATTENTION SCAFFOLDING (MOTION SCANNER)
  // ==========================================================================
  let lastFrameData = null;

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      appendLog("pandas-console-log", "[error] Ocular API deactivated by browser (Secure Context Required). Please deploy to Vercel (HTTPS) or run a local server (http://localhost) to enable.", "error-line");
      el.cameraStatusBadge.textContent = 'SECURE REQ';
      el.cameraStatusBadge.className = 'badge text-rose';
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
      el.attentionHud.style.display = 'block';
      el.cameraStatusBadge.textContent = 'MONITORING';
      el.cameraStatusBadge.className = 'badge text-blue';
      state.cameraActive = true;
      el.btnToggleCam.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="margin-right-sm">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
        STOP TELEMETRY
      `;

      // Start delta frame analysis
      const ctx = el.cameraCanvas.getContext('2d');
      state.cameraInterval = setInterval(() => {
        analyzeCameraFrame(ctx);
      }, 250); // Scan 4 times per second
      
      appendLog("pandas-console-log", "[info] Webcam attention monitor stream active. calibrating ocular vectors.");
    } catch (err) {
      console.warn("Camera failed: ", err);
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
    el.attentionHud.style.display = 'none';
    el.cameraStatusBadge.textContent = 'STANDBY';
    el.cameraStatusBadge.className = 'badge';
    state.cameraActive = false;
    
    if (state.cameraInterval) {
      clearInterval(state.cameraInterval);
      state.cameraInterval = null;
    }
    el.btnToggleCam.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="margin-right-sm">
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
      let currentMovement = Math.min(100, normalizedDiff * 9); 
      state.restlessness = (state.restlessness * 0.7) + (currentMovement * 0.3); // smooth dampening
      
      if (state.restlessness > 10) {
        state.gazeState = 'DRIFT';
        if (Math.random() < 0.12) {
          state.distractionCount++;
          triggerDistractionAlert();
        }
      } else {
        state.gazeState = 'LOCK';
        if (Math.random() < 0.05) {
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
    if (state.restlessness > 10) {
      focusStatus = 'LOW';
      el.hudAttentionVal.style.color = '#e11d48';
    } else if (state.restlessness > 5) {
      focusStatus = 'STABLE';
      el.hudAttentionVal.style.color = '#94a3b8';
    } else {
      focusStatus = 'LOCK';
      el.hudAttentionVal.style.color = '#2563eb';
    }
    el.hudAttentionVal.textContent = focusStatus;

    // Flow Score calculation
    let calculatedFlow = Math.max(10, 100 - (state.restlessness * 3.5) - (state.distractionCount * 4));
    state.focusScore = Math.round(calculatedFlow);
    el.currentFlowVal.textContent = state.focusScore + '%';
    el.camEngagementStat.textContent = Math.round(state.focusScore) + '%';
    el.camBlinkStat.textContent = state.blinkCount;
    el.camDistractionStat.textContent = state.distractionCount;

    if (state.focusScore > 80) {
      el.systemStateVal.textContent = "FLOW FLOW";
      el.systemStateVal.style.color = "var(--accent-emerald)";
    } else if (state.focusScore > 50) {
      el.systemStateVal.textContent = "STABLE";
      el.systemStateVal.style.color = "var(--accent-blue)";
    } else {
      el.systemStateVal.textContent = "ATTN_DRIFT";
      el.systemStateVal.style.color = "var(--accent-rose)";
    }
  }

  function triggerDistractionAlert() {
    appendLog("pandas-console-log", `[warning] Gaze alignment variance detected: low attention vectors recorded.`, "error-line");
  }

  // ==========================================================================
  // 5. GEOMETRIC WIREFRAME COMPANION EXPRESSIONS
  // ==========================================================================
  function resetMascotFace() {
    el.pupilLeft.setAttribute('cx', '88');
    el.pupilRight.setAttribute('cx', '112');
    el.flowyMouth.setAttribute('d', 'M92 110 L108 110');
    el.mascotCore.setAttribute('stroke', '#2563eb');
    el.mascotMoodText.textContent = "STATE: DYNAMIC_CALIBRATION";
    el.mascotSpeech.textContent = '"Awaiting metrics execution or camera stream calibration."';
  }

  function updateMascotExpression() {
    if (state.gazeState === 'DRIFT') {
      // Pupils shift outward (drift look)
      el.pupilLeft.setAttribute('cx', '85');
      el.pupilRight.setAttribute('cx', '115');
      // Mouth curves flat-down
      el.flowyMouth.setAttribute('d', 'M93 113 Q100 110 107 113');
      el.mascotCore.setAttribute('stroke', 'var(--accent-rose)');
      el.mascotMoodText.textContent = "STATE: FOCUS_DRIFT";
      
      const speeches = [
        '"Gaze alignment tracking deviation recorded."',
        '"Restlessness index threshold exceeded."',
        '"Workflow focus resilience dropping. Center screen alignment suggested."'
      ];
      if (Math.random() < 0.05) {
        el.mascotSpeech.textContent = speeches[Math.floor(Math.random() * speeches.length)];
      }
    } else {
      // Pupils centered
      el.pupilLeft.setAttribute('cx', '88');
      el.pupilRight.setAttribute('cx', '112');
      el.mascotCore.setAttribute('stroke', '#2563eb');
      
      if (state.focusScore > 85) {
        // High Flow Smile
        el.flowyMouth.setAttribute('d', 'M92 108 Q100 118 108 108');
        el.mascotMoodText.textContent = "STATE: FLOW_ZONE";
        if (Math.random() < 0.03) {
          el.mascotSpeech.textContent = '"Metrics show stable focus bounds. Continuous flow locked."';
        }
      } else {
        // Flat Line Focused
        el.flowyMouth.setAttribute('d', 'M92 110 L108 110');
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

  // ==========================================================================
  // 6. POMODORO BLOCK TIMER & PROCEDURAL SYNTH SOUNDS
  // ==========================================================================
  function updateTimerUI() {
    const mins = Math.floor(state.timerSeconds / 60);
    const secs = state.timerSeconds % 60;
    el.timerDigits.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const maxSeconds = state.timerMode === 'FOCUS' ? 1500 : 300;
    const percentage = state.timerSeconds / maxSeconds;
    const offset = 477 - (percentage * 477);
    el.timerProgressBar.style.strokeDashoffset = offset;
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
        // Complete block
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.timerRunning = false;
        
        if (state.timerMode === 'FOCUS') {
          appendLog("pandas-console-log", "[success] Completed 25m Focus Block. MySQL workflow_metrics state updated.", "success-line");
          state.timerSeconds = 300; // Break
          state.timerMode = 'BREAK';
          el.timerModeLabel.textContent = "REST BREAK";
        } else {
          state.timerSeconds = 1500; // Focus
          state.timerMode = 'FOCUS';
          el.timerModeLabel.textContent = "FOCUS BLOCK";
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

  // Procedural Noise Synthesizer (Pure Web Audio - Pink/Brown Noise Focus filter)
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
          output[i] *= 0.08; // extremely low volume
          b6 = white * 0.115926;
        }

        const whiteNoiseSource = ctx.createBufferSource();
        whiteNoiseSource.buffer = noiseBuffer;
        whiteNoiseSource.loop = true;

        const lowpassFilter = ctx.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.setValueAtTime(320, ctx.currentTime); // Soft low ocean wash

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);

        whiteNoiseSource.connect(lowpassFilter);
        lowpassFilter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoiseSource.start(0);
        state.soundscapeNode = whiteNoiseSource;
        state.isPlayingSound = true;
        
        el.btnAmbientSound.style.color = "var(--text-white)";
        el.btnAmbientSound.style.background = "var(--accent-blue)";
      } catch (e) {
        console.warn(e);
      }
    }
  }

  // ==========================================================================
  // 7. PANDAS INGESTION CORE & CSV EXPORT
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

  // Drag-and-drop actions
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
      
      // Update our simulated database contents with uploaded rows
      state.mysqlDatabase = rows.map(r => ({
        task_id: parseInt(r.task_id) || Math.floor(Math.random()*100),
        task_name: r.task_name,
        duration_hours: parseFloat(r.duration_hours) || 0,
        delay_hours: parseFloat(r.delay_hours) || 0,
        service_node: r.service_node || 'Gateway'
      }));

      // Renders
      renderChart(rows);
      executeMockSQL("all");

      // output summary
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
  // 8. INTERACTIVE MYSQL SIMULATOR SQL EXECUTION
  // ==========================================================================
  el.btnExecuteSql.addEventListener('click', () => {
    const queryType = el.sqlQueryPreset.value;
    executeMockSQL(queryType);
  });

  function executeMockSQL(type) {
    let resultRows = [];
    let queryStr = "SELECT * FROM workflow_metrics;";
    
    if (type === "all") {
      resultRows = [...state.mysqlDatabase];
      queryStr = "SELECT * FROM workflow_metrics;";
    } else if (type === "bottlenecks") {
      resultRows = state.mysqlDatabase.filter(r => r.delay_hours > 1.5);
      queryStr = "SELECT * FROM workflow_metrics WHERE delay_hours > 1.5;";
    } else if (type === "heavy") {
      resultRows = [...state.mysqlDatabase].sort((a,b) => b.duration_hours - a.duration_hours);
      queryStr = "SELECT * FROM workflow_metrics ORDER BY duration_hours DESC;";
    }

    // Update query label
    el.sqlResultsMeta.textContent = `Query executed: "${queryStr}" - Returned ${resultRows.length} rows.`;

    // Render clean table rows
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
        <td>${r.duration_hours.toFixed(1)}h</td>
        <td class="${r.delay_hours > 1.5 ? 'text-rose' : ''}">${r.delay_hours.toFixed(1)}h</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================================================
  // 9. OPENAPI SWAGGER REST API SANDBOX
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
          stream_source: "navigator.mediaDevices.getUserMedia"
        }
      };
    } else if (apiKey === "bottlenecks") {
      const bottlenecks = state.mysqlDatabase.filter(r => r.delay_hours > 1.5);
      payload = {
        status: "success",
        records_scanned: state.mysqlDatabase.length,
        bottlenecks_detected: bottlenecks.length,
        anomalies: bottlenecks.map(r => ({
          task_id: r.task_id,
          task: r.task_name,
          duration: r.duration_hours + "h",
          operational_delay: r.delay_hours + "h",
          service_impacted: r.service_node
        })),
        pandas_analyzer_rules: [
          "IF operational_delay > 1.5 THEN flag_bottleneck",
          "IF duration_hours > 6.0 THEN trigger_queue_reindex"
        ]
      };
    } else if (apiKey === "tasks") {
      el.apiResponseStatus.textContent = "201 CREATED";
      payload = {
        status: "created",
        records_inserted: state.tasks.length,
        metrics_logged_to_mysql: true,
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
  // 10. CHART RENDERING MODULE (CHART.JS)
  // ==========================================================================
  function renderChart(dataRows) {
    const ctx = document.getElementById('insights-chart').getContext('2d');
    
    if (state.activeChart) {
      state.activeChart.destroy();
    }

    const labels = dataRows.map(r => r.task_name.length > 16 ? r.task_name.slice(0, 14) + '...' : r.task_name);
    const durations = dataRows.map(r => parseFloat(r.duration_hours) || 0);
    const delays = dataRows.map(r => parseFloat(r.delay_hours) || 0);

    state.activeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Task Completion (Hours)',
            data: durations,
            backgroundColor: 'rgba(37, 99, 235, 0.4)',
            borderColor: '#2563eb',
            borderWidth: 1.5,
            borderRadius: 4
          },
          {
            label: 'Operational Delay (Hours)',
            data: delays,
            backgroundColor: 'rgba(225, 29, 72, 0.4)',
            borderColor: '#e11d48',
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
  // 11. TEXT-ONLY SYSTEM ADVISOR CHAT
  // ==========================================================================
  function handleCoachMessage() {
    const text = el.coachInput.value.trim();
    if (!text) return;

    appendChatMessage(text, 'user');
    el.coachInput.value = '';

    // Advanced, developer-focused analytical replies (NO SPEECH TRIGGERS)
    setTimeout(() => {
      let reply = "System context loaded. Please query details regarding database schemas, REST payloads, or attention metrics.";
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
  // 12. TASK BACKLOG ACTIONS
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
      chk.addEventListener('change', () => {
        t.done = chk.checked;
        updateTaskStats();
        updateMascotExpression();
      });

      el.taskList.appendChild(li);
    });
    updateTaskStats();
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
  // 13. EVENTS WIRING
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

  // ==========================================================================
  // 14. BOOTSTRAP INITIALIZATION
  // ==========================================================================
  updateTimerUI();
  renderTasks();
  executeMockSQL("all");
  resetMascotFace();

  // Load placeholder chart data
  renderChart([
    { task_name: "Task Ingestion", duration_hours: 3.2, delay_hours: 0.8 },
    { task_name: "MySQL Commits", duration_hours: 2.1, delay_hours: 1.4 },
    { task_name: "Pandas Audit", duration_hours: 5.4, delay_hours: 4.1 }
  ]);
});
