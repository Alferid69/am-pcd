/**
 * Self-ping mechanism to keep Render free tier web services awake.
 * Render free tier instances spin down after 15 minutes of inactivity.
 * Pinging every 14 minutes keeps the instance active.
 */
function initSelfPing() {
  // Only run in production or if explicitly enabled
  if (process.env.NODE_ENV !== "production" && !process.env.ENABLE_SELF_PING) {
    return;
  }

  const url =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.BACKEND_URL ||
    "https://am-pcd-backend.onrender.com";

  const pingUrl = `${url.replace(/\/+$/, "")}/health`;
  const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

  console.log(`[Self-Ping] Keep-alive active: pinging ${pingUrl} every 14 minutes`);

  setInterval(async () => {
    try {
      const res = await fetch(pingUrl);
      console.log(`[Self-Ping] Ping sent to ${pingUrl} (Status: ${res.status})`);
    } catch (err) {
      console.warn(`[Self-Ping] Warning: Failed to ping ${pingUrl}:`, err.message);
    }
  }, INTERVAL_MS);
}

module.exports = initSelfPing;
