# 🚀 Netlify Deployment Guide — Intern Report Tracker

This guide provides step-by-step instructions to deploy the **Intern Report Tracker** application to Netlify.

---

## ⚡ Option 1: Instant Drag-and-Drop Deployment (Under 1 Minute)

The frontend is already built into a production bundle located at:
📁 `d:\interntracker\frontend\dist`

1. Open your browser and go to **[Netlify Drop](https://app.netlify.com/drop)**.
2. Log in or create a free Netlify account.
3. Open your file explorer and drag the **`d:\interntracker\frontend\dist`** folder into the Netlify drop zone.
4. 🎉 **Done!** Your site will be live instantly with a free SSL certificate (`https://your-site-name.netlify.app`).

> ⚠️ **Important Note about Netlify Drop & 404 Errors:**
> Netlify Drop **only hosts static frontend files (HTML/CSS/JS)**. It does not run your local Node.js server.
> If you see `Request failed with status 404` when logging in:
> * Click **"⚡ Instant Demo Mode"** right on the login screen to immediately log in as Harshad (`123321`) or Admin.
> * Or click **"⚙️ Backend API Settings"** at the bottom of the login card to enter your deployed backend URL.

---

## 🔄 Option 2: Connect via GitHub (Automatic Continuous Deployment)

If you have pushed this repository to GitHub, GitLab, or Bitbucket:

1. Log into your **[Netlify Dashboard](https://app.netlify.com/)**.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Choose your Git provider (e.g., GitHub) and select your repository.
4. Netlify will automatically detect the included `netlify.toml` configuration:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy site"**. Every future `git push` will automatically trigger a new deployment.

---

## 🌐 Connecting the Backend API

The frontend uses `import.meta.env.VITE_API_URL || '/api'` to communicate with the backend.

### Setting Backend URL on Netlify:
1. In your Netlify Site dashboard, go to:
   **Site configuration** → **Environment variables** → **Add a variable**.
2. Key: `VITE_API_URL`
3. Value: `https://your-backend-api.onrender.com/api` (replace with your deployed backend URL).
4. Trigger a redeploy: **Deploys** → **Trigger deploy** → **Deploy site**.

---

## ⚙️ Backend Deployment (Render / Railway / Supabase)

To deploy the backend alongside Netlify:

### 1. Database (Free PostgreSQL)
Create a free cloud PostgreSQL database on:
- **[Neon](https://neon.tech/)** (Instant serverless PostgreSQL)
- **[Supabase](https://supabase.com/)**

Copy the connection string (e.g., `postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require`).

### 2. Backend Host (Render or Railway)
Deploy the `backend` folder to **[Render](https://render.com/)**:
1. Click **New +** → **Web Service**.
2. Connect your repository.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string from Neon/Supabase.
   - `JWT_SECRET`: A strong random string (e.g. `your_super_secret_jwt_key_2026`).
   - `COOKIE_SECRET`: Another random string (e.g. `your_cookie_secret_key_2026`).
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your Netlify URL (e.g. `https://your-site.netlify.app`).

When the backend starts, it will automatically run migrations and seed all 10 official Suryadatta Instagram accounts and Social Media Intern accounts!

---

## 📁 Key Deployment Files Created

- `d:\interntracker\netlify.toml` — Root Netlify build and redirect configuration.
- `d:\interntracker\frontend\netlify.toml` — Frontend-level Netlify configuration.
- `d:\interntracker\frontend\public\_redirects` — Production SPA routing fallback rules (`/* /index.html 200`).
- `d:\interntracker\frontend\dist\` — Optimized production build ready for deployment.
