# 🦯 Blind Assist Monitoring Dashboard

A real-time caretaker monitoring dashboard for a Raspberry Pi-based Blind Assistance System.  
Built with **Next.js 14**, **Tailwind CSS**, **Framer Motion**, and **Recharts**.

---

## 👥 Team Setup — Read This First

This project is shared between collaborators. Before you touch any code, follow the setup steps below completely. Skipping steps will cause errors.

---

## ⚙️ Prerequisites

Make sure you have these installed on your machine before anything else:

| Tool | Version | Check command |
|---|---|---|
| Node.js | 18 or above | `node -v` |
| npm | 9 or above | `npm -v` |
| Git | any recent | `git --version` |

If you don't have Node.js, download it from [https://nodejs.org](https://nodejs.org) — install the **LTS** version.

---

## 🚀 First Time Setup (Every Team Member Does This Once)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install dependencies

```bash
npm install
```

> ⚠️ Never skip this step. The `node_modules` folder is not pushed to GitHub, so every team member must run this locally.

### 3. Create your environment file

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and set your Raspberry Pi's IP address:

```env
NEXT_PUBLIC_PI_URL=http://192.168.1.YOUR_PI_IP:5000
```

> ⚠️ `.env.local` is intentionally excluded from GitHub (it's in `.gitignore`). Every team member sets their own copy locally. Never commit this file.

### 4. Start the development server

```bash
npm run dev
```

### 5. Open in browser

```
http://localhost:3000
```

Login with any name, email, phone, and password to access the dashboard.

---

## 🍓 Raspberry Pi Setup

The Pi must be running before the dashboard shows live data.

### On the Raspberry Pi terminal:

```bash
# Install Python dependencies (first time only)
pip install flask flask-cors

# Start the backend server
python3 server.py

# In a second terminal, start the detection script
python3 blind_assist_demo.py
```

The Pi server runs on port `5000`. You can verify it is working by opening this in any browser on the same network:

```
http://YOUR_PI_IP:5000/status
```

You should see a JSON response like:

```json
{
  "status": "WARNING",
  "object": "person",
  "distance": "near",
  "audio_message": "person ahead near",
  "timestamp": "18:45:12"
}
```

---

## 📁 Project Structure

```
blind-assist-dashboard/
├── pages/
│   ├── _app.js              → App wrapper (do not edit)
│   ├── _document.js         → HTML head, fonts (do not edit)
│   ├── index.js             → Login page
│   └── dashboard.js         → Main dashboard (Pi polling lives here)
├── components/
│   ├── TopNavBar.js         → Top navigation bar
│   ├── CaretakerProfileCard.js
│   ├── SystemStatusPanel.js → SAFE / WARNING indicator
│   ├── AudioGuidancePanel.js → Live headphone message display
│   ├── EmergencyControlPanel.js → Call / Buzzer / Voice buttons
│   ├── LocationPanel.js     → Live map
│   ├── LogsPanel.js         → Scrolling event log
│   └── ChartsPanel.js       → Detection charts
├── styles/
│   └── globals.css          → Global dark theme styles
├── public/                  → Static assets
├── pi_server.py             → Flask API server (runs on Raspberry Pi)
├── .env.local.example       → Template for environment variables
├── .env.local               → Your local config — DO NOT COMMIT
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔄 Daily Workflow — Making and Sharing Changes

Every time you sit down to work, follow this flow:

### Before you start coding — pull latest changes

```bash
git pull origin main
```

> Always do this first. If teammates pushed changes while you were away, this keeps you in sync.

---

### While working — save your progress

```bash
# See what files you changed
git status

# Stage all your changes
git add .

# Or stage a specific file only
git add pages/dashboard.js

# Commit with a clear message describing what you did
git commit -m "fix: status panel not updating on WARNING"
```

---

### When you are done — push to GitHub

```bash
git push origin main
```

---

### If someone else pushed while you were working

You will see an error like `rejected... non-fast-forward`. Fix it with:

```bash
git pull origin main
# If there are merge conflicts, resolve them in VS Code, then:
git add .
git commit -m "merge: resolve conflict in dashboard.js"
git push origin main
```

---

## 🌿 Working on a Feature (Recommended for Big Changes)

If you are building something new or experimental, use a branch so you don't break the main dashboard for the team:

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Work on your code, then commit normally
git add .
git commit -m "feat: add battery alert panel"

# Push your branch
git push origin feature/your-feature-name
```

Then open a **Pull Request** on GitHub to merge it into `main` once it is ready and tested.

---

## 🛠️ Common Commands Reference

| Command | What it does |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `git pull origin main` | Get latest changes from GitHub |
| `git add .` | Stage all changed files |
| `git commit -m "message"` | Save a commit locally |
| `git push origin main` | Upload commits to GitHub |
| `git status` | See what files have changed |
| `git log --oneline` | See recent commit history |
| `git checkout -b branch-name` | Create a new branch |

---

## ❗ Rules for the Team

1. **Never commit `.env.local`** — it contains your local Pi IP and is different for everyone
2. **Never commit `node_modules/`** — it is already in `.gitignore`, just run `npm install`
3. **Always pull before you start working** — avoids merge conflicts
4. **Write clear commit messages** — your teammates need to understand what changed
5. **Test before pushing** — run `npm run dev` and check the dashboard works

---

## 🐛 Troubleshooting

**`npm run dev` throws module not found errors**
```bash
rm -rf node_modules
npm install
```

**Dashboard shows "Simulation Mode" — not connecting to Pi**
- Check Pi server is running: `python3 server.py`
- Check your `.env.local` has the correct Pi IP
- Make sure your laptop and Pi are on the **same WiFi network**
- Test the Pi API directly: open `http://YOUR_PI_IP:5000/status` in browser

**Git says "Please tell me who you are" on first use**
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

**Merge conflict after `git pull`**
- Open the conflicted file in VS Code
- You will see `<<<<<<< HEAD` markers — choose which version to keep
- Delete the conflict markers, save the file
- Run `git add .` then `git commit -m "resolve merge conflict"`

---

## 📞 Project Contact

For questions about the Raspberry Pi hardware setup, contact the hardware lead.  
For questions about the dashboard code, check the commit history to see who last touched that file:

```bash
git log --oneline components/SystemStatusPanel.js
```

---

*Blind Assist System — University Project*
