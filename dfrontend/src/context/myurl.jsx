const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const API_URL_USER =
  import.meta.env.VITE_API_URL_USER || "http://127.0.0.1:8000/users";

/** Derive ws(s)://host:port from API URL, or use VITE_WS_URL. */
function getWsBaseUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL.replace(/\/$/, "");
  }
  try {
    const u = new URL(API_URL);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    return u.origin;
  } catch {
    return "ws://127.0.0.1:8000";
  }
}

function normalizeAreaName(areaName) {
  const slug = String(areaName || "general")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "");
  return (slug.slice(0, 100) || "general");
}

function getAreaWsUrl(areaName, token) {
  const area = encodeURIComponent(normalizeAreaName(areaName));
  const base = getWsBaseUrl();
  return `${base}/ws/area/${area}/?token=${encodeURIComponent(token || "")}`;
}

export {
  API_URL,
  API_URL_USER,
  getWsBaseUrl,
  getAreaWsUrl,
  normalizeAreaName,
};
