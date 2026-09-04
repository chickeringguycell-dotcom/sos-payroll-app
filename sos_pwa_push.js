// ============================================================================
// SPOTLESS SOLUTIONS PWA, WEB PUSH & LIVE AUTO-UPDATE CLIENT ENGINE (sos_pwa_push.js)
// Cross-Platform: Windows PC, Android, and Apple iPhone (Home-Screen PWA)
// ============================================================================

(function(window) {
  'use strict';

  const PWA_CONFIG = {
    swPath: 'sw.js',
    registryKey: 'sos_device_registry_v1',
    deviceIdKey: 'sos_device_uuid_v1',
    vapidPublicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBKr3qBUYIHBQFLXYp5Nksh8U',
    updateCheckIntervalMs: 60000 // Automatically check every 60 seconds
  };

  // 1. PLATFORM & ENVIRONMENT DETECTION
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  const isWindows = /windows/i.test(ua);
  const isStandalone = (window.navigator.standalone === true) || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);

  function getPlatformIdentifier() {
    if (isIOS) {
      return isStandalone ? 'IOS_PWA' : 'IOS_SAFARI_BROWSER';
    }
    if (isAndroid) {
      return isStandalone ? 'ANDROID_PWA' : 'ANDROID_BROWSER';
    }
    return isStandalone ? 'WINDOWS_DESKTOP_PWA' : 'WINDOWS_PC_BROWSER';
  }

  function getDeviceDescription() {
    if (isIOS) return isStandalone ? 'Apple iPhone (Installed PWA)' : 'Apple iPhone (Safari)';
    if (isAndroid) return isStandalone ? 'Android Phone (Installed PWA)' : 'Android Phone';
    return 'Windows PC / Desktop Workstation';
  }

  // 2. DEVICE ID MANAGEMENT
  function getOrCreateDeviceId() {
    let devId = localStorage.getItem(PWA_CONFIG.deviceIdKey);
    if (!devId) {
      devId = 'dev_' + (isIOS ? 'ios_' : isAndroid ? 'and_' : 'win_') + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(PWA_CONFIG.deviceIdKey, devId);
    }
    return devId;
  }

  // 3. SERVICE WORKER REGISTRATION & LIVE AUTO-UPDATE ENGINE
  let swRegistration = null;
  let isRefreshing = false;

  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register(PWA_CONFIG.swPath, { scope: './' });
        swRegistration = reg;
        console.log('[PWA] Service Worker registered successfully for scope:', reg.scope);
        
        // Listen for new worker updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA Auto-Update] New software version downloaded. Activating immediately...');
                newWorker.postMessage({ action: 'skipWaiting' });
              }
            });
          }
        });

        // Check active push subscription
        syncDeviceRegistration();
        startAutoUpdateWatcher(reg);
        return reg;
      } catch (err) {
        console.warn('[PWA] Service Worker registration skipped or failed:', err);
      }
    }
    return null;
  }

  // Reload smoothly when new Service Worker takes control
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) return;
      isRefreshing = true;
      console.log('[PWA Auto-Update] Controller changed — applying latest update...');
      
      showAutoUpdateToast();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_VERSION_ACTIVATED') {
        console.log('[PWA Auto-Update] SW Version Activated:', event.data.version);
        showAutoUpdateToast('⚡ Latest software update applied.');
      }
    });
  }

  function startAutoUpdateWatcher(reg) {
    // 1. Periodic check every 60s
    setInterval(() => {
      checkForUpdates();
    }, PWA_CONFIG.updateCheckIntervalMs);

    // 2. Immediate check when window regains focus
    window.addEventListener('focus', () => {
      checkForUpdates();
    });

    // 3. Immediate check when document visibility changes to visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    });

    // 4. Immediate check when device comes online
    window.addEventListener('online', () => {
      console.log('[PWA Auto-Update] Network restored. Checking for software updates...');
      checkForUpdates();
    });
  }

  function checkForUpdates(forceBroadcast = false) {
    if (swRegistration) {
      swRegistration.update().catch((err) => {
        console.warn('[PWA Auto-Update] Background update check note:', err.message);
      });
    }

    if (forceBroadcast && window.sosBroadcastChannel) {
      window.sosBroadcastChannel.postMessage({
        type: 'SYSTEM_VERSION_UPDATE',
        timestamp: new Date().toISOString()
      });
    }
  }

  function showAutoUpdateToast(msg = '⚡ App Updated to Latest Version') {
    let toast = document.getElementById('sos-auto-update-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sos-auto-update-toast';
      toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #10B981 0%, #059669 100%); color:#000; font-weight:900; font-size:12px; padding:10px 20px; border-radius:9999px; z-index:9999999; box-shadow:0 10px 30px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.4); display:flex; align-items:center; gap:8px;';
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.style.display = 'flex';
    setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, 3500);
  }

  // 4. SERVER-SIDE DEVICE REGISTRY
  function getDeviceRegistry() {
    try {
      return JSON.parse(localStorage.getItem(PWA_CONFIG.registryKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveDeviceRegistry(registry) {
    localStorage.setItem(PWA_CONFIG.registryKey, JSON.stringify(registry));
    if (window.sosBroadcastChannel) {
      window.sosBroadcastChannel.postMessage({
        type: 'DEVICE_REGISTRY_UPDATED',
        registry: registry,
        timestamp: new Date().toISOString()
      });
    }
  }

  async function syncDeviceRegistration(customProps = {}) {
    const deviceId = getOrCreateDeviceId();
    const currentUser = (window.SOS_CloudSync && window.SOS_CloudSync.Auth) 
      ? window.SOS_CloudSync.Auth.getUser() 
      : { userEmail: localStorage.getItem('SOS_AUTH_EMAIL') || 'owner@spotlesssolutions.com', userName: 'Studio Owner', userRole: 'OWNER' };

    let permission = 'default';
    if ('Notification' in window) {
      permission = Notification.permission;
    }

    let pushEndpoint = null;
    let pushKeys = null;

    if (swRegistration && swRegistration.pushManager) {
      try {
        const sub = await swRegistration.pushManager.getSubscription();
        if (sub) {
          pushEndpoint = sub.endpoint;
          pushKeys = sub.toJSON().keys;
        }
      } catch (e) {
        // Ignore push get errors on unsupported contexts
      }
    }

    const deviceRecord = {
      device_id: deviceId,
      user_id: currentUser.userEmail || 'owner@spotlesssolutions.com',
      user_name: currentUser.userName || 'Studio Owner',
      user_role: currentUser.userRole || 'OWNER',
      platform: getPlatformIdentifier(),
      device_description: getDeviceDescription(),
      is_standalone: isStandalone,
      is_ios: isIOS,
      is_android: isAndroid,
      is_windows: isWindows,
      permission_status: permission,
      push_endpoint: pushEndpoint,
      push_keys: pushKeys,
      status: 'ACTIVE',
      last_active_at: new Date().toISOString(),
      created_at: localStorage.getItem('sos_device_created_' + deviceId) || new Date().toISOString()
    };

    if (!localStorage.getItem('sos_device_created_' + deviceId)) {
      localStorage.setItem('sos_device_created_' + deviceId, deviceRecord.created_at);
    }

    Object.assign(deviceRecord, customProps);

    const registry = getDeviceRegistry();
    const existingIndex = registry.findIndex(d => d.device_id === deviceId);
    if (existingIndex >= 0) {
      registry[existingIndex] = Object.assign({}, registry[existingIndex], deviceRecord);
    } else {
      registry.push(deviceRecord);
    }

    saveDeviceRegistry(registry);
    updatePushUiStatus();
    return deviceRecord;
  }

  // 5. PUSH NOTIFICATION REQUEST
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Push Notifications are not supported in this browser environment. For iPhone, install the app to your Home Screen first (iOS 16.4+).');
      return { success: false, reason: 'unsupported' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        let subscription = null;
        if (swRegistration && swRegistration.pushManager) {
          try {
            subscription = await swRegistration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(PWA_CONFIG.vapidPublicKey)
            });
          } catch (subErr) {
            console.log('[PWA] PushManager subscribe note:', subErr);
          }
        }

        const device = await syncDeviceRegistration({ permission_status: 'granted' });
        showNotificationPromptModal(true);
        return { success: true, device, subscription };
      } else {
        await syncDeviceRegistration({ permission_status: permission });
        alert('Notification permission was ' + permission + '. You can re-enable alerts in your device settings.');
        return { success: false, permission };
      }
    } catch (err) {
      console.error('[PWA] Error requesting notifications:', err);
      return { success: false, error: err.message };
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 6. LOCAL TEST NOTIFICATION DISPATCHER
  async function sendLocalTestNotification(title = '🚨 SOS Test Alert', body = 'Real-time multi-device synchronization active.') {
    if ('Notification' in window && Notification.permission === 'granted') {
      if (swRegistration && swRegistration.showNotification) {
        await swRegistration.showNotification(title, {
          body: body,
          icon: 'icon-192.png',
          badge: 'icon-192.png',
          vibrate: [200, 100, 200],
          data: { url: window.location.href, timestamp: new Date().toISOString() }
        });
      } else {
        new Notification(title, {
          body: body,
          icon: 'icon-192.png'
        });
      }
      return true;
    } else {
      const res = await requestNotificationPermission();
      if (res.success) {
        return sendLocalTestNotification(title, body);
      }
      return false;
    }
  }

  // 7. IPHONE INSTALLATION GUIDE MODAL
  function openIPhoneInstallGuide() {
    let modal = document.getElementById('sos-iphone-pwa-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sos-iphone-pwa-modal';
      modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:16px; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';
      modal.innerHTML = `
        <div style="background:linear-gradient(145deg, #14171F 0%, #0A0C10 100%); border:1px solid #D4AF37; border-radius:18px; max-width:440px; width:100%; padding:24px; color:#FFF; box-shadow:0 25px 50px rgba(0,0,0,0.8); position:relative;">
          <button onclick="document.getElementById('sos-iphone-pwa-modal').style.display='none'" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.1); border:none; color:#FFF; width:32px; height:32px; border-radius:50%; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
          
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div style="width:48px; height:48px; border-radius:12px; background:#000; border:1px solid #D4AF37; display:flex; align-items:center; justify-content:center; font-size:24px;">📱</div>
            <div>
              <h3 style="margin:0; font-size:18px; font-weight:800; color:#D4AF37; letter-spacing:0.5px;">Install on iPhone Home Screen</h3>
              <p style="margin:2px 0 0; font-size:12px; color:#94A3B8;">Official iOS App Distribution for Spotless Solutions</p>
            </div>
          </div>

          <p style="font-size:13px; line-height:1.5; color:#CBD5E1; margin-bottom:16px;">
            To run Spotless Solutions in full standalone mode with push notifications on iPhone, add it to your Home Screen using Safari:
          </p>

          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(212,175,55,0.25); border-radius:12px; padding:14px; margin-bottom:18px;">
            <div style="display:flex; gap:10px; margin-bottom:12px; align-items:flex-start;">
              <div style="background:#D4AF37; color:#000; font-weight:900; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; margin-top:2px;">1</div>
              <div style="font-size:13px; color:#FFF;">
                Open this address in <strong>Apple Safari</strong> on your iPhone.
              </div>
            </div>

            <div style="display:flex; gap:10px; margin-bottom:12px; align-items:flex-start;">
              <div style="background:#D4AF37; color:#000; font-weight:900; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; margin-top:2px;">2</div>
              <div style="font-size:13px; color:#FFF;">
                Tap the <strong>Share</strong> button <span style="font-size:15px; background:rgba(255,255,255,0.15); padding:1px 6px; border-radius:4px;">⎙ / ⬆</span> at the bottom of Safari.
              </div>
            </div>

            <div style="display:flex; gap:10px; margin-bottom:12px; align-items:flex-start;">
              <div style="background:#D4AF37; color:#000; font-weight:900; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; margin-top:2px;">3</div>
              <div style="font-size:13px; color:#FFF;">
                Scroll down and tap <strong>"Add to Home Screen"</strong> (⊞).
              </div>
            </div>

            <div style="display:flex; gap:10px; align-items:flex-start;">
              <div style="background:#D4AF37; color:#000; font-weight:900; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; margin-top:2px;">4</div>
              <div style="font-size:13px; color:#FFF;">
                Launch from your Home Screen & tap <strong>"Enable Notifications"</strong>.
              </div>
            </div>
          </div>

          <div style="display:flex; gap:10px;">
            <button onclick="document.getElementById('sos-iphone-pwa-modal').style.display='none'" style="flex:1; padding:12px; background:linear-gradient(135deg, #D4AF37 0%, #AA820A 100%); color:#000; font-weight:800; border:none; border-radius:10px; cursor:pointer; font-size:13px;">Got It</button>
            <button onclick="window.SOS_PWA.requestNotificationPermission()" style="flex:1; padding:12px; background:rgba(255,255,255,0.08); color:#FFF; font-weight:700; border:1px solid rgba(255,255,255,0.2); border-radius:10px; cursor:pointer; font-size:13px;">🔔 Enable Push</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
  }

  function showNotificationPromptModal(isSuccess) {
    if (isSuccess) {
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#10B981; color:#000; padding:12px 18px; border-radius:10px; font-weight:800; font-size:13px; z-index:999999; box-shadow:0 10px 25px rgba(0,0,0,0.5); display:flex; align-items:center; gap:8px;';
      banner.innerHTML = '✓ Push Notifications Enabled for this Device!';
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 4000);
    }
  }

  function updatePushUiStatus() {
    const btn = document.getElementById('sos-pwa-push-toggle-btn');
    if (btn) {
      const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
      if (perm === 'granted') {
        btn.innerHTML = '🔔 Alerts: Active';
        btn.style.color = '#34D399';
        btn.style.borderColor = 'rgba(52,211,153,0.4)';
      } else if (perm === 'denied') {
        btn.innerHTML = '🔕 Alerts: Blocked';
        btn.style.color = '#F87171';
        btn.style.borderColor = 'rgba(248,113,113,0.4)';
      } else {
        btn.innerHTML = '🔔 Enable Alerts';
        btn.style.color = '#FBBF24';
        btn.style.borderColor = 'rgba(251,191,36,0.4)';
      }
    }
  }

  // 8. SAFE-AREA & GLOBAL STYLES INJECTION
  function injectPwaStyles() {
    const style = document.createElement('style');
    style.id = 'sos-pwa-injected-styles';
    style.textContent = `
      :root {
        --sat: env(safe-area-inset-top, 0px);
        --sab: env(safe-area-inset-bottom, 0px);
        --sal: env(safe-area-inset-left, 0px);
        --sar: env(safe-area-inset-right, 0px);
      }
      body {
        padding-top: max(0px, var(--sat));
        padding-bottom: max(0px, var(--sab));
        padding-left: max(0px, var(--sal));
        padding-right: max(0px, var(--sar));
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }
      .sos-pwa-install-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(212, 175, 55, 0.12);
        border: 1px solid rgba(212, 175, 55, 0.35);
        color: #D4AF37;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .sos-pwa-install-badge:hover {
        background: rgba(212, 175, 55, 0.22);
        border-color: #D4AF37;
      }
    `;
    document.head.appendChild(style);
  }

  // PUBLIC EXPORTS
  window.SOS_PWA = {
    isIOS,
    isAndroid,
    isWindows,
    isStandalone,
    getPlatformIdentifier,
    getDeviceDescription,
    getDeviceId: getOrCreateDeviceId,
    getDeviceRegistry,
    registerServiceWorker,
    syncDeviceRegistration,
    requestNotificationPermission,
    sendLocalTestNotification,
    openIPhoneInstallGuide,
    checkForUpdates,
    showAutoUpdateToast
  };

  document.addEventListener('DOMContentLoaded', () => {
    injectPwaStyles();
    registerServiceWorker();
    
    // Broadcast channel listener for remote software updates
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('sos_realtime_sync_bus');
      channel.onmessage = function(event) {
        if (event.data && event.data.type === 'SYSTEM_VERSION_UPDATE') {
          console.log('[PWA Auto-Update] Broadcast received: SYSTEM_VERSION_UPDATE. Polling new SW...');
          checkForUpdates();
        }
      };
    }

    // If on iOS in standard Safari, provide subtle banner prompt if not standalone
    if (isIOS && !isStandalone && !sessionStorage.getItem('sos_ios_install_prompted')) {
      sessionStorage.setItem('sos_ios_install_prompted', 'true');
      setTimeout(() => {
        const installTrigger = document.getElementById('sos-ios-install-trigger');
        if (installTrigger) {
          installTrigger.style.display = 'inline-flex';
        }
      }, 1000);
    }
  });

})(window);
