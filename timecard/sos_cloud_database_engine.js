// ============================================================================
// SPOTLESS SOLUTIONS UNIVERSAL REAL-TIME CLOUD DATABASE ENGINE (Build v105)
// Authoritative Cloud Database & Live Synchronization for All Apps & Devices
// Guy (Android / PC), Jacquise (Apple iPhone), and all Field Cleaners
// ============================================================================

(function(window) {
  'use strict';

  const DB_CONFIG = {
    channel: 'sos_spotless_database_v1',
    endpoint: 'https://ntfy.sh/sos_spotless_database_v1',
    sseEndpoint: 'https://ntfy.sh/sos_spotless_database_v1/sse',
    pollEndpoint: 'https://ntfy.sh/sos_spotless_database_v1/json?poll=1',
    syncDebounceMs: 350
  };

  const STORAGE_KEYS = {
    PAYROLL: ['spotless_payroll_state_v1', 'spotless_executive_payroll_v1'],
    PUNCHES: ['sos_timecard_punches_v1', 'spotless_cleaner_punches_v2'],
    ADJUSTMENTS: ['sos_adjustments_v1', 'spotless_timecard_adjustments_v1'],
    AUTH: ['sos_timecard_session_v1', 'sos_timecard_active_emp']
  };

  let sseSource = null;
  let isHydrating = false;
  let pendingSyncTimer = null;
  let lastSyncTimestamp = 0;

  // 1. GET COMPLETE LOCAL BUSINESS STATE SNAPSHOT
  function getFullLocalSnapshot() {
    let payrollData = null;
    for (const k of STORAGE_KEYS.PAYROLL) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try { payrollData = JSON.parse(raw); break; } catch(e) {}
      }
    }

    let punchesData = null;
    for (const k of STORAGE_KEYS.PUNCHES) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try { punchesData = JSON.parse(raw); break; } catch(e) {}
      }
    }

    let adjustmentsData = [];
    for (const k of STORAGE_KEYS.ADJUSTMENTS) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try { adjustmentsData = JSON.parse(raw); break; } catch(e) {}
      }
    }

    // Collect all employee photos & raw crops
    const photos = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('sos_photo_') || k.startsWith('sos_raw_photo_') || k.startsWith('sos_avatar_') || k.startsWith('photo_'))) {
        photos[k] = localStorage.getItem(k);
      }
    }

    const activeEmp = localStorage.getItem('sos_timecard_active_emp') || '';
    const activeSession = localStorage.getItem('sos_timecard_session_v1') || '';

    return {
      payroll: payrollData,
      punches: punchesData,
      adjustments: adjustmentsData,
      photos: photos,
      activeEmp: activeEmp,
      activeSession: activeSession,
      deviceInfo: {
        platform: /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'Jacquise iPhone' : 'Guy Android/PC',
        timestamp: Date.now()
      }
    };
  }

  // 2. DISPATCH STATE TO CLOUD DATABASE (WRITE)
  function pushStateToCloudDatabase(reason = 'USER_CHANGE') {
    if (isHydrating) return;

    if (pendingSyncTimer) clearTimeout(pendingSyncTimer);
    pendingSyncTimer = setTimeout(() => {
      try {
        const snapshot = getFullLocalSnapshot();
        const payload = {
          type: 'DATABASE_MUTATION',
          reason: reason,
          timestamp: Date.now(),
          snapshot: snapshot
        };

        lastSyncTimestamp = payload.timestamp;

        fetch(DB_CONFIG.endpoint, {
          method: 'POST',
          headers: {
            'Title': 'DB_SYNC: ' + reason,
            'Priority': 'low',
            'Tags': 'database,sync'
          },
          body: JSON.stringify(payload)
        }).then(() => {
          console.log('☁️ [Cloud Database] Mutation successfully committed to cloud:', reason);
        }).catch((err) => {
          console.warn('[Cloud Database] Commit failed:', err);
        });

      } catch(err) {
        console.warn('[Cloud Database] Push error:', err);
      }
    }, DB_CONFIG.syncDebounceMs);
  }

  // Helper to merge punch histories without losing any records
  function mergePunchHistories(localHist = [], remoteHist = []) {
    const map = new Map();
    (localHist || []).forEach(p => {
      if (p) {
        const key = p.id || `${p.employee || p.employeeName}_${p.timestamp || p.clockInTime}_${p.date}`;
        map.set(key, p);
      }
    });
    (remoteHist || []).forEach(p => {
      if (p) {
        const key = p.id || `${p.employee || p.employeeName}_${p.timestamp || p.clockInTime}_${p.date}`;
        map.set(key, p);
      }
    });
    return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // Helper to merge adjustments without losing any records
  function mergeAdjustments(localAdj = [], remoteAdj = []) {
    const map = new Map();
    (localAdj || []).forEach(a => {
      if (a) {
        const key = a.id || `${a.employeeName}_${a.date}_${a.hours}`;
        map.set(key, a);
      }
    });
    (remoteAdj || []).forEach(a => {
      if (a) {
        const key = a.id || `${a.employeeName}_${a.date}_${a.hours}`;
        map.set(key, a);
      }
    });
    return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // 3. HYDRATE LOCAL STATE FROM CLOUD DATABASE (READ)
  function applyCloudSnapshot(snapshot, sourceTimestamp) {
    if (!snapshot) return;
    if (sourceTimestamp && sourceTimestamp <= lastSyncTimestamp) return;

    isHydrating = true;
    console.log('🔄 [Cloud Database] Applying live snapshot from cloud...');

    try {
      // A. Hydrate Payroll State (Roster, Expenses, Worksites, Tax Vault, Reserves, Timecard Archive)
      if (snapshot.payroll) {
        STORAGE_KEYS.PAYROLL.forEach(k => {
          localStorage.setItem(k, JSON.stringify(snapshot.payroll));
        });
        if (window.AppData) {
          window.AppData = snapshot.payroll;
        }
        if (typeof window.refreshUI === 'function') window.refreshUI();
        if (typeof window.render === 'function') window.render();
        if (typeof window.renderTimecardsTable === 'function') window.renderTimecardsTable();
      }

      // B. Hydrate Timecard Punches & Permanent History (Merge to protect all records)
      if (snapshot.punches) {
        let currentLocalPunches = { activePunches: {}, history: [] };
        try {
          const rawP = localStorage.getItem('sos_timecard_punches_v1');
          if (rawP) currentLocalPunches = JSON.parse(rawP);
        } catch(e) {}

        const mergedHistory = mergePunchHistories(currentLocalPunches.history, snapshot.punches.history);
        const mergedActive = Object.assign({}, currentLocalPunches.activePunches || {}, snapshot.punches.activePunches || {});

        const combinedPunches = {
          activePunches: mergedActive,
          history: mergedHistory
        };

        STORAGE_KEYS.PUNCHES.forEach(k => {
          localStorage.setItem(k, JSON.stringify(combinedPunches));
        });

        if (window.punchState) {
          window.punchState = combinedPunches;
        }
        if (typeof window.renderView === 'function') window.renderView();
        if (typeof window.renderTimecardsTable === 'function') window.renderTimecardsTable();
      }

      // C. Hydrate Adjustments & Alerts (Merge to protect all requests)
      if (snapshot.adjustments && Array.isArray(snapshot.adjustments)) {
        let currentLocalAdj = [];
        try {
          const rawA = localStorage.getItem('sos_adjustments_v1');
          if (rawA) currentLocalAdj = JSON.parse(rawA);
        } catch(e) {}

        const combinedAdj = mergeAdjustments(currentLocalAdj, snapshot.adjustments);

        STORAGE_KEYS.ADJUSTMENTS.forEach(k => {
          localStorage.setItem(k, JSON.stringify(combinedAdj));
        });

        if (window.adjustments) {
          window.adjustments = combinedAdj;
        }
        if (typeof window.updateBellAlerts === 'function') window.updateBellAlerts();
        if (typeof window.renderView === 'function') window.renderView();
      }

      // D. Hydrate Employee Profile Photos
      if (snapshot.photos && typeof snapshot.photos === 'object') {
        for (const [k, v] of Object.entries(snapshot.photos)) {
          if (v) localStorage.setItem(k, v);
        }
        if (typeof window.renderDirectAvatarCanvas === 'function') window.renderDirectAvatarCanvas();
        if (typeof window.loadInPlaceAvatar === 'function' && typeof window.getActiveName === 'function') {
          window.loadInPlaceAvatar(window.getActiveName());
        }
      }

      if (sourceTimestamp) lastSyncTimestamp = sourceTimestamp;

    } catch(err) {
      console.warn('[Cloud Database] Hydration error:', err);
    } finally {
      setTimeout(() => { isHydrating = false; }, 300);
    }
  }

  // 4. BOOT INITIAL CLOUD DATABASE SNAPSHOT (ON APP OPEN)
  async function bootInitialCloudDatabase() {
    try {
      const resp = await fetch(DB_CONFIG.pollEndpoint, { cache: 'no-store' });
      if (resp.ok) {
        const text = await resp.text();
        const lines = text.trim().split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const entry = JSON.parse(lines[i]);
            let data = null;
            if (entry.message) {
              data = JSON.parse(entry.message);
            } else if (entry.snapshot) {
              data = entry;
            }
            if (data && data.snapshot) {
              applyCloudSnapshot(data.snapshot, data.timestamp);
              break;
            }
          } catch(e) {}
        }
      }
    } catch(e) {
      console.warn('[Cloud Database] Initial poll note:', e);
    }
  }

  // 5. LIVE REAL-TIME SSE STREAM LISTENER (<1 SEC LATENCY)
  function initLiveDatabaseStream() {
    if (typeof EventSource === 'undefined') return;

    try {
      if (sseSource) sseSource.close();
      sseSource = new EventSource(DB_CONFIG.sseEndpoint);

      sseSource.onmessage = function(event) {
        try {
          if (!event.data) return;
          const raw = JSON.parse(event.data);
          let data = null;

          if (raw.message) {
            try { data = JSON.parse(raw.message); } catch(e) {}
          } else if (raw.snapshot) {
            data = raw;
          }

          if (data && data.snapshot) {
            applyCloudSnapshot(data.snapshot, data.timestamp);
          }
        } catch(err) {}
      };

      sseSource.onerror = function() {
        if (sseSource) sseSource.close();
        setTimeout(initLiveDatabaseStream, 4000);
      };

    } catch(e) {}
  }

  // 6. AUTO-START ON BOOT
  bootInitialCloudDatabase();
  initLiveDatabaseStream();

  // Re-poll on window focus & online
  window.addEventListener('focus', bootInitialCloudDatabase);
  window.addEventListener('online', () => {
    bootInitialCloudDatabase();
    initLiveDatabaseStream();
  });

  // Export to window
  window.SOS_CloudDatabase = {
    pushStateToCloudDatabase: pushStateToCloudDatabase,
    bootInitialCloudDatabase: bootInitialCloudDatabase,
    initLiveDatabaseStream: initLiveDatabaseStream,
    applyCloudSnapshot: applyCloudSnapshot
  };

})(window);
