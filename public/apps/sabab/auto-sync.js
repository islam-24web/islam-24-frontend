import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
const MIN_PUSH_INTERVAL_MS = 15_000;
const IDLE_PUSH_DELAY_MS = 5_000;
const PERIODIC_CHECK_MS = 30_000;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

let currentUser = null;
let syncTimer = null;
let inFlight = false;
let pending = false;
let lastAttemptAt = 0;

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

async function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function scheduleAutoSync(delay = IDLE_PUSH_DELAY_MS) {
  if (!currentUser) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncNow().catch(() => undefined);
  }, delay);
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
    const data = await exportSababData();
    const hash = await sha256(JSON.stringify(data));
    if (hash === localStorage.getItem(LAST_HASH_KEY)) return;

    const savedAt = new Date().toISOString();
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

    localStorage.setItem(LAST_HASH_KEY, hash);
    localStorage.setItem(LAST_PUSH_KEY, savedAt);
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
  if (currentUser) scheduleAutoSync(1_000);
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
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") scheduleAutoSync(0);
});
window.setInterval(() => scheduleAutoSync(0), PERIODIC_CHECK_MS);

window.SababAutoSync = {
  syncNow,
  getLastPushAt: () => localStorage.getItem(LAST_PUSH_KEY),
};
