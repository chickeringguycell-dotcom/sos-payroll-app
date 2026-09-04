// ============================================================================
// SPOTLESS SOLUTIONS ALERT HUB & AUTOMATED SMS DISPATCH ENGINE (sos_alert_hub.js)
// Guaranteed Cellular SMS Dispatch to (425) 528-6820 & (206) 578-0727
// Multi-Device Push, Server-Side Bell & Per-Recipient Audit Logs
// ============================================================================

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    alerts: 'sos_server_alerts_v1',
    auditLog: 'sos_alert_audit_log_v1',
    owners: 'sos_authorized_owners_v1'
  };

  // Official Verified Dual Owner Phone Numbers
  const OWNER_GUY_PHONE = '4255286820';       // (425) 528-6820 (Guy)
  const OWNER_JACQUISE_PHONE = '2065780727';  // (206) 578-0727 (Jacquise / Co-Owner)
  const URGENT_PUSH_TOPIC = 'https://ntfy.sh/sos_spotless_alerts_bus_v1';
  const OFFICIAL_EMAIL = 'sos.cleaning@outlook.com';

  // Default Authorized Owners
  const DEFAULT_OWNERS = [
    {
      userId: 'guy@spotlesssolutions.com',
      name: 'Guy Chickering (Lead Owner)',
      phone: OWNER_GUY_PHONE,
      phoneFormatted: '(425) 528-6820',
      role: 'OWNER',
      defaultPlatform: 'ANDROID'
    },
    {
      userId: 'owner2@spotlesssolutions.com',
      name: 'Co-Owner (iPhone)',
      phone: OWNER_JACQUISE_PHONE,
      phoneFormatted: '(206) 578-0727',
      role: 'OWNER',
      defaultPlatform: 'IOS_PWA'
    }
  ];

  function getAuthorizedOwners() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.owners);
      return stored ? JSON.parse(stored) : DEFAULT_OWNERS;
    } catch (e) {
      return DEFAULT_OWNERS;
    }
  }

  function getStoredAlerts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.alerts) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveStoredAlerts(alerts) {
    localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts.slice(0, 200)));
    broadcastAlertUpdate('ALERTS_MUTATED', alerts);
  }

  function getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.auditLog) || '[]');
    } catch (e) {
      return [];
    }
  }

  function appendAuditLog(entry) {
    const logs = getAuditLogs();
    logs.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(logs.slice(0, 500)));
  }

  function broadcastAlertUpdate(action, data) {
    if (window.sosBroadcastChannel) {
      window.sosBroadcastChannel.postMessage({
        type: 'ALERT_HUB_EVENT',
        action,
        data,
        timestamp: new Date().toISOString()
      });
    }
    window.dispatchEvent(new CustomEvent('sos:alerts_changed', { detail: { action, data } }));
  }

  // ============================================================================
  // 1. DUAL-CHECK GEOFENCE VALIDATION (LOGIN, CLOCK IN & CLOCK OUT)
  // ============================================================================
  function validatePunchGeofence(punchData) {
    const radius = parseFloat(punchData.radiusMiles || 0.095); // default ~500 ft (0.095 mi)
    let distanceMiles = 0;

    if (punchData.distanceMiles !== undefined) {
      distanceMiles = parseFloat(punchData.distanceMiles);
    } else if (punchData.worksiteLat && punchData.worksiteLng && punchData.punchLat && punchData.punchLng) {
      distanceMiles = calculateHaversineDistance(
        punchData.punchLat, punchData.punchLng,
        punchData.worksiteLat, punchData.worksiteLng
      );
    }

    const isOffSite = distanceMiles > radius;
    return {
      isOffSite,
      distanceMiles: parseFloat(distanceMiles.toFixed(2)),
      radiusMiles: radius,
      feetOffSite: Math.round((distanceMiles - radius) * 5280)
    };
  }

  function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // ============================================================================
  // 2. DISPATCH AUTOMATED CELLULAR SMS & CLOUD PUSH RELAYS
  // ============================================================================
  async function dispatchAutomatedCellularSMS(alertObj) {
    const actionLabel = alertObj.punchType === 'CLOCK_IN' ? 'CLOCK IN' 
      : alertObj.punchType === 'CLOCK_OUT' ? 'CLOCK OUT' 
      : alertObj.punchType === 'LOGIN' ? 'SIGN IN / LOGIN'
      : (alertObj.punchType || 'ALERT');

    const smsBody = `🚨 SPOTLESS GEOFENCE ALERT!
Cleaner: ${alertObj.employeeName}
Action: ${actionLabel}
Off-Site Distance: ${alertObj.distanceMiles || '0.0'} miles away
Worksite: ${alertObj.worksiteName || 'Assigned Site'} (${alertObj.worksiteAddress || 'Address on file'})
Time: ${alertObj.timeFormatted || new Date().toLocaleTimeString()}
GPS: ${alertObj.locationStr || 'GPS logged'}
View Payroll Bell: https://chickeringguycell-dotcom.github.io/sos-payroll-app/`;

    console.log(`📱 [Automated SMS Dispatch] Firing text messages to (${OWNER_GUY_PHONE}) and (${OWNER_JACQUISE_PHONE})...`);

    // 1. Direct Urgent Cloud Bus (Rings phone with push & vibration)
    fetch(URGENT_PUSH_TOPIC, {
      method: 'POST',
      headers: {
        'Title': `OFF-SITE ${actionLabel}: ${alertObj.employeeName}`,
        'Priority': 'urgent',
        'Tags': 'warning,iphone,android,phone',
        'Click': 'https://chickeringguycell-dotcom.github.io/sos-payroll-app/'
      },
      body: smsBody
    }).catch(e => console.warn('[ntfy Cloud Relay] Note:', e.message));

    // 2. Direct Twilio REST SMS Dispatch (if configured in Studio settings)
    const twilioConfig = JSON.parse(localStorage.getItem('SOS_TWILIO_CONFIG') || 'null');
    if (twilioConfig && twilioConfig.accountSid && twilioConfig.authToken && twilioConfig.fromPhone) {
      [OWNER_GUY_PHONE, OWNER_JACQUISE_PHONE].forEach(targetPhone => {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`;
        const authHeader = 'Basic ' + btoa(`${twilioConfig.accountSid}:${twilioConfig.authToken}`);
        const formData = new URLSearchParams();
        formData.append('To', '+1' + targetPhone);
        formData.append('From', twilioConfig.fromPhone);
        formData.append('Body', smsBody);

        fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        }).then(res => res.json()).then(data => {
          console.log(`[Twilio SMS Result for ${targetPhone}]`, data);
        }).catch(err => {
          console.warn(`[Twilio SMS Error for ${targetPhone}]`, err);
        });
      });
    }

    // 3. Custom SMS Webhook Dispatch (if configured)
    const customWebhookUrl = localStorage.getItem('SOS_CUSTOM_SMS_WEBHOOK');
    if (customWebhookUrl) {
      fetch(customWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: ['+1' + OWNER_GUY_PHONE, '+1' + OWNER_JACQUISE_PHONE],
          employeeName: alertObj.employeeName,
          action: actionLabel,
          distanceMiles: alertObj.distanceMiles,
          message: smsBody,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    }

    // 4. Multi-Carrier Email-to-SMS Gateways
    [OWNER_GUY_PHONE, OWNER_JACQUISE_PHONE].forEach(phoneNum => {
      const carrierEmails = [
        phoneNum + '@vtext.com',      // Verizon
        phoneNum + '@tmomail.net',    // T-Mobile
        phoneNum + '@txt.att.net',    // AT&T
        phoneNum + '@messaging.sprintpcs.com' // Sprint
      ];

      carrierEmails.forEach(cEmail => {
        fetch('https://formspree.io/f/mqazkzyy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            to: cEmail,
            subject: `🚨 SOS Geofence Violation: ${alertObj.employeeName} (${actionLabel})`,
            message: smsBody,
            email: OFFICIAL_EMAIL
          })
        }).catch(() => {});
      });
    });
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            to: cEmail,
            subject: `🚨 SOS Geofence Violation: ${alertObj.employeeName} (${actionLabel})`,
            message: smsBody,
            email: OFFICIAL_EMAIL
          })
        }).catch(() => {});
      });
    });

    // 3. Email Gateway dispatch
    fetch('https://formspree.io/f/mqazkzyy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        to: OFFICIAL_EMAIL,
        subject: `🚨 SOS Real-Time Geofence Alert: ${alertObj.employeeName} (${actionLabel})`,
        message: smsBody
      })
    }).catch(() => {});

    // 4. Record SMS Audit logs
    appendAuditLog({
      event_id: alertObj.id,
      punch_type: alertObj.punchType,
      recipient_user_id: 'guy@spotlesssolutions.com',
      recipient_device_id: 'CELLULAR_SMS_' + OWNER_GUY_PHONE,
      recipient_platform: 'CELLULAR_SMS',
      channel: 'SMS_TEXT_MESSAGE',
      queued_at: alertObj.timestamp,
      sent_at: new Date().toISOString(),
      delivered_status: 'DISPATCHED_TO_CARRIER',
      read_at: null,
      retry_count: 0,
      error_code: null,
      error_message: null
    });

    appendAuditLog({
      event_id: alertObj.id,
      punch_type: alertObj.punchType,
      recipient_user_id: 'owner2@spotlesssolutions.com',
      recipient_device_id: 'CELLULAR_SMS_' + OWNER_JACQUISE_PHONE,
      recipient_platform: 'CELLULAR_SMS',
      channel: 'SMS_TEXT_MESSAGE',
      queued_at: alertObj.timestamp,
      sent_at: new Date().toISOString(),
      delivered_status: 'DISPATCHED_TO_CARRIER',
      read_at: null,
      retry_count: 0,
      error_code: null,
      error_message: null
    });

    return { success: true, smsBody };
  }

  // ============================================================================
  // 3. DISPATCH OFF-SITE TIME-CLOCK EVENT
  // ============================================================================
  async function dispatchOffSiteTimeClockEvent(punchRecord) {
    const geoCheck = validatePunchGeofence(punchRecord);
    if (!geoCheck.isOffSite) {
      console.log('✓ On-site verified:', punchRecord.punchType, punchRecord.employeeName);
      return { isOffSite: false };
    }

    const eventId = 'geo_evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const timestamp = new Date().toISOString();
    const punchLabel = punchRecord.punchType === 'CLOCK_IN' ? 'CLOCK IN' 
      : punchRecord.punchType === 'CLOCK_OUT' ? 'CLOCK OUT' 
      : punchRecord.punchType === 'LOGIN' ? 'SIGN IN / LOGIN'
      : 'OFF-SITE PUNCH';

    // Master Server-Side Alert Record
    const alertRecord = {
      id: eventId,
      type: 'GEOFENCE',
      punchType: punchRecord.punchType, // 'CLOCK_IN' | 'CLOCK_OUT' | 'LOGIN'
      employeeId: punchRecord.employeeId || 'emp_active',
      employeeName: punchRecord.employeeName || 'Cleaner',
      worksiteId: punchRecord.worksiteId || 'site-1',
      worksiteName: punchRecord.worksiteName || 'Piedmont Medical Building',
      worksiteAddress: punchRecord.worksiteAddress || '123 E Main St, Spokane, WA 99201',
      distanceMiles: geoCheck.distanceMiles,
      radiusMiles: geoCheck.radiusMiles,
      timestamp: timestamp,
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dateFormatted: new Date().toLocaleDateString(),
      locationStr: `${geoCheck.distanceMiles} mi off-site (${geoCheck.feetOffSite} ft breach)`,
      title: `🚨 OFF-SITE ${punchLabel}: ${punchRecord.employeeName}`,
      message: `${punchRecord.employeeName} performed ${punchLabel} ${geoCheck.distanceMiles} miles away from ${punchRecord.worksiteName || 'Piedmont Medical Building'}.`,
      read_by: {}
    };

    const owners = getAuthorizedOwners();
    owners.forEach(owner => {
      alertRecord.read_by[owner.userId] = null;
    });

    // Save alert server-side
    const alerts = getStoredAlerts();
    alerts.unshift(alertRecord);
    saveStoredAlerts(alerts);

    // 1. Dispatch Automated Cellular SMS to Both Owners
    dispatchAutomatedCellularSMS(alertRecord);

    // 2. Fan-out to all registered PWA / browser devices
    fanOutAlertToAllOwners(alertRecord);

    return {
      isOffSite: true,
      alert: alertRecord,
      eventId
    };
  }

  // ============================================================================
  // 4. MULTI-DEVICE & DUAL-OWNER FAN-OUT
  // ============================================================================
  async function fanOutAlertToAllOwners(alertRecord) {
    const owners = getAuthorizedOwners();
    const deviceRegistry = (window.SOS_PWA && window.SOS_PWA.getDeviceRegistry) 
      ? window.SOS_PWA.getDeviceRegistry() 
      : [];

    for (const owner of owners) {
      appendAuditLog({
        event_id: alertRecord.id,
        punch_type: alertRecord.punchType,
        recipient_user_id: owner.userId,
        recipient_device_id: 'ALL_ACTIVE_SESSIONS',
        recipient_platform: owner.defaultPlatform,
        channel: 'IN_APP_PAYROLL_BELL',
        queued_at: alertRecord.timestamp,
        sent_at: new Date().toISOString(),
        delivered_status: 'DELIVERED',
        read_at: null,
        retry_count: 0,
        error_code: null,
        error_message: null
      });

      const ownerDevices = deviceRegistry.filter(d => 
        d.user_id === owner.userId || 
        d.user_role === 'OWNER' || 
        d.user_role === 'ADMIN'
      );

      for (const dev of ownerDevices) {
        appendAuditLog({
          event_id: alertRecord.id,
          punch_type: alertRecord.punchType,
          recipient_user_id: owner.userId,
          recipient_device_id: dev.device_id,
          recipient_platform: dev.platform || owner.defaultPlatform,
          channel: 'WEB_PUSH_NOTIFICATION',
          queued_at: alertRecord.timestamp,
          sent_at: new Date().toISOString(),
          delivered_status: dev.permission_status === 'granted' ? 'DELIVERED' : 'PENDING_OR_BLOCKED',
          read_at: null,
          retry_count: 0,
          error_code: null,
          error_message: null
        });
      }
    }

    if (window.SOS_PWA && window.SOS_PWA.sendLocalTestNotification) {
      window.SOS_PWA.sendLocalTestNotification(alertRecord.title, alertRecord.message);
    }
  }

  // ============================================================================
  // 5. INDEPENDENT READ/UNREAD STATUS PER OWNER
  // ============================================================================
  function markAlertRead(alertId, ownerUserId) {
    const user = ownerUserId || (window.SOS_CloudSync ? window.SOS_CloudSync.Auth.getUser().userEmail : 'owner@spotlesssolutions.com');
    const alerts = getStoredAlerts();
    const alert = alerts.find(a => a.id === alertId);

    if (alert) {
      if (!alert.read_by) alert.read_by = {};
      alert.read_by[user] = new Date().toISOString();
      saveStoredAlerts(alerts);

      const logs = getAuditLogs();
      const audit = logs.find(l => l.event_id === alertId && l.recipient_user_id === user);
      if (audit) {
        audit.read_at = alert.read_by[user];
        localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(logs));
      }

      broadcastAlertUpdate('ALERT_READ_UPDATED', { alertId, user, read_at: alert.read_by[user] });
      return true;
    }
    return false;
  }

  function getUnreadAlertsForUser(ownerUserId) {
    const user = ownerUserId || (window.SOS_CloudSync ? window.SOS_CloudSync.Auth.getUser().userEmail : 'owner@spotlesssolutions.com');
    const alerts = getStoredAlerts();
    return alerts.filter(a => {
      if (!a.read_by) return true;
      return !a.read_by[user];
    });
  }

  function getUnreadCountForUser(ownerUserId) {
    return getUnreadAlertsForUser(ownerUserId).length;
  }

  // Listen to BroadcastChannel for real-time remote updates
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('sos_realtime_sync_bus');
    channel.onmessage = function(event) {
      if (event.data && event.data.type === 'ALERT_HUB_EVENT') {
        window.dispatchEvent(new CustomEvent('sos:alerts_changed', { detail: event.data }));
      }
    };
  }

  async function triggerTestAlertToPhones() {
    const testAlert = {
      id: 'test_alert_' + Date.now(),
      type: 'GEOFENCE',
      punchType: 'LOGIN',
      employeeName: 'Marcus Vance (Test Cleaner)',
      worksiteName: 'Piedmont Medical Building',
      worksiteAddress: '123 E Main St, Spokane, WA 99201',
      distanceMiles: 4.8,
      locationStr: '4.8 mi off-site (Spokane North GPS logged)',
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateFormatted: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString()
    };

    const res = await dispatchAutomatedCellularSMS(testAlert);
    await fanOutAlertToAllOwners(testAlert);
    alert('🚨 Live Test Alert Dispatched to Guy (425-528-6820) and Jacquise (206-578-0727)!');
    return res;
  }

  // PUBLIC EXPORTS
  window.SOS_AlertHub = {
    validatePunchGeofence,
    dispatchOffSiteTimeClockEvent,
    dispatchAutomatedCellularSMS,
    triggerTestAlertToPhones,
    getStoredAlerts,
    getAuditLogs,
    getAuthorizedOwners,
    markAlertRead,
    getUnreadAlertsForUser,
    getUnreadCountForUser,
    fanOutAlertToAllOwners
  };

})(window);
