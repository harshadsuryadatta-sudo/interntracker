# Intern Report Tracker 🚀

A modern, production-ready full-stack web application designed for managing **Social Media Interns**, tracking daily deliverables and attendance time clocks, and monitoring analytics across **8 Instagram brand accounts** with automated synchronization.

---

## 🌟 Key Features

### 👤 Role-Based Management (Admin & Social Media Interns)
- **Administrator (Manager)**:
  - **Executive Dashboard**: Live telemetry cards (Total Interns, Present Today, Absent Today, Reports Submitted/Pending Today, Total Working Hours This Month, 8 Instagram Accounts, Monthly Posts).
  - **Factual Analytics & Visualizations**: Recharts-powered graphs for attendance trends, report status distribution (submitted vs drafts), and monthly working hours per intern.
  - **Intern Management**: Manage the 10 Social Media Interns, edit departments, toggle status, and reset passwords.
  - **All Reports Oversight**: View, search, and filter reports across all interns with ability to correct attendance and edit reports with audit logging (`updated_by`).
  - **Data Export System**: Export filtered report datasets to standard **CSV** (with UTF-8 BOM for Excel) and native **Microsoft Excel (.xlsx)** workbooks.
  - **Security Audit Logs**: Track administrative actions and synchronization history.

- **Social Media Intern Portal**:
  - **Personal Dashboard**: Personalized greeting (`Good Morning, [Intern Name]`), live stat cards (Today's Date, In Time, Out Time, Working Hours, Submitted/Pending counts).
  - **Attendance Time Clock**: One-click **CHECK IN** and **CHECK OUT** with automatic timestamps, duplicate prevention, and automated working hours calculation (e.g., `10:04 AM` to `6:12 PM` = `8h 08m`).
  - **Interactive Daily Reports Calendar**: Full monthly calendar with color-coded status badges:
    - 🟢 **Green**: Report submitted
    - 🟡 **Yellow**: Draft / partial
    - 🔴 **Red**: Missing report for past workdays
    - ⚪ **Grey**: Future / off-day
  - **Report History**: Filter by month, date, status, search deliverables, and pagination.
  - **Profile & Security**: Update contact info and change password.
  - **Strict Security Isolation**: Interns can **never** access, view, or modify another intern's reports or attendance records (enforced at both database and backend API layer).

### 📸 Instagram Analytics (8 Brand Pages)
- Displays all **8 Instagram accounts** in a clean, responsive SaaS grid.
- Each account card includes:
  - Account Profile Picture / Logo
  - Account Name & `@username`
  - Current Followers Count (formatted with commas)
  - Last Post Thumbnail, Title/Caption, and Publication Date
  - Time Since Last Post (e.g. `17 hours ago`)
  - "View Instagram" external link
- **Automated Synchronization Service**:
  - Background cron worker automatically syncs metrics and posts every 6 hours.
  - Admin-only **Sync Now** button with loading feedback.
  - Integrates with the official **Meta Graph API v19.0** when credentials are provided, or seamlessly falls back to the dynamic simulation sync engine without code changes.

---

## 🔑 Login Credentials (Social Media Interns & Admin)

All accounts can log in using either their **Username** or **Email** with the password: `Password123!`

| Intern Name | Username | Department | Role | Default Password |
|---|---|---|---|---|
| **Admin** | `admin` | Operations | Administrator | `Password123!` |
| **Ganesh** | `ganesh` | SIHS | Social Media Intern | `Password123!` |
| **Shravan** | `shravan` | MBA/SIFT | Social Media Intern | `Password123!` |
| **Sakshi** | `sakshi` | SCMIRT | Social Media Intern | `Password123!` |
| **Chinmay** | `chinmay` | SGI/SLC | Social Media Intern | `Password123!` |
| **Chiranjeev** | `chiranjeev` | SNS | Social Media Intern | `Password123!` |
| **Anushka** | `anushka` | SCHMTT | Social Media Intern | `Password123!` |
| **Neel Rathod** | `neel` | SCPHR | Social Media Intern | `Password123!` |
| **Hena** | `hena` | MCA/BCA | Social Media Intern | `Password123!` |
| **Harshali** | `harshali` | SJC/SPS | Social Media Intern | `Password123!` |
| **Harshad** | `harshad` | SCNPST/SIICS | Social Media Intern | `Password123!` |

*(A **"Quick Fill for Social Media Interns"** dropdown selector is provided directly on the Login page at `http://localhost:3000/login` for one-click testing.)*

---

## 🛠️ Tech Stack Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, Recharts, Lucide React, date-fns |
| **Backend** | Node.js, Express.js, REST API, JSON Web Tokens (JWT), bcryptjs, cookie-parser, node-cron, xlsx, morgan |
| **Security** | Helmet HTTP headers, CORS with credentials, express-rate-limit, parameterized SQL queries, password hashing |
| **Database** | PostgreSQL (Primary Production Engine). Supports **Neon**, **Supabase**, **Render**, **Railway**, and embedded PostgreSQL engine for zero-setup local dev |

---

## 🚀 Quick Start (Local Development)

### 1. Start Backend Server
```bash
cd backend
npm start
```
The backend initializes the PostgreSQL schema, runs migrations, seeds the 10 Social Media Interns and Instagram pages, and listens on `http://localhost:5000`.

### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Production Deployment Guide

### Database Setup (Supabase or Neon PostgreSQL)
1. Create a database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the Connection String URI (`postgresql://postgres:[PASSWORD]@[HOST]/postgres?sslmode=require`).

### Backend Deployment (Render or Railway)
1. Connect your repository to Render or Railway.
2. Root directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DATABASE_URL=postgresql://...`
   - `JWT_SECRET=your_32_char_secure_random_key`
   - `COOKIE_SECRET=your_cookie_encryption_key`
   - `CORS_ORIGIN=https://your-app.netlify.app`
   - *(Optional)* `INSTAGRAM_ACCESS_TOKEN=...`

### Frontend Deployment (Netlify)
1. Connect your repository to Netlify.
2. Base directory: `frontend`
3. Build Command: `npm run build`
4. Publish Directory: `frontend/dist`
5. Set Environment Variable in Netlify:
   - `VITE_API_URL=https://your-backend-api.onrender.com/api`
6. `netlify.toml` is pre-configured with SPA client-side routing fallback (`/* -> /index.html`).

