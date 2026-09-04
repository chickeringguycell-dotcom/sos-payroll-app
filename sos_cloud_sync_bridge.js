// ============================================================================
// SPOTLESS SOLUTIONS REAL-TIME CLOUD DATA & PHOTO SYNC BRIDGE (Build v100)
// Guarantees instant synchronization between Guy (Android/PC) & Jacquise (iPhone)
// ============================================================================

(function(window) {
  'use strict';

  const SYNC_TOPIC = 'sos_spotless_state_sync_v1';
  const ALERTS_TOPIC = 'sos_spotless_alerts_bus_v1';
  const SYNC_POST_URL = 'https://ntfy.sh/' + SYNC_TOPIC;
  const ALERTS_POST_URL = 'https://ntfy.sh/' + ALERTS_TOPIC;
  const SYNC_SSE_URL = 'https://ntfy.sh/' + SYNC_TOPIC + '/sse';
  const ALERTS_SSE_URL = 'https://ntfy.sh/' + ALERTS_TOPIC + '/sse';

  let sseEventSource = null;

  // 1. BROADCAST STATE CHANGE TO ALL DEVICES
  async function broadcastCloudEvent(eventType, payload) {
    try {
      const msgBody = {
        type: eventType,
        sourceDevice: navigator.userAgent.includes('iPhone') ? 'Jacquise iPhone' : 'Guy Device',
        payload: payload,
        timestamp: Date.now()
      };

      fetch(SYNC_POST_URL, {
        method: 'POST',
        headers: {
          'Title': 'STATE_SYNC: ' + eventType,
          'Priority': 'low'
        },
        body: JSON.stringify(msgBody)
      }).catch(() => {});
    } catch(e) {}
  }

  // 2. BROADCAST EMPLOYEE PHOTO TO ALL DEVICES
  function syncEmployeePhotoToCloud(employeeName, base64Photo) {
    if (!employeeName || !base64Photo) return;
    console.log('[Cloud Sync] Pushing updated photo for ' + employeeName + ' to all devices...');
    broadcastCloudEvent('PHOTO_UPDATE', {
      name: employeeName,
      photo: base64Photo
    });
  }

  // 3. BROADCAST ROSTER / PAYROLL UPDATE TO ALL DEVICES
  function syncPayrollStateToCloud(appData) {
    if (!appData) return;
    broadcastCloudEvent('PAYROLL_STATE_UPDATE', appData);
  }

  // 4. BROADCAST TIMECARD PUNCH UPDATE TO ALL DEVICES
  function syncTimecardPunchToCloud(punchData) {
    if (!punchData) return;
    broadcastCloudEvent('TIMECARD_PUNCH_UPDATE', punchData);
  }

  // 5. INITIALIZE LIVE SSE LISTENER (PULLS INSTANT CHANGES IN <1 SEC)
  function initCloudSyncStream() {
    if (typeof EventSource === 'undefined') return;

    try {
      if (sseEventSource) sseEventSource.close();
      sseEventSource = new EventSource(SYNC_SSE_URL);

      sseEventSource.onmessage = function(event) {
        try {
          if (!event.data) return;
          const msg = JSON.parse(event.data);
          let syncData = null;

          if (msg.message) {
            try { syncData = JSON.parse(msg.message); } catch(e) {}
          } else if (msg.payload) {
            syncData = msg;
          }

          if (!syncData || !syncData.type) return;

          console.log('⚡ [Cloud Sync] Inbound update received:', syncData.type);

          // A. INBOUND PHOTO UPDATE
          if (syncData.type === 'PHOTO_UPDATE' && syncData.payload) {
            const name = syncData.payload.name;
            const photo = syncData.payload.photo;
            if (name && photo) {
              localStorage.setItem('sos_avatar_' + name.toLowerCase(), photo);
              localStorage.setItem('photo_' + name.toLowerCase(), photo);
              
              // Trigger UI refresh if photo updater exists
              if (window.renderDirectAvatarCanvas) window.renderDirectAvatarCanvas();
              if (window.refreshUI) window.refreshUI();
              if (window.render) window.render();
            }
          }

          // B. INBOUND PAYROLL UPDATE
          if (syncData.type === 'PAYROLL_STATE_UPDATE' && syncData.payload) {
            if (window.location.pathname.includes('Payroll') || window.location.pathname.includes('index.html') || window.location.pathname === '/') {
              localStorage.setItem('spotless_executive_payroll_v1', JSON.stringify(syncData.payload));
              if (window.refreshUI) window.refreshUI();
            }
          }

          // C. INBOUND TIMECARD UPDATE
          if (syncData.type === 'TIMECARD_PUNCH_UPDATE' && syncData.payload) {
            localStorage.setItem('spotless_cleaner_punches_v2', JSON.stringify(syncData.payload));
            if (window.renderView) window.renderView();
            if (window.refreshUI) window.refreshUI();
          }

        } catch(err) {
          console.warn('[Cloud Sync SSE] Parse error:', err);
        }
      };

      sseEventSource.onerror = function() {
        if (sseEventSource) sseEventSource.close();
        setTimeout(initCloudSyncStream, 5000);
      };

    } catch(err) {
      console.warn('[Cloud Sync] Connection note:', err);
    }
  }

  // Auto-boot on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCloudSyncStream);
  } else {
    initCloudSyncStream();
  }

  // Export to Global
  window.SOS_CloudSyncBridge = {
    syncEmployeePhotoToCloud: syncEmployeePhotoToCloud,
    syncPayrollStateToCloud: syncPayrollStateToCloud,
    syncTimecardPunchToCloud: syncTimecardPunchToCloud,
    broadcastCloudEvent: broadcastCloudEvent,
    initCloudSyncStream: initCloudSyncStream
  };

})(window);
