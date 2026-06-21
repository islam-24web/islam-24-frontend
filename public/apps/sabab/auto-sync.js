import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9QhUxk2JJ8tGKx-YdSLtYEwFT0CU6M1o",
  authDomain: "firdaws-c4a70.firebaseapp.com",
  projectId: "firdaws-c4a70",
  storageBucket: "firdaws-c4a70.firebasestorage.app",
  messagingSenderId: "583826651133",
  appId: "1:583826651133:web:bdf9d408d8a0717a25cb94",
};

const DB_NAME = "onepathFocusLock";
const STORES = ["missions", "ideas", "dailyLogs", "focusSessions", "settings"];
const COLLECTION = "sabab_sync";
const LAST_HASH_KEY = "sabab:auto-sync:last-hash";
const LAST_PUSH_KEY = "sabab:auto-sync:last-push-at";
const MIN_PUSH_INTERVAL_MS = 8_000;
const IDLE_PUSH_DELAY_MS = 3_000;
const PERIODIC_CHECK_MS = 10_000;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

let currentUser = null;
let syncTimer = null;
let inFlight = false;
let pending = false;
let lastAttemptAt = 0;
let pulledOnce = false;
let internalWriteDepth = 0;

function clean(value) {
  return JSON.parse(JSON.stringify(value));
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onerror = () => reject(request.error || new Error("Could not open Sabab database."));
    request.onsuccess = () => resolve(request.result);
  });
}

function readStore(db, storeName) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) {
      resolve([]);
      return;
    }

    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    request.onerror = () => reject(request.error || new Error(`Could not read ${storeName}.`));
    request.onsuccess = () => resolve(request.result || []);
  });
}

function putAll(db, storeName, rows) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) {
      resolve();
      return;
    }

    internalWriteDepth += 1;
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.clear();
    for (const row of rows || []) store.put(row);
    transaction.oncomplete = () => {
      internalWriteDepth = Math.max(0, internalWriteDepth - 1);
      resolve();
    };
    transaction.onerror = () => {
      internalWriteDepth = Math.max(0, internalWriteDepth - 1);
      reject(transaction.error || new Error(`Could not write ${storeName}.`));
    };
  });
}

async function exportSababData() {
  const db = await openDatabase();
  try {
    const [missions, ideas, dailyLogs, focusSessions, settings] = await Promise.all(
      STORES.map((storeName) => readStore(db, storeName))
    );

    return clean({
      missions,
      ideas,
      dailyLogs,
      focusSessions,
      settings,
    });
  } finally {
    db.close();
  }
}

function getMainSettings(data) {
  return (data.settings || []).find((item) => item && item.id === "main") || null;
}

function localRecordCount(data) {
  return (
    (data.missions || []).length +
    (data.ideas || []).length +
    (data.dailyLogs || []).length +
    (data.focusSessions || []).length
  );
}

function timeValue(value) {
  const parsed = value ? Date.parse(value) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

async function updateSyncSettings(fields) {
  const db = await openDatabase();
  try {
    if (!db.objectStoreNames.contains("settings")) return;
    await new Promise((resolve, reject) => {
      internalWriteDepth += 1;
      const transaction = db.transaction("settings", "readwrite");
      const store = transaction.objectStore("settings");
      const getRequest = store.get("main");
      getRequest.onerror = () => {
        internalWriteDepth = Math.max(0, internalWriteDepth - 1);
        reject(getRequest.error || new Error("Could not read settings."));
      };
      getRequest.onsuccess = () => {
        const current = getRequest.result || { id: "main" };
        store.put({ ...current, ...fields });
      };
      transaction.oncomplete = () => {
        internalWriteDepth = Math.max(0, internalWriteDepth - 1);
        resolve();
      };
      transaction.onerror = () => {
        internalWriteDepth = Math.max(0, internalWriteDepth - 1);
        reject(transaction.error || new Error("Could not update settings."));
      };
    });
  } finally {
    db.close();
  }
}

async function replaceLocalData(data) {
  const db = await openDatabase();
  try {
    await Promise.all([
      putAll(db, "missions", data.missions || []),
      putAll(db, "ideas", data.ideas || []),
      putAll(db, "dailyLogs", data.dailyLogs || []),
      putAll(db, "focusSessions", data.focusSessions || []),
      putAll(db, "settings", data.settings || []),
    ]);
  } finally {
    db.close();
  }
}

async function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function pullIfRemoteIsNewer() {
  if (!currentUser || pulledOnce) return;

  const snapshot = await getDoc(doc(firestore, COLLECTION, currentUser.uid));
  pulledOnce = true;
  if (!snapshot.exists()) return;

  const remote = snapshot.data();
  if (!remote || !remote.data) return;

  const local = await exportSababData();
  const localSettings = getMainSettings(local);
  const localSyncTime = Math.max(
    timeValue(localSettings?.googleSyncLastFileModifiedAt),
    timeValue(localStorage.getItem(LAST_PUSH_KEY))
  );
  const remoteTime = timeValue(remote.deviceSavedAt || remote.data.exportedAt);
  const shouldPull = localRecordCount(local) === 0 || remoteTime > localSyncTime;

  if (!shouldPull) return;

  const pulledAt = new Date().toISOString();
  const remoteData = clean(remote.data);
  const remoteSettings = getMainSettings(remoteData);
  if (remoteSettings) {
    remoteSettings.googleSyncLastPullAt = pulledAt;
    remoteSettings.googleSyncLastFileModifiedAt = remote.deviceSavedAt || pulledAt;
  } else {
    remoteData.settings = [
      ...(remoteData.settings || []),
      {
        id: "main",
        googleSyncLastPullAt: pulledAt,
        googleSyncLastFileModifiedAt: remote.deviceSavedAt || pulledAt,
      },
    ];
  }

  await replaceLocalData(remoteData);
  const hash = await sha256(JSON.stringify(await exportSababData()));
  localStorage.setItem(LAST_HASH_KEY, hash);
  window.dispatchEvent(new CustomEvent("sabab:auto-sync:pulled", { detail: { modifiedTime: remote.deviceSavedAt } }));
}

function scheduleAutoSync(delay = IDLE_PUSH_DELAY_MS) {
  if (!currentUser) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncNow().catch(() => undefined);
  }, delay);
}

function installIndexedDbWriteObserver() {
  if (!window.IDBObjectStore || window.IDBObjectStore.prototype.__sababAutoSyncPatched) return;

  for (const method of ["add", "put", "delete", "clear"]) {
    const original = window.IDBObjectStore.prototype[method];
    if (typeof original !== "function") continue;

    window.IDBObjectStore.prototype[method] = function (...args) {
      const request = original.apply(this, args);
      if (this.transaction?.db?.name === DB_NAME) {
        request.addEventListener("success", () => {
          if (internalWriteDepth === 0) {
            window.dispatchEvent(new Event("sabab:data-changed"));
            scheduleAutoSync(1_000);
          }
        });
      }
      return request;
    };
  }

  Object.defineProperty(window.IDBObjectStore.prototype, "__sababAutoSyncPatched", {
    value: true,
  });
}

async function syncNow() {
  if (!currentUser || !navigator.onLine) return;

  if (inFlight) {
    pending = true;
    return;
  }

  const elapsed = Date.now() - lastAttemptAt;
  if (elapsed < MIN_PUSH_INTERVAL_MS) {
    scheduleAutoSync(MIN_PUSH_INTERVAL_MS - elapsed);
    return;
  }

  inFlight = true;
  lastAttemptAt = Date.now();

  try {
    await pullIfRemoteIsNewer();

    let data = await exportSababData();
    const hash = await sha256(JSON.stringify(data));
    if (hash === localStorage.getItem(LAST_HASH_KEY)) return;

    const savedAt = new Date().toISOString();
    const mainSettings = getMainSettings(data);
    if (mainSettings) {
      mainSettings.googleSyncLastPushAt = savedAt;
      mainSettings.googleSyncLastFileModifiedAt = savedAt;
    } else {
      data.settings = [
        ...(data.settings || []),
        {
          id: "main",
          googleSyncLastPushAt: savedAt,
          googleSyncLastFileModifiedAt: savedAt,
        },
      ];
    }

    await setDoc(
      doc(firestore, COLLECTION, currentUser.uid),
      {
        app: "sabab-adhd-action-planner",
        syncVersion: 1,
        autoSync: true,
        deviceSavedAt: savedAt,
        updatedAt: serverTimestamp(),
        data: {
          ...data,
          exportedAt: savedAt,
        },
      },
      { merge: true }
    );

    localStorage.setItem(LAST_PUSH_KEY, savedAt);
    await updateSyncSettings({
      googleSyncLastPushAt: savedAt,
      googleSyncLastFileModifiedAt: savedAt,
    });
    data = await exportSababData();
    localStorage.setItem(LAST_HASH_KEY, await sha256(JSON.stringify(data)));
    window.dispatchEvent(new CustomEvent("sabab:auto-sync:pushed", { detail: { modifiedTime: savedAt } }));
  } finally {
    inFlight = false;
    if (pending) {
      pending = false;
      scheduleAutoSync();
    }
  }
}

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  pulledOnce = false;
  if (currentUser) {
    pullIfRemoteIsNewer()
      .catch(() => undefined)
      .finally(() => scheduleAutoSync(1_000));
  }
});

["input", "change", "click"].forEach((eventName) => {
  window.addEventListener(
    eventName,
    () => {
      scheduleAutoSync();
    },
    true
  );
});

window.addEventListener("online", () => scheduleAutoSync(1_000));
window.addEventListener("sabab:data-changed", () => scheduleAutoSync(1_000));
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") scheduleAutoSync(0);
  else scheduleAutoSync(1_000);
});
window.setInterval(() => scheduleAutoSync(0), PERIODIC_CHECK_MS);

window.SababAutoSync = {
  syncNow,
  getLastPushAt: () => localStorage.getItem(LAST_PUSH_KEY),
};

installIndexedDbWriteObserver();
