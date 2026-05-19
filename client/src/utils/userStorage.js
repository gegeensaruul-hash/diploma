const readCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const currentUserStoragePrefix = () => {
  const user = readCurrentUser();
  const id = user?.id || user?._id || user?.email || "guest";
  return `user:${String(id)}:`;
};

export const userKey = (key) => `${currentUserStoragePrefix()}${key}`;

export const getUserStore = (key, fallback) => {
  try {
    const stored = localStorage.getItem(userKey(key));
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export const setUserStore = (key, value) => {
  try {
    localStorage.setItem(userKey(key), JSON.stringify(value));
  } catch {}
};

export const getUserString = (key, fallback = "") => {
  try {
    return localStorage.getItem(userKey(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export const setUserString = (key, value) => {
  try {
    localStorage.setItem(userKey(key), String(value));
  } catch {}
};
