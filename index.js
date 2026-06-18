const axios = require('axios');

// Configuration pulled securely from GitHub Runner Environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GITHUB_USERNAME = "Dev-Sahad";

async function runMonitor() {
  // Validate presence of critical environment variables before execution
    if (!GITHUB_TOKEN || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error('❌ Error: Missing configuration environment variables!');
            process.exit(1);
              }

                try {
                    console.log('🔄 Querying deep GitHub ecosystem metrics...');
                        
                            // Configure headers according to official GitHub REST v3 API guidelines
                                const config = { 
                                      headers: { 
                                              'Authorization': `token ${GITHUB_TOKEN}`,
                                                      'Accept': 'application/vnd.github.v3+json'
                                                            } 
                                                                };
                                                                    
                                                                        // 1. Fetch core public profile data
                                                                            const userRes = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}`, config);
                                                                                const profile = userRes.data;

                                                                                    // 2. Fetch traffic views for your Profile Repository (Dev-Sahad/Dev-Sahad)
                                                                                        let profileViews = "N/A";
                                                                                            let uniqueVisitors = "N/A";
                                                                                                try {
                                                                                                      const trafficRes = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/traffic/views`, config);
                                                                                                            profileViews = trafficRes.data.count || 0;
                                                                                                                  uniqueVisitors = trafficRes.data.uniques || 0;
                                                                                                                      } catch (e) {
                                                                                                                            profileViews = "No custom profile repo metrics found.";
                                                                                                                                }

                                                                                                                                    // 3. Fetch recent timeline events stream
                                                                                                                                        const eventsRes = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/events`, config);
                                                                                                                                            const events = eventsRes.data || [];

                                                                                                                                                const openIssues = events.filter(e => e.type === 'IssuesEvent' && e.payload.action === 'opened').length;
                                                                                                                                                    const openedPRs = events.filter(e => e.type === 'PullRequestEvent' && e.payload.action === 'opened').length;
                                                                                                                                                        
                                                                                                                                                            // Evaluate Sponsorship State Channels
                                                                                                                                                                const sponsorEvent = events.find(e => e.type === 'SponsorshipEvent');
                                                                                                                                                                    let sponsorAlertStr = "No new changes detected.";
                                                                                                                                                                        if (sponsorEvent) {
                                                                                                                                                                              const action = sponsorEvent.payload.action;
                                                                                                                                                                                    const tier = sponsorEvent.payload.sponsorship.tier.name;
                                                                                                                                                                                          sponsorAlertStr = `🚨 *EMERGENCY SPONSORS UPDATE:* A tier was *${action}* (${tier})!`;
                                                                                                                                                                                              }

                                                                                                                                                                                                  // 4. Fetch the execution state of current workflow runners
                                                                                                                                                                                                      let deployStatusStr = "✅ Systems nominal";
                                                                                                                                                                                                          try {
                                                                                                                                                                                                                const runsRes = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/github-monitor/actions/runs?per_page=1`, config);
                                                                                                                                                                                                                      if (runsRes.data.workflow_runs && runsRes.data.workflow_runs.length > 0) {
                                                                                                                                                                                                                              const latestRun = runsRes.data.workflow_runs[0];
                                                                                                                                                                                                                                      deployStatusStr = latestRun.conclusion === 'success' 
                                                                                                                                                                                                                                                ? `✅ Deploy Success (${latestRun.name})` 
                                                                                                                                                                                                                                                          : `⚠️ Build Status: ${latestRun.conclusion || 'Pending'} (${latestRun.name})`;
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                    } catch (e) {
                                                                                                                                                                                                                                                                          deployStatusStr = "No active build runners detected.";
                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                  // 5. Build clean, structural markdown message layout
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

                                                                                                                                                                                                                                                                                              // 6. Dispatch telemetry packet directly to the Telegram client interface
                                                                                                                                                                                                                                                                                                  await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                                                                                                                                                                                                                                                                                        chat_id: TELEGRAM_CHAT_ID,
                                                                                                                                                                                                                                                                                                              text: message,
                                                                                                                                                                                                                                                                                                                    parse_mode: 'Markdown'
                                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                            console.log('✅ Advanced telemetry packet successfully sent to Telegram.');
                                                                                                                                                                                                                                                                                                                                process.exit(0);
                                                                                                                                                                                                                                                                                                                                  } catch (error) {
                                                                                                                                                                                                                                                                                                                                      if (error.response) {
                                                                                                                                                                                                                                                                                                                                            console.error(`❌ Monitor pipeline failure (Status ${error.response.status}):`, error.response.data.message || error.message);
                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                      console.error('❌ Monitor telemetry pipeline failure:', error.message);
                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                              process.exit(1);
                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                                                                                runMonitor();
                                                                                                                                                                                                                                                                                                                                                                