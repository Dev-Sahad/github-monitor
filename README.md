```markdown
# 📊 GitHub Ecosystem Monitor & Telemetry Hub

A lightweight, automated cloud tracking engine built with Node.js that hooks into the official GitHub REST API to actively monitor user profile performance, repository health, workflows, and sponsorship state channels. Dispatches formatted diagnostics directly to a mobile Telegram interface.

---

## 📂 System File Architecture

```text
github-monitor/
├── .github/
│   └── workflows/
│       └── monitor.yml
├── .vscode/
│   └── settings.json
├── .gitignore
├── index.js
├── package.json
└── README.md

```
## 🛠️ Configuration & Workflow Specifications
### 1. .gitignore
```text
node_modules/
.env
.DS_Store

```
### 2. .vscode/settings.json
```json
{
  "javascript.validate.enable": true,
  "typescript.validate.enable": true,
  "search.exclude": {
    "**/node_modules": true
  },
  "files.exclude": {
    "**/node_modules": false
  }
}

```
### 3. .github/workflows/monitor.yml
```yaml
name: Automated GitHub Monitor

on:
  schedule:
    - cron: '0 * * * *' # Runs automatically at the top of every single hour
  workflow_dispatch: # Allows manual trigger execution via GitHub UI

jobs:
  run-monitor:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Project Dependencies
        run: npm install

      - name: Execute Monitor Script
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
        run: node index.js

```
### 4. package.json
```json
{
  "name": "github-monitor",
  "version": "1.0.0",
  "description": "Automated GitHub Profile and Ecosystem Telemetry Hub",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "axios": "^1.7.0"
  }
}

```
### 5. index.js
```javascript
const axios = require('axios');

// Configuration pulled securely from GitHub Repository Secrets
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GITHUB_USERNAME = "Dev-Sahad";

async function runMonitor() {
  if (!GITHUB_TOKEN || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ Error: Missing configuration environment variables!');
    process.exit(1);
  }

  try {
    console.log('🔄 Querying deep GitHub ecosystem metrics...');
    const config = { headers: { Authorization: `token ${GITHUB_TOKEN}` } };
    
    // 1. Fetch profile and repository metadata
    const userRes = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}`, config);
    const profile = userRes.data;

    // 2. Fetch traffic views for your Profile Repository
    let profileViews = "N/A (Create a repo named 'Dev-Sahad' to track)";
    let uniqueVisitors = "N/A";
    try {
      const trafficRes = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/traffic/views`, config);
      profileViews = trafficRes.data.count || 0;
      uniqueVisitors = trafficRes.data.uniques || 0;
    } catch (e) {
      // Gracefully falls back if metrics are uninitialized
    }

    // 3. Fetch recent events stream
    const eventsRes = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/events`, config);
    const events = eventsRes.data;

    const openIssues = events.filter(e => e.type === 'IssuesEvent' && e.payload.action === 'opened').length;
    const openedPRs = events.filter(e => e.type === 'PullRequestEvent' && e.payload.action === 'opened').length;
    
    // Emergency Sponsor tracking condition
    const sponsorEvent = events.find(e => e.type === 'SponsorshipEvent');
    let sponsorAlertStr = "No new changes detected.";
    if (sponsorEvent) {
      const action = sponsorEvent.payload.action;
      const tier = sponsorEvent.payload.sponsorship.tier.name;
      sponsorAlertStr = `🚨 *EMERGENCY SPONSORS UPDATE:* A tier was *${action}* (${tier})!`;
    }

    // 4. Fetch workflow run statuses
    let deployStatusStr = "✅ Systems nominal";
    try {
      const runsRes = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/actions/runs?per_page=1`, config);
      if (runsRes.data.workflow_runs && runsRes.data.workflow_runs.length > 0) {
        const latestRun = runsRes.data.workflow_runs[0];
        deployStatusStr = latestRun.conclusion === 'success' 
          ? `✅ Deploy Success (${latestRun.name})` 
          : `⚠️ Deploy Failed/Pending (${latestRun.name})`;
      }
    } catch (e) {
      deployStatusStr = "No active build runners configured.";
    }

    // 5. Construct structural message output template
    const message = `
📊 *GitHub Ecosystem Monitor: @${profile.login}*
---
🗂️ *Repositories:* ${profile.public_repos} Public | ${profile.total_private_repos || 0} Private
👥 *Followers:* ${profile.followers} | *Following:* ${profile.following}

📈 *Profile Traffic (Last 14 Days):*
• Total Profile Views: *${profileViews}*
• Unique Visitors: *${uniqueVisitors}*

🚀 *Recent Activity Stream:*
• New Issues: *${openIssues}*
• PRs Raised: *${openedPRs}*

🤖 *Deployment Environment Status:*
• ${deployStatusStr}

💸 *Sponsors Telemetry Status:*
• ${sponsorAlertStr}
    `.trim();

    // Dispatch formatted telemetry straight to Telegram
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log('✅ Advanced telemetry packet successfully sent to Telegram.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Monitor telemetry pipeline failure:', error.message);
    process.exit(1);
  }
}

runMonitor();

```
## ⚙️ Environment Variables Configuration
The engine requires the following keys to authenticate with the GitHub and Telegram APIs. Save these securely under your repository settings (**Settings -> Secrets and variables -> Actions**):
| Secret Name | Description | Source |
|---|---|---|
| GITHUB_TOKEN | Personal Access Token (Classic) with repo and user scopes. | GitHub Developer Settings |
| TELEGRAM_BOT_TOKEN | HTTP API access token for your custom monitor bot instance. | @BotFather on Telegram |
| TELEGRAM_CHAT_ID | Your unique profile chat ID or targeted channel identifier. | @userinfobot on Telegram |
## 🚀 Repository Sync Commands
Run these inside your Codespaces terminal to commit your structural adjustments to your branch instantly:
```bash
git add .
git commit -m "chore: structure architecture layouts, ignore filters, and action runner pipelines"
git push origin main

```
```

```
