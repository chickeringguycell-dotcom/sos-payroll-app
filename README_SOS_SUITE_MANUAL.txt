================================================================================
👑 SPOTLESS OFFICE SOLUTIONS LLC
Enterprise Operations Manual & Software Master Guide
Apps Covered: SOS Timecard (Employee Portal) & SOS Payroll (Executive Suite)
Target Audience: Studio Owners, Operations Managers, Payroll Administrators & Team Supervisors
Version: 3.6 Enterprise Edition • 100% Cloud-Synced & Mobile Ready • Golden Rule Active
================================================================================

LIVE APPLICATION WEB ADDRESSES:
--------------------------------------------------------------------------------
⏱️ SOS Timecard App (Cleaner Mobile Phone):
   https://chickeringguycell-dotcom.github.io/sos-payroll-app/timecard/

💰 SOS Payroll App (Executive Management Suite):
   https://chickeringguycell-dotcom.github.io/sos-payroll-app/

📖 Interactive Visual Manual (Printable with Satellite Maps):
   https://chickeringguycell-dotcom.github.io/sos-payroll-app/SOS_OPERATIONS_MANUAL.html

================================================================================
📑 TABLE OF CONTENTS
================================================================================
1. Executive Overview & Dual-App Architecture
2. How Updates & 3D Icons Are Delivered to Phones & PCs
3. Client Contracts & Numbered Worksites Manager (#01 to #20+)
4. Team Management, Worksite Assignment & Profile Rules
5. Dual GPS Geofence Verification & Real-Time Alert Engine
6. Timecard App: Employee Field Guide
7. Payroll Engine, Hours Calculation & $5,000 Emergency Reserve Policy
8. 1-Click Emergency Fund Release & Spendable Cash Allocation
9. The Golden Rule: Automated Email Audits (sos.cleaning@outlook.com)
10. Tax Vault & Deductions Breakdown (WA State & Federal)
11. Itemized Paystubs & Email Distribution
12. Former & Inactive Employees Archive Vault (Terminate & Rehire)
13. Automated Bank Direct Deposit Architecture (ACH / NACHA & Plaid)
14. Quick Troubleshooting & Support Procedures

================================================================================
1. EXECUTIVE OVERVIEW & DUAL-APP ARCHITECTURE
================================================================================
Spotless Office Solutions operates a custom, private two-app ecosystem engineered
to make field cleaning operations and executive payroll effortless:

+-----------------------------+               +-----------------------------+
|      ⏱️ SOS TIMECARD         |   Real-Time   |       💰 SOS PAYROLL         |
|   Cleaner Mobile Portal     | <-----------> |  Executive Operating Suite  |
|  • 1-Tap DOB Login          |  Cloud Sync   |  • Bank & Cash Reserves     |
|  • Satellite GPS Ping       |  (Zero Delay) |  • Tax Vaults & 1-Click ACH |
|  • Live Shift Timer         |               |  • Numbered Contracts & Roster|
+-----------------------------+               +-----------------------------+

THE TWO CORE APPLICATIONS:
• ⏱️ SOS Timecard App (/timecard/):
  Used by cleaners on their Apple iPhones or Android devices.
  1-tap PIN/DOB login, assigned worksite indicator, active live shift timer, and automated GPS location verification on both clock-in and clock-out.

• 💰 SOS Payroll App (/):
  Used by Owners and Payroll Managers on laptop, tablet, or phone.
  Manages live business checking cash, $5,000 untouchable cushion, team rosters, wage calculations, tax vaults, numbered contracts, geofence alerts, and direct deposit batch dispersal.

================================================================================
2. HOW UPDATES & 3D ICONS ARE DELIVERED TO PHONES & PCS
================================================================================
A. AUTOMATIC BACKGROUND DETECTION:
Whenever anyone opens the app or switches to their browser tab, the built-in Service Worker silently checks for updates in the background in 1–2 seconds.

B. FLOATING "UPDATE READY" NOTIFICATION BANNER:
When a new update is ready, a glowing gold banner appears across the top of the screen:
"✨ New App Update Available! New features & latest 3D icons are ready. [⚡ Update Now]"

• Tapping "⚡ Update Now" instantly refreshes the app to the latest version.
• Zero Data Loss: Cleaner login credentials, active shift timers, and past punch histories are 100% preserved.

C. REOPENING THE APP:
If an employee closes and reopens the app, it automatically launches straight into the fresh version without requiring any manual downloads.

D. UPDATING MOBILE HOME SCREEN ICONS:
Modern phones (iPhone Safari & Android Chrome) update the cached web app icons automatically. Cleaners can also tap the "📲 Download App" banner inside the app to refresh their home screen icon anytime.

================================================================================
3. CLIENT CONTRACTS & NUMBERED WORKSITES MANAGER (#01 to #20+)
================================================================================
To prevent cleaner confusion and ensure accurate GPS tracking, every facility is assigned a distinct Site Number (#01 to #20+).

HOW TO ADD OR MANAGE A CONTRACT:
1. In SOS Payroll, scroll to "🏢 Client Contracts, Worksites & Geofence Accounts".
2. Click "+ Add Contract / Site".
3. Fill out the contract details:
   - Site # Tag: e.g., Site #01, Site #02, etc.
   - Contract / Facility Name: (e.g., Apex Medical Center, Omni Commercial Tower).
   - Physical Street Address: (e.g., 100 Main St, Seattle, WA 98101). Must be accurate for GPS geofence matching.
   - Site Phone Number: Direct facility telephone contact.
   - Primary Contact / Manager: (e.g., Dr. Roberts, Property Manager).
   - Geofence Radius: Allowed boundary (Default: 0.15 mi / ~800 ft standard commercial lot).
4. Click "💾 Create Contract Site".

DELETING EXPIRED OR TERMINATED CONTRACTS:
1. Click the 🗑️ (Trash Can) on any contract row.
2. Confirm deletion. The facility is safely removed, and any cleaner assigned to that location will automatically revert to Floating without losing their profile.

================================================================================
4. TEAM MANAGEMENT, WORKSITE ASSIGNMENT & PROFILE RULES
================================================================================
ADDING A NEW TEAM MEMBER:
1. Click "+ Add Employee" in the Team section.
2. Enter the employee's information:
   - Full Name & Role / Position (e.g., Lead Commercial Cleaner).
   - Date of Birth (DOB): Used for secure 1-tap Timecard login.
   - Hourly Pay Rate ($): e.g., $23.50/hr.
   - Direct Deposit Information: Bank Name, 9-Digit Routing Number, Checking Account Number.
   - 📅 Official Hire Date: Selected within the 100-year window (1960–2060).
   - 🏢 Assigned Worksite Location: Select from your numbered list (e.g., [Site #01] Apex Medical Center).
3. Click "💾 Save Team Member".

================================================================================
5. DUAL GPS GEOFENCE VERIFICATION & REAL-TIME ALERT ENGINE
================================================================================
The Timecard app uses Dual GPS Verification to eliminate buddy-punching, early departures, and false hour claims.

HOW THE GPS VERIFICATION WORKS:
--------------------------------------------------------------------------------
Action     | Condition                   | App Reaction             | Manager Reaction
-----------+-----------------------------+--------------------------+----------------------------
Clock-In   | On-Site (Within 800 ft)     | Records punch cleanly:   | Zero interruption; clean
           |                             | 📍 On-Site [Site #01]    | hour accrual.
-----------+-----------------------------+--------------------------+----------------------------
Clock-In   | Off-Site (e.g. 5.2 mi away) | Flashes alert on screen; | 🚨 Red Bell Alert in SOS
           |                             | logs satellite GPS coords| Payroll & Email sent!
-----------+-----------------------------+--------------------------+----------------------------
Clock-Out  | On-Site (At facility)       | Closes shift cleanly;    | Shift automatically ready
           |                             | logs total shift hours.  | for payroll approval.
-----------+-----------------------------+--------------------------+----------------------------
Clock-Out  | Off-Site (e.g. Clocking     | Records departure coords | 🚨 Red Bell Alert in SOS
           | from home 8.1 miles away)   | and flags off-site exit. | Payroll & Email sent!
--------------------------------------------------------------------------------

ACKNOWLEDGING GEOFENCE ALERTS IN SOS PAYROLL:
1. When an off-site punch occurs, the top header displays "🔔 [1] Alerts" in illuminated red.
2. Click "🔔 Alerts" to open the Timecard Approvals & Geofence Incident Queue.
3. Review the card:
   - Cleaner Name
   - Incident Type (Clock-In vs Clock-Out)
   - Distance Off-Site (e.g., 5.24 miles)
   - Exact Time & Physical Address vs Assigned Site Address
4. Click "✓ Acknowledge & Approve" or adjust shift hours as needed.

================================================================================
6. TIMECARD APP: EMPLOYEE FIELD GUIDE
================================================================================
Share these 3 simple steps with cleaners:

1. Open the App: Open SOS Timecard on your phone (or tap the gold home screen icon).
2. Sign In: Tap your name from the roster and enter your Date of Birth (MM/DD/YYYY).
3. Punch Shift:
   - When arriving at the building, tap "⏱️ Clock In" (Allow location permissions if prompted).
   - When taking lunch, tap "☕ Start Lunch Break".
   - When shift is completed at the building, tap "🏁 Clock Out".

TIP: No Signal / Indoor Wi-Fi Fallback: If a cleaner is in a basement or thick concrete building with weak satellite GPS, the app seamlessly falls back to Wi-Fi/cellular triangulation so they are never locked out from punching their shift.

================================================================================
7. PAYROLL ENGINE, HOURS CALCULATION & $5,000 EMERGENCY BUSINESS RESERVE
================================================================================
STRICT BUSINESS POLICY ON THE $5,000 CUSHION:
The $5,000 Cushion is not personal spending money for the owners—it is the Dedicated Emergency Business Operating & Payroll Reserve.

AUTHORIZED USES:
1. Guaranteed Cleaner Payroll Backstop: If client payments are pending or business cash is temporarily tight, cleaner wages can be drawn directly from this $5,000 reserve so no employee ever misses a paycheck.
2. Crucial Job Site Equipment & Must-Have Supplies: Buying essential cleaning supplies (trash bags, trash cans, floor chemicals, commercial vacuums, mop heads) that cannot wait.
3. Emergency Worksite Repairs & Business Operations: Equipment breakdowns or urgent on-site client needs.

STRICTLY PROHIBITED:
• Zero Personal Withdrawals: Neither owner may pull from this $5,000 reserve for personal expenses (no sodas, personal lunches, home furniture, or non-business shopping). It must remain standing in the business account.

FREE & CLEAR CASH FORMULA:
Free & Clear Operating Cash = Bank Checking Balance - Net Payroll Due - Taxes Accrued - $5,000 Emergency Reserve

================================================================================
8. 1-CLICK EMERGENCY FUND RELEASE & SPENDABLE CASH ALLOCATION
================================================================================
When emergency funds are needed for payroll or urgent supplies:
1. In SOS Payroll, locate the "🔓 Need to Pay an Employee or Buy Urgent Supplies?" bar.
2. Click "🔓 Release Funds to Spendable Cash".
3. Enter the dollar amount needed (e.g., $350.00).
4. Select the Purpose:
   - Emergency Cleaner Payroll Backstop (Client invoice pending)
   - Crucial Job Site Supplies (Trash bags, mop heads, chemicals)
   - Commercial Equipment & Vacuums (Breakdown replacement)
   - Emergency Facility Worksite Need
   - Other (Type exact explanation)
5. Click "Authorize & Free Up Cash".
6. The funds are instantly deducted from the locked reserve and added directly into your Free & Clear Working Capital spendable balance!
7. When client payments arrive, click "♻️ Top-Up to $5,000" to restore the reserve to full funding.

================================================================================
9. THE GOLDEN RULE: AUTOMATED EMAIL AUDITS (sos.cleaning@outlook.com)
================================================================================
GOLDEN RULE: Every action across both apps automatically generates an audit record and emails sos.cleaning@outlook.com:

1. Emergency Reserve Fund Draw -> Dispatches amount, purpose, notes, and remaining reserve balance.
2. Payroll Execution / Direct Deposit Run -> Dispatches total wages, taxes, and itemized cleaner net payouts.
3. NACHA Direct Deposit File Export -> Dispatches direct deposit batch values and transaction details.
4. Off-Site Geofence Punch Violations -> Dispatches cleaner name, distance off-site, and exact GPS coordinates.
5. Employee Separations / Terminations -> Dispatches departure category, date, and explanation notes.
6. Employee Rehires -> Dispatches rehire confirmation and wage rate.
7. Client Contracts Created or Deleted -> Dispatches facility name, address, phone, and geofence perimeter.
8. Business Expenses Logged -> Dispatches vendor, amount, purpose, and camera receipts.

*Live Audit Log: Scroll to the bottom of SOS Payroll to view the "Live Business Audit Trail & Email Ledger" or click "Export Audit Log (.CSV)" to download a full spreadsheet copy.

================================================================================
10. TAX VAULT & DEDUCTIONS BREAKDOWN (WA STATE & FEDERAL)
================================================================================
SOS Payroll calculates all statutory employer and employee tax withholdings automatically on every payroll cycle:

--------------------------------------------------------------------------------
Government Agency                | Form / Risk Class       | Rate / Formula
---------------------------------+-------------------------+--------------------
1. WA Dept of Labor & Industries | Class 6602 (Janitorial) | $1.75 / hour composite
2. Internal Revenue Service (IRS)| Form 941 & 940 (FICA)   | 6.2% SS + 1.45% Med + FUTA
3. WA Employment Security (ESD)  | PFML & WA CARES         | 0.74% PFML + 0.58% Cares
4. WA Dept of Revenue (DOR)      | B&O Tax                 | 1.50% Gross Revenue
--------------------------------------------------------------------------------

================================================================================
11. ITEMIZED PAYSTUBS & EMAIL DISTRIBUTION
================================================================================
Every employee receives a comprehensive, bank-grade paystub:

WHAT APPEARS ON THE OFFICIAL PAYSTUB:
• Company Letterhead: SPOTLESS OFFICE SOLUTIONS LLC — Commercial Janitorial Services.
• Employee Details: Name, Position, Pay Period Dates, Check Date.
• Earnings Table: Regular Hours, Hourly Rate, Gross Earnings.
• Itemized Deductions: Federal Income Tax, Social Security, Medicare, WA PFML, WA CARES, WA L&I.
• Net Direct Deposit Summary: Deposited directly into their Bank Account (Account # masked for security: *****1234).
• 1-Click Email: Click "📧 Email Paystub" to send a clean PDF-formatted copy directly to the cleaner.

================================================================================
12. FORMER & INACTIVE EMPLOYEES ARCHIVE VAULT (TERMINATE & REHIRE)
================================================================================
When an employee is separated, they must never be permanently deleted so that historical tax and wage audit trails remain intact.

TERMINATING / ARCHIVING AN EMPLOYEE:
1. In the Team Roster, click the 🗑️ button on their row.
2. Select the Termination / Departure Date.
3. Choose the Departure Category:
   - 🔴 Fired - Attendance / No-Show / Tardy
   - 🔴 Fired - Performance / Cleanliness Standard
   - 🔴 Fired - Company Policy / Misconduct
   - ⚪ Voluntary Resignation / Quit
   - 🔵 End of Contract / Seasonal Layoff
   - ⚪ Other
4. Enter specific notes (e.g., "Failed to report for scheduled shift at Site #01").
5. Click "🗑️ Confirm & Move to Vault".

REACTIVATING / REHIRING A FORMER EMPLOYEE:
1. Scroll down to "🗄️ Former & Inactive Employees Archive Vault".
2. Locate the person in the table.
3. Click "♻️ Reactivate / Rehire".
4. Confirm rehire. The cleaner is immediately restored to the active team roster with their pay rate and banking details ready for the next shift!

================================================================================
13. AUTOMATED BANK DIRECT DEPOSIT ARCHITECTURE (ACH / NACHA & PLAID)
================================================================================
To achieve 100% automated direct deposits directly into cleaner bank accounts without paying payroll processor monthly fees, the system is engineered around the universal NACHA (National Automated Clearing House Association) Standard:

HOW AUTOMATED DISPERSAL WORKS:
1. The Bank Account Link:
   When your business checking account is opened at Qualstar Bank (or any US commercial bank), the bank provides an ACH Direct Deposit Originator ID (your 9-digit Company Tax ID / EIN).
2. 1-Click Approval Batch Generation:
   When you click "⚡ Pay All & Transmit Direct Deposit" in SOS Payroll:
   The app compiles all net wages into an encrypted NACHA .ach Direct Deposit Batch File containing exact routing numbers, account numbers, and net dollar amounts for each employee.
3. Automated Bank Transmission:
   - Option A (Direct Treasury Transmission): Upload the generated .ach file directly into Qualstar's Business Online Treasury portal (funds disperse overnight with zero per-employee processing fees).
   - Option B (Instant API Dispersal via Plaid / Dwolla): Connects via bank API to trigger immediate push transfers to employee accounts within seconds.

================================================================================
14. QUICK TROUBLESHOOTING & SUPPORT PROCEDURES
================================================================================
--------------------------------------------------------------------------------
Issue                           | Cause                   | Solution
--------------------------------+-------------------------+---------------------
Cleaner says "App says I'm      | Phone GPS calibration   | Step near window/entrance
off-site but I'm in the lobby"  | or concrete shielding.  | or increase site radius to 0.25 mi.
--------------------------------+-------------------------+---------------------
New features or logo not visible| Stale browser cache.    | Pull down on screen to refresh
on phone                        |                         | (Auto-Live engine updates).
--------------------------------+-------------------------+---------------------
Former employee wants their     | Employee is in Vault.   | Go to 🗄️ Former Vault &
past tax stubs                  |                         | print historical paystubs.
--------------------------------+-------------------------+---------------------
Need to reassign cleaner to a   | Shift schedule changed. | Click ✏️ Edit on cleaner ->
different building              |                         | select new worksite -> Save.
--------------------------------------------------------------------------------

Spotless Office Solutions LLC • Confidential Commercial Operating Manual
================================================================================
