// ✅ sessionStorage TTL Cache Utility
// Cache expire hoti hai 15 min baad — stale data nahi dikhega

const TTL_MS = 15 * 60 * 1000; // 15 minutes

export const getCached = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > TTL_MS) {
      sessionStorage.removeItem(key); // Expired — delete karo
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

export const setCached = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // sessionStorage full ho to silently fail
  }
};
