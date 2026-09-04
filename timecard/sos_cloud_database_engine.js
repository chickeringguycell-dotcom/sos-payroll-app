// ============================================================================
// SPOTLESS SOLUTIONS UNIVERSAL REAL-TIME CLOUD DATABASE ENGINE (Build v101)
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
    syncDebounceMs: 400
  };

  let sseSource = null;
  let isHydrating = false;
  let pendingSyncTimer = null;
  let lastSyncTimestamp = 0;

  // 1. GET COMPLETE LOCAL BUSINESS STATE SNAPSHOT
  function getFullLocalSnapshot() {
    const payrollRaw = localStorage.getItem('spotless_executive_payroll_v1');
    const punchesRaw = localStorage.getItem('spotless_cleaner_punches_v2');
    const adjustmentsRaw = localStorage.getItem('spotless_timecard_adjustments_v1');
    
    // Collect all employee photos
    const photos = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('sos_avatar_') || k.startsWith('photo_'))) {
        photos[k] = localStorage.getItem(k);
      }
    }

    return {
      payroll: payrollRaw ? JSON.parse(payrollRaw) : null,
      punches: punchesRaw ? JSON.parse(punchesRaw) : null,
      adjustments: adjustmentsRaw ? JSON.parse(adjustmentsRaw) : [],
      photos: photos,
      deviceInfo: {
        platform: navigator.userAgent.includes('iPhone') ? 'Jacquise iPhone' : 'Guy Android/PC',
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

  // 3. HYDRATE LOCAL STATE FROM CLOUD DATABASE (READ)
  function applyCloudSnapshot(snapshot, sourceTimestamp) {
    if (!snapshot) return;
    if (sourceTimestamp && sourceTimestamp <= lastSyncTimestamp) return;

    isHydrating = true;
    console.log('🔄 [Cloud Database] Applying live snapshot from cloud...');

    try {
      // A. Hydrate Payroll State (Roster, Expenses, Worksites, Tax Vault, Reserves)
      if (snapshot.payroll) {
        localStorage.setItem('spotless_executive_payroll_v1', JSON.stringify(snapshot.payroll));
        if (window.AppData) {
          window.AppData = snapshot.payroll;
        }
        if (window.refreshUI) window.refreshUI();
        if (window.render) window.render();
      }

      // B. Hydrate Timecard Punches & Shifts
      if (snapshot.punches) {
        localStorage.setItem('spotless_cleaner_punches_v2', JSON.stringify(snapshot.punches));
        if (window.punchState) {
          window.punchState = snapshot.punches;
        }
        if (window.renderView) window.renderView();
      }

      // C. Hydrate Adjustments & Alerts
      if (snapshot.adjustments && Array.isArray(snapshot.adjustments)) {
        localStorage.setItem('spotless_timecard_adjustments_v1', JSON.stringify(snapshot.adjustments));
        if (window.updateBellAlerts) window.updateBellAlerts();
      }

      // D. Hydrate Employee Profile Photos
      if (snapshot.photos && typeof snapshot.photos === 'object') {
        for (const [k, v] of Object.entries(snapshot.photos)) {
          if (v) localStorage.setItem(k, v);
        }
        if (window.renderDirectAvatarCanvas) window.renderDirectAvatarCanvas();
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

  // Re-poll on window focus
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
