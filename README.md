# Nexora Trading - Institutional Algorithmic Platform

**Nexora Trading** is an algorithmic trading, managed capital, and investment management web platform. It features an institutional visitor landing page with strict KYC identity verification, automated email document dispatching, an advanced Super-Admin control portal, and an authenticated user trading dashboard with automated Monday-through-Friday 1% daily compounding growth.

---

## Key Features

### 1. Visitor Landing Page
- Institutional dark theme with vibrant cyan (`#00f2fe`) and emerald (`#00e676`) accents.
- Educational onboarding workflow explaining the **$200+ USD minimum recent deposit (no upper limit)** required to activate daily 1% compounding gains.
- Live market ticker and quantitative performance stats.

### 2. KYC Verification & Email Dispatch
- 7 mandatory identity fields: Full Name, Email, Phone, DOB, Address, Aadhaar Number, PAN Card Number.
- **Dual Aadhaar Upload Boxes**: Dedicated uploaders for **Front Side** (Photo & details) and **Back Side** (Address & QR code).
- **PAN Card Uploader**.
- Automatically dispatches submissions with all 3 document attachments directly to `tradingtrendsbeta@gmail.com`.
- Automatically logs applications in the Admin Portal for 1-click account generation.

### 3. Super-Admin Portal (`/admin`)
- **Complete Control**: Admin has 100% control over all user accounts and dashboard views.
- **Direct Balance Override**: Edit any user's balance to any target amount anytime.
- **"View as User" (Live Impersonation)**: Admin can view the user's screen in real time.
- **KYC Inquiries Inbox**: Review submitted documents with 1-click user creation.
- **Withdrawals & Deposits Hub**: Review payout requests (USDT TRC-20 address or Binance ID) and approve or reject with instant balance settlements.
- **Platform & Deposit Settings**: Configure platform deposit address, custom deposit notes, and SMTP settings.

### 4. User Trading Dashboard
- Verified personal profile (Name, Email, Phone, DOB, Address, Aadhaar, PAN).
- **Automated Monday–Friday Growth Engine**: Automatically credits **+1% compounding growth daily** every Monday through Friday, cleanly pausing over Saturdays and Sundays.
- **Deposit Modal**: USDT TRC-20 address, QR code, and admin custom note.
- **Withdrawal Modal**: Payout to Crypto Address or Binance ID with mandatory network advisory note.
- **Nexora Trading Alpha-V Bot Feed**: Real-time algorithmic trade ledger.
- **TradingView Terminal**: Live interactive candlestick chart.

---

## Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, TradingView Charts, Vanilla CSS with custom glassmorphism design tokens.
- **Backend**: Node.js, Express, JSON persistent database store, Multer (multipart document uploads), Nodemailer (MIME attachments dispatch).
- **Security**: JWT Authentication, bcrypt password hashing, Role-Based Access Control (`ADMIN` vs `USER`).

---

## Local Development & Setup

### Prerequisites
- Node.js (v18+) & npm

### 1. Backend Setup
```bash
cd server
npm install
node index.js
```
The server will start on `http://localhost:5050`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The application will be accessible at `http://localhost:5175`.

### Default Credentials
- **Admin**: `admin` / `admin123`
- **Demo Trader**: `rahul_trader` / `TraderPass123!`

---

## 🚀 Free Deployment Guide

The application can be deployed with free automated SSL domains:
- **Backend API**: Hosted on **Render** (provides free `https://<your-app>.onrender.com`)
- **Frontend App**: Hosted on **Vercel** (provides free `https://<your-app>.vercel.app`)

### Step 1: Create the Supabase database
1. Create a Supabase project.
2. In the Supabase SQL Editor, run the contents of [`server/supabase/schema.sql`](./server/supabase/schema.sql).
3. Copy the project URL and the server-side service-role key. Keep the service-role key private; never add it to Vercel or frontend code.

### Step 2: Migrate existing application data
Run the migration from a trusted local machine before deploying the new backend:

```powershell
$env:SUPABASE_URL = "https://<project-ref>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<service-role-key>"
$env:MONGODB_URI = "<existing MongoDB Atlas connection string>"
npm --prefix server run migrate:supabase
```

The migration copies users, transactions, KYC submission records, settings, and other application data. Uploaded KYC files themselves remain in `server/uploads` and are not copied. If MongoDB is not being used, omit `MONGODB_URI` and the script imports `server/data/store.json` instead. It refuses to overwrite an existing Supabase store unless `--overwrite` is explicitly supplied. Keep the source database until you have verified the migrated accounts.

### Step 3: Deploy Backend to Render (render.com)
1. Sign up/Log in at [render.com](https://render.com) using your GitHub account.
2. Click **New +** -> **Web Service**.
3. Select and connect your repository: `paulchetti/Trading-Trends`.
4. Configure settings:
   - **Name**: `trading-trends-api` (or your choice)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`
5. In **Environment Variables**, add:
   - `ADMIN_EMAIL` = `tradingtrendsbeta@gmail.com`
   - `JWT_SECRET` = `trading_trends_secure_secret_2026` (or any random string)
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service-role key
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://trading-trends-api.onrender.com`).

### Step 4: Deploy Frontend to Vercel (vercel.com)
1. Sign up/Log in at [vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your `Trading-Trends` repository.
4. In project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: click `Edit` and select `client` (or leave default if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL from Step 1 (e.g., `https://trading-trends-api.onrender.com`)
6. Click **Deploy**.
7. Vercel will instantly generate your live website URL (e.g., `https://trading-trends.vercel.app`) with free SSL.

The backend requires Node.js 22 or newer and stores structured application records in Supabase. KYC document uploads are still written to the Render service filesystem; use a private Supabase Storage bucket if those files must also survive Render restarts.

---

## License
Proprietary & Confidential - Nexora Trading Institutional Technologies.
