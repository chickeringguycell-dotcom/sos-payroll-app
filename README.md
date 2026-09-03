# 👑 Spotless Office Solutions LLC — Enterprise Business Suite

An autonomous, enterprise-grade business management and field operations platform engineered exclusively for **Spotless Office Solutions LLC** (Owners: **Guy Chickering** & **Jacquise Chickering**).

The suite operates across three synchronized platforms:
1. **💼 SOS Payroll Executive Suite** (`SOS_Payroll.html` / `index.html`) — Live cash capital, $5K untouchable cushion, team payroll, business expense receipt camera, client contracts & geofence worksites, tax vault, and real-time executive alerts.
2. **⏱️ SOS Timecard Field App** (`SOS_Timecard.html` / `timecard.html`) — Cleaner mobile time tracking, face photo headshot centering, GPS 500-foot geofence verification, harmonic acoustic chimes, and automatic dual-owner cellular SMS violation dispatch.
3. **📊 Commercial Office Estimator & Profitability Engine** (`index.html` / Flutter) — Multi-stage commercial labor formula, production rate tuning, burden costs, and client proposals.

---

## 🌟 Live Production Links (GitHub Pages)

* 💼 **SOS Payroll Executive Suite**:  
  [https://chickeringguycell-dotcom.github.io/sos-payroll-app/](https://chickeringguycell-dotcom.github.io/sos-payroll-app/)

* ⏱️ **SOS Timecard App**:  
  [https://chickeringguycell-dotcom.github.io/sos-payroll-app/timecard.html](https://chickeringguycell-dotcom.github.io/sos-payroll-app/timecard.html)

---

## 💼 1. SOS Payroll Executive Suite (`SOS_Payroll.html`)

### A. Executive Header & Quick-Action Bar
* **Top Header**: High-visibility branding with uniform 3-button equal grid row (`⏱️ Timecard` | `🔔 Alerts` | `🔄 Refresh`).
* **Real-Time Bell Alerts**: Live unread counter badge, multi-tone siren, vibration, and clean *All Clear* state when no violations exist.
* **Nuclear Force Refresh**: Full CacheStorage purge, ServiceWorker unregistration, and no-cache network redirect to ensure instant updates on all mobile devices.

### B. Live Business Cash & $5,000 Untouchable Cushion
* **$5,000 Business & Emergency Reserve**: Strictly locked for business necessities and cleaner payroll backstop only (zero personal owner draws permitted).
* **Emergency Fund Release & Top-Up**: 1-click authorization to release funds to spendable cash for supplies/cleaners or replenish back to target.
* **Mathematical Cash Breakdown**:
  $$	ext{Free \& Clear Capital} = 	ext{Bank Balance} - 	ext{Net Wages Due} - 	ext{Accrued Tax Vault} - 	ext{\$5,000 Reserve}$$
* **Qualstar Bank Live Checking Balance**: Real-time balance tracker with instant recalculations.

### C. Employee Timecards Hub & Shift Auditor
* **Live Cleaner Select**: Inspect individual cleaner punch logs, weekly decimal hours, gross pay, and profile photo headshots.
* **Timecard Shift Audit Table**: Full timestamps, worksite names, geofence radius tags, and direct hours adjustment approval tools.

### D. Team, Owners & Cleaner Payroll Engine
* **Washington State Labor Class 6602**: Accrues statutory workers' comp ($1.75/hr composite rate).
* **Itemized Statutory Withholdings**:
  * Federal W-4 & FICA Social Security ($6.20\%$) + Medicare ($1.45\%$).
  * WA Paid Family & Medical Leave (PFML $0.74\%$) + WA Cares Long-Term Care Fund ($0.58\%$).
  * Employer SUI ($1.50\%$) and Federal FUTA ($0.60\%$).
* **Automated Direct Deposit ACH & Paystub Mailer**: Instant itemized paystub generation and dispatch to `sos.cleaning@outlook.com`.

### E. Business Expenses & Camera Receipt Vault
* **Itemized Expense Logger**: Vendor, store, category (Equipment, Cleaning Chemicals, Trash Bags, Fuel, Uniforms, Meals), purpose notes, and dollar amount.
* **Direct Camera Receipt Capture**: High-resolution receipt photos compressed and archived in local memory and emailed immediately to company records.

### F. Numbered Client Contracts, Worksites & Geofence Accounts
* **Contract Site Numbering**: Clean numbering format (`#01` to `#20+`).
* **Geofence Perimeters**: Exact street addresses, client contact phone numbers, assigned cleaners, and GPS coordinates with customizable radius (default 500 ft / 0.095 mi).

### G. Former & Inactive Employees Archive Vault
* **Permanent Wage History**: Preserves historical wages, hours, hire dates, departure dates, and termination reasons for fired, laid-off, or resigned cleaners.

### H. Live Business Audit Trail & Email Dispatch Ledger
* **Golden Rule Enforcement**: Every payroll run, emergency reserve draw, expense log, and geofence incident is automatically emailed to **`sos.cleaning@outlook.com`**.
* **CSV Export**: 1-click audit ledger download for CPA and tax filings.

### I. Where Withholdings Go (Government Tax Vault)
Located at the very bottom of the page with 4 distinct agency windows:
1. 🟨 **WASHINGTON STATE L&I** (Janitorial Class 6602 | `secure.lni.wa.gov`).
2. 🟦 **FEDERAL IRS FORM 941 & 940** (FICA, Medicare & Fed Withholding | `EFTPS.gov`).
3. 🟩 **WA ESD (PFML & CARES)** (Paid Family Leave & WA Cares Fund | `paidleave.wa.gov`).
4. 🟥 **WA DOR (B&O TAX)** (WA Business & Occupation Tax $1.50\%$ on Gross Revenue | `secure.dor.wa.gov`).

---

## ⏱️ 2. SOS Timecard Mobile Field App (`SOS_Timecard.html`)

### A. Dedicated Mobile PWA Identity
* **Gold & Black Visual Identity**: Custom standalone clock logo (`apple-touch-icon-tc.png`, `icon-192-tc.png`, `icon-512-tc.png`).
* **Offline-Ready PWA**: Standalone home screen shortcut with instant boot.

### B. Cleaner Profile & Touch-Draggable Photo Centering
* **Square Avatar Viewport**: Pushed to the bottom-left with employee name header on top.
* **Direct Touch/Mouse Drag**: Cleaners can touch their photo with their finger and drag/pan to center their face in real-time.
* **Auto-Save on Finger Lift**: Saves pan coordinates into memory the instant finger lifts (`✓ Saved` green indicator toast).
* **Double-Tap Zoom Adjuster**: Double-tapping the square opens the full zoom and framing adjuster modal.
* **Evenly Spaced Action Buttons**: Far-right 3-button stack (`Log Out`, `Take Photo`, `Upload from Phone`) evenly spaced from top to bottom.

### C. Master Morphing Button & GPS Engine
* **Single Morphing Control**:
  * 🟢 **Clock In** (Green, pulses when off-shift).
  * 📡 **Pinging your GPS location...** (Blue, 3-second animated acquisition with Spokane coordinate fallbacks).
  * 🔴 **Clock Out** (Red, pulses when active shift is running).
* **Gentle Luxury Harmonic Chime**: Soothing multi-tone sine wave chime replaces harsh buzzer sounds on punch action.
* **5-Second Fail-Safe Watchdog**: Defensive coordinate parsing and `try/catch/finally` guarantee the punch button never freezes.

### D. Dual-Owner Automated Cellular SMS Violation Dispatch
Whenever a cleaner clocks in or out $>500	ext{ ft}$ from their assigned worksite, an automated cellular SMS text is immediately dispatched to:
* 📲 **Guy Chickering**: `(425) 528-6820`
* 📲 **Jacquise Chickering**: `(206) 578-0727`
* 📩 **Company Email**: `sos.cleaning@outlook.com`

**Dispatched SMS Message Payload:**
```text
🚨 SOS GEOFENCE VIOLATION!
Cleaner: Jane Doe
Action: CLOCK IN
Off-Site: 220.4 miles away
Assigned Site: Piedmont Medical Building
Time: 7:25 AM
GPS: 47.6101, -122.2015
Open Payroll: https://chickeringguycell-dotcom.github.io/sos-payroll-app/?v=94
```

---

## 📊 3. Commercial Office Estimator & Profitability Engine

### Multi-Stage Commercial Labor Formula
1. **Stage 1**: Base General Cleaning Minutes ($	ext{sqft} / 3000	ext{ sqft/hr} 	imes 60	ext{m}$).
2. **Stage 2**: Restrooms & Fixture Minutes (Toilets $5	ext{m}$, Urinals $3	ext{m}$, Sinks $2	ext{m}$, Showers $8	ext{m}$).
3. **Stage 3**: Kitchens & Breakrooms (Standard $10	ext{m}$, Full Kitchens $20	ext{m}$).
4. **Stage 4**: Conference Rooms ($3	ext{m}$) & Main Entrances ($5	ext{m}$).
5. **Stage 5**: Stairs ($8	ext{m}$), Elevators ($4	ext{m}$), and Security Access.
6. **Stage 6**: Mobilization, travel, and staging allowances.
7. **Stage 7 & 8**: Traffic, Trash, and Condition Multipliers.
8. **Stage 9**: Three Reference Prices ($A$: Target Billing Rate $\$60/	ext{hr}$, $B$: $40\%$ Target Gross Margin, $C$: $\$125$ Minimum Visit Floor).

---

## 🔒 Security, Data Privacy & Ownership

* **Creator Exception & Studio Ownership**: Full supreme override authority belongs to **Guy Chickering** and **Jacquise Chickering**.
* **Zero Public Access**: All financial data, employee headshots, and timecard logs are private to Spotless Office Solutions LLC.
* **Local Storage & Cloud Relay Synchronization**: Works 100% offline with background Cloud Relay Bus integration.

---

*Spotless Office Solutions LLC © 2026. All Rights Reserved.*
