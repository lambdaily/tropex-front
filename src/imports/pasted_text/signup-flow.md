STEP 1 — Create Account
Users create a basic account before selecting their role.

Fields:
- First name
- Last name
- Email
- Phone number
- Password
- Confirm password

Include:
- SMS OTP verification for phone
- Email verification option
- Terms and conditions checkbox
- Continue button

Layout:
Clean centered form card with step indicator at the top.

---

STEP 2 — Select User Type

Show 4 user roles as selectable cards.

Each card should have:
icon
title
short description

User roles:

1. Transport Company (Empresa)
A logistics company with multiple trucks and drivers.

2. Owner-Operator
Independent truck owner who operates their own livestock transport vehicle.

3. Company Driver (Chofer de Empresa)
Driver working for a registered transport company.

4. Rancher / Cattle Producer (Ganadero)
Livestock producer who needs to move cattle between ranches, auctions, and slaughterhouses.

The UI should show these four roles as clickable selection cards.

---

STEP 3 — Role-Specific Registration

Once a role is selected, show a different form for each role.

Transport Company (Empresa)
Fields:
- Company name
- Tax ID (RUC)
- Fleet size
- Main operating region
- Company contact number
- Upload company documents

Owner-Operator
Fields:
- Full name
- Personal ID or RUC
- Truck license plate
- Livestock capacity (number of cattle)
- Base location
- Upload vehicle documents

Company Driver
Fields:
- Phone number
- Assigned company name
- Invitation code or company ID
- Driver license upload
- ID document upload

Rancher / Ganadero
Fields:
- Ranch or farm name
- Ranch code or identifier
- RUC or tax ID
- Region / department
- Main cattle transport routes

---

STEP 4 — Document Verification

Show upload boxes for required documents depending on user type.

Examples:
Driver:
- license
- ID
- vehicle permit

Company:
- RUC
- transport permits
- insurance

Owner-Operator:
- vehicle photos
- permits
- license

Ganadero:
- ranch identification
- tax ID

Include status indicators:
Pending verification
Approved
Requires review

---

STEP 5 — Account Ready

Final confirmation screen.

Message:
"Your Tropero account has been created. Once verification is complete, you will be able to access the dashboard."

Show a preview of the next step depending on role:

Ganadero → create livestock transport request
Empresa → manage fleet and drivers
Owner-Operator → browse available trips
Driver → view assigned trips

---

Design requirements:

Use a clean SaaS layout similar to modern logistics platforms.

Include:
- step progress bar
- modern input fields
- card-based role selection
- upload document components
- large clear buttons
- responsive mobile-friendly layout

The signup flow should feel structured and professional like Uber Freight or Flexport onboarding.

Make the UI suitable for a logistics startup operating in Paraguay.