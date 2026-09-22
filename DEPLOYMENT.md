# 🚀 Deploying Raja Rani to Render (Free Cloud Hosting)

This guide walks you through deploying **Raja Rani** to [Render](https://render.com) so you and your friends can play together from any mobile phone or computer anywhere in the world.

---

## ⚡ Method 1: Push to GitHub & 1-Click Blueprint (Recommended)

Because we have added [`render.yaml`](file:///c:/Users/jdhav/QK/render.yaml) to the project, Render can configure everything automatically with 1 click.

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Enter a repository name (e.g., `raja-rani-game`)
3. Choose **Public** (or Private) and click **Create repository**

### Step 2: Push your code to GitHub
Run the following commands in your terminal in `c:\Users\jdhav\QK`:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/raja-rani-game.git
git push -u origin main
```

### Step 3: Deploy on Render
1. Go to your [Render Dashboard](https://dashboard.render.com/) (Sign up for free if you don't have an account).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your `raja-rani-game` GitHub repository.
4. Render will read [`render.yaml`](file:///c:/Users/jdhav/QK/render.yaml) automatically:
   - **Service Name:** `raja-rani-royale`
   - **Environment:** `Node`
   - **Plan:** `Free`
   - **Build Command:** `npm run render:build`
   - **Start Command:** `npm start`
5. Click **Apply**.
6. Render will automatically install packages, compile the frontend, and boot up your multiplayer game server.

Once the build finishes (takes ~1-2 minutes), Render will give you your live URL, such as:
👉 **`https://raja-rani-royale.onrender.com`**

---

## 🛠️ Method 2: Manual Web Service on Render

If you prefer setting it up manually without Blueprints:

1. On [dashboard.render.com](https://dashboard.render.com), click **New +** ➔ **Web Service**.
2. Select your GitHub repository.
3. Configure the following fields:
   - **Name:** `raja-rani-game`
   - **Region:** Any (e.g. Oregon, Singapore, Frankfurt)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm run render:build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
5. Click **Deploy Web Service**.

---

## 📱 How Players Join from Mobile Phones

1. Open your live Render URL on any phone (Android or iPhone).
2. Host clicks **Create Room** and shares the 4-digit code (e.g. `RR-7K29`) over WhatsApp, Discord, or SMS.
3. Other 5 friends open the URL on their phones, click **Join Room**, enter the code and their name.
4. Host taps **START GAME** and play real-time royal Raja Rani!
