# Walkthrough: Sticko Service Expansion, OTP Checks, and Server Verifications

We have updated the **Sticko** local services portal with dynamic theme switcher controls, added new worker categories (Tent Man, Chef, Furniture Man), integrated a Customer Care contact mail, developed visual portfolios, added booking cancellations, integrated Mobile & Aadhaar OTP check flows, and enforced server-side ID authentication checks.

## 🚀 Live Services
- **GitHub Repository**: [https://github.com/ShivamMungbhate/Sticko](https://github.com/ShivamMungbhate/Sticko)
- **Frontend Client**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API Server**: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

---

## 🔧 Features Added

### 1. Booking Cancellations
*   Users can cancel bookings with `pending` or `approved` status directly from the **Booking Log** on their dashboard.
*   Clicking **Cancel** sends a request to the server updating the status to `cancelled`, which renders in red and frees up state.

### 2. Dual OTP Verification (Mobile & Aadhaar)
*   **Trigger Points**: Runs during user registration, user login, fast login, and worker registration.
*   **Step 1: Mobile Verification**: Prompts for a 6-digit OTP code sent to the mobile number (Default code: `123456`).
*   **Step 2: Aadhaar UIDAI Verification**: If the user/worker enters an Aadhaar government ID, a secondary verification modal pops up requesting the UIDAI verification code (Default code: `654321`).

### 3. Server-side Government ID Verification
*   **Simulated Contact Delay**: The backend Express server simulates contacting the central registries (like UIDAI Aadhaar registry or Income Tax department) with a `1500ms` delay before granting verification permissions.
*   **Aadhaar Validator**: The server validates that the Aadhaar ID contains exactly 12 numeric digits.
*   **PAN Card Validator**: Enforces standard format validations (5 letters, 4 digits, 1 letter) using regex on the backend.
*   **Admin Feedback**: The admin panel renders a loader `⏳ Verifying UIDAI...` during this request. If the format check fails, the backend rejects it and renders a warning banner detailing why.

### 4. Dynamic Theme Toggler (Default, Dark, Light)
*   **Default**: Original cyberpunk neon violet dark theme.
*   **Dark**: Sleek absolute midnight-black carbon layout.
*   **Light**: A clean light layout using soft whites and elegant shadows.
*   Persists user choice in browser's local cache (`localStorage`).

### 5. Expanded Services & Worker Categories
*   Added three new service categories: **Tent Man**, **Chef**, and **Furniture Man** (Carpenter).
*   Seeded `db.json` with visual portfolio arrays (slideshow deck and lightbox viewer) for each worker.

---

## 🔍 How to Test the Updates

1. Open the website: [http://localhost:5173/](http://localhost:5173/)
2. **Hiring Portal Login / Registration**:
   *   Log in with an existing Govt ID. Verify that the **OTP Verification Modal** triggers (Enter `123456` for mobile, and `654321` if it is an Aadhaar card).
3. **Admin Verification Flow**:
   *   Go to **Server Control** (password: `root`) -> **Verify Workers** tab.
   *   Click **Verify** on a pending worker (e.g. Harish Rawat). 
   *   Notice the `⏳ Verifying UIDAI...` loader. The server will validate the format.
   *   To test a rejection, register a new worker with an invalid Aadhaar format (e.g., just 3 numbers). Try verifying them in the admin dashboard: you will see a red error banner showing the server-side rejection reason!
4. **Booking Cancellations**:
   *   Book a service, go to your **Dashboard**, and click **Cancel** on the booking item.
5. **Git Sync**: View the updated files on GitHub at [https://github.com/ShivamMungbhate/Sticko](https://github.com/ShivamMungbhate/Sticko).
