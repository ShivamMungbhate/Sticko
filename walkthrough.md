# Walkthrough: Sticko Theme Switcher, Portfolios & New Trades (Completed)

We have successfully updated the **Sticko** local services portal with dynamic theme switcher controls, added new worker categories (Tent Man, Chef, Furniture Man), integrated a Customer Care contact mail, and developed image project portfolios for workers.

## 🚀 Live Services
- **GitHub Repository**: [https://github.com/ShivamMungbhate/Sticko](https://github.com/ShivamMungbhate/Sticko)
- **Frontend Client**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API Server**: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

---

## 🔧 Features Added

### 1. Dynamic Theme Toggler (Default, Dark, Light)
- **Default (🎨)**: The original cyberpunk neon violet theme.
- **Dark (🌙)**: A sleek absolute carbon black layout.
- **Light (☀️)**: A clean light mode utilizing soft whites, elegant gray elements, high-contrast text, and refined box shadows.
- Persists user selection automatically in the browser's local cache (`localStorage`).

### 2. Branding & Customer Care
- Rebranded all logo labels from "Sticko Dark" to simply **Sticko**.
- Added Customer Care references to the footer and contact headers with support mail pointing directly to: **`shivamhuyrr@gmail.com`**.

### 3. Expanded Services & Worker Categories
- Added 3 new service categories:
  - **Tent Man**: Event, wedding stages, and light dome tent installations.
  - **Chef**: Multi-cuisine chefs, catering assistants, and event buffet specialists.
  - **Furniture Man**: Teakwood, custom wardrobe installations, and carpentry repairs.
- Seeded the database with 6 additional realistic worker profiles across multiple Indian cities.

### 4. Worker Project Portfolio Showcases
- Created a `portfolio` array field in `db.json` storing past project descriptions and photo assets.
- Implemented a **"Works & Projects Portfolio"** horizontal sliding deck on worker cards.
- Clicking any project image triggers a beautiful **Lightbox Picture Viewer modal** to inspect their past results.

---

## 🔍 How to Test the Updates

1. Open the website: [http://localhost:5173/](http://localhost:5173/)
2. **Rebranding & Customer Care**: Verify that the header reads **Sticko** and check the footer for the mail hyperlink `shivamhuyrr@gmail.com`.
3. **Theme Selector**: Use the dropdown widget in the top right navbar header to toggle between **Default**, **Dark**, and **Light** themes. Verify that the color variables update dynamically.
4. **Worker Categories & Portfolios**:
   - Go to **Hire Workers** or click on a new category (e.g., **Furniture Man**).
   - Find a worker (e.g., Madan Suthar) and check out their **Works & Projects Portfolio**.
   - Click on any project slide (e.g., "Teakwood Dining Table Handcraft") to open the lightbox image viewer modal!
5. **Git Sync**: Check [https://github.com/ShivamMungbhate/Sticko](https://github.com/ShivamMungbhate/Sticko) to see the committed files.
