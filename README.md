# 📦 Sticko - Verified Local Services Directory

Sticko is a premium, full-stack local services directory portal that connects customers with government-verified service professionals, tutors, gaming partners, chefs, and event coordinators. Designed with a modular, responsive UI, it features a dynamic theme engine, secure user login, and visual worker portfolios.

🔗 **Live Deployment**: [https://sticko-ri3y.onrender.com/](https://sticko-ri3y.onrender.com/)

---

## ✨ Key Features

*   **🛠️ Expanded Category Service Directory**: Discover and hire Plumbers, Electricians, Carpenters (Furniture Man), Tutors, Chefs, Tent Men, Delivery personnel, and Car/Machine Mechanics.
*   **📂 Visual Project Portfolios**: Worker profiles showcase portfolios of their past work. Clients can click on project thumbnails to open a lightbox viewer modal.
*   **🎨 Dynamic Theme Switcher**: Toggle seamlessly between:
    *   **Default**: Cyberpunk-inspired dark theme with neon-violet highlights.
    *   **Dark**: A stealth, absolute midnight-black carbon layout.
    *   **Light**: A clean, premium light layout using soft whites and elegant shadows.
*   **🔒 Secure Government ID Authentication**: Both workers and hirers are authenticated with mobile, address, and government-issued credential validation (Aadhaar, PAN, Passport, or DL).
*   **🎓 Student Corner & Gigs**: Dedicated section for students to browse and apply for part-time local gigs, or register as home tutors/gaming partners.
*   **🛡️ Password-Protected Server Console**: Admin panel located at `/admin-control` allowing verification of pending government credentials and listing management (Admin password: `root`).
*   **📞 Built-in Customer Support**: Dedicated care center pointing directly to `shivamhuyrr@gmail.com`.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite, JSX), Lucide React (Icons), CSS Variables (Theme control)
*   **Backend**: Node.js, Express API server
*   **Database**: Mock file-based JSON DB storage (`server/db.json`)
*   **Deployment**: Unified production build setup serving React statically from the Express server.

---

## 🚀 Getting Started Locally

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)

### Installation
1. Clone this repository to your machine.
2. In the root directory, install all client and server dependencies:
    ```bash
    npm run install:all
    ```

### Running the App
Start both the React Vite frontend and Express server concurrently:
```bash
npm run dev
```
*   **Frontend**: `http://localhost:5173/` (Vite dev server with hot reload & API proxies)
*   **Backend**: `http://127.0.0.1:5000/` (Express API server)

---

## 🌐 Production Deployment

The project is pre-configured to run on a single port for cloud environments (like Render or Railway):

1. **Build & Compiles**: The deployment runner executes `npm run build`, which installs all dependencies and compiles the React application into `client/dist`.
2. **Serving Static Assets**: The Express server is configured to serve static assets from `client/dist` and fall back to `index.html` for React routing.
3. **API Port**: Render maps the instance `PORT` environment variable automatically, making the application fully accessible via a single URL.

---

## 📞 Support & Customer Care
For any questions, issues, or suggestions, reach out to our Customer Care team at:
✉️ **shivamhuyrr@gmail.com**
