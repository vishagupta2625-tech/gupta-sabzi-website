/* Drives the "Compare All" automation: opens one search tab at a time on
   Blinkit / Zepto, reads the price (content.js does that), then moves on.
   Runs when you press "Compare All" in the popup, OR automatically every
   morning at 5:30 AM (Mac/Chrome must be on + awake at that time). */
importScripts("products-map.js");

function buildQueue(){
  const q = [];
  for (const it of self.GSB_ITEMS) {
    q.push({ site: "Blinkit", term: it.name, id: it.id });
    q.push({ site: "Zepto", term: it.name, id: it.id });
  }
  return q;
}

function csvCell(v){ v = String(v==null?"":v); return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; }

async function autoExportCsv(){
  const { gsbCompare = {} } = await chrome.storage.local.get("gsbCompare");
  const rows = Object.values(gsbCompare).sort((a,b)=>a.name.localeCompare(b.name));
  if (!rows.length) return;
  const header = ["Product","Zepto","Blinkit","Cheapest"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows){
    const z = r.Zepto, b = r.Blinkit;
    let win = "—";
    if (z && b) win = z.per<b.per ? "Zepto" : b.per<z.per ? "Blinkit" : "Same";
    else if (z) win = "Zepto"; else if (b) win = "Blinkit";
    lines.push([r.name, z?`₹${z.per}`:"", b?`₹${b.per}`:"", win].map(csvCell).join(","));
  }
  const csv = "\uFEFF" + lines.join("\r\n");
  const url = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  const d = new Date().toISOString().slice(0,10);
  try {
    await chrome.downloads.download({ url, filename: `gupta-sabzi-price-compare-auto-${d}.csv`, saveAs: false, conflictAction: "overwrite" });
  } catch(e) { /* ignore — popup export still works manually */ }
}

function nextFiveThirtyAM(){
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 30, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime();
}
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("gsb-daily-530am", { when: nextFiveThirtyAM(), periodInMinutes: 24*60 });
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("gsb-daily-530am", { when: nextFiveThirtyAM(), periodInMinutes: 24*60 });
});
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "gsb-daily-530am") return;
  const { gsbRunning } = await chrome.storage.local.get("gsbRunning");
  if (gsbRunning) return; // already running, skip
  const queue = buildQueue();
  await chrome.storage.local.set({ gsbQueue: queue, gsbRunning: true, gsbRunStatus: "Roz subah ka auto-update shuru…", gsbAutoRun: true });
  openCurrentTask();
});

function searchUrl(site, term){
  const q = encodeURIComponent(term);
  return site === "Blinkit" ? `https://blinkit.com/s/?q=${q}` : `https://www.zepto.com/search?query=${q}`;
}

async function openCurrentTask(){
  const { gsbQueue = [], gsbRunTabId = null, gsbRunning = false } = await chrome.storage.local.get(["gsbQueue", "gsbRunTabId", "gsbRunning"]);
  if (!gsbRunning) return;

  if (!gsbQueue.length){
    if (gsbRunTabId) { try { await chrome.tabs.remove(gsbRunTabId); } catch(e){} }
    const { gsbAutoRun } = await chrome.storage.local.get("gsbAutoRun");
    if (gsbAutoRun) {
      await autoExportCsv();
      await chrome.storage.local.set({ gsbRunning: false, gsbRunTabId: null, gsbAutoRun: false, gsbRunStatus: "Aaj ka auto-update CSV ban gayi ✓ (Downloads folder)" });
    } else {
      await chrome.storage.local.set({ gsbRunning: false, gsbRunTabId: null, gsbRunStatus: "Done ✓ — Export to Excel dabao" });
    }
    return;
  }

  const task = gsbQueue[0];
  await chrome.storage.local.set({ gsbRunStatus: `${task.site}: "${task.term}" padh raha hoon… (${gsbQueue.length} baaki)` });
  const url = searchUrl(task.site, task.term);

  try {
    if (gsbRunTabId) {
      await chrome.tabs.update(gsbRunTabId, { url });
      return;
    }
  } catch (e) { /* tab no longer exists, fall through and recreate */ }

  const tab = await chrome.tabs.create({ url, active: false });
  await chrome.storage.local.set({ gsbRunTabId: tab.id });
}

chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  const { gsbRunTabId, gsbRunning } = await chrome.storage.local.get(["gsbRunTabId", "gsbRunning"]);
  if (!gsbRunning || tabId !== gsbRunTabId || info.status !== "complete") return;

  // Give the single-page app a moment to render results after "load" fires.
  setTimeout(async () => {
    try { await chrome.tabs.sendMessage(tabId, "gsb-scan"); } catch (e) { /* content script not ready / page blocked */ }
    setTimeout(async () => {
      const { gsbRunning: stillRunning, gsbQueue = [] } = await chrome.storage.local.get(["gsbRunning", "gsbQueue"]);
      if (!stillRunning) return;
      await chrome.storage.local.set({ gsbQueue: gsbQueue.slice(1) });
      openCurrentTask();
    }, 1800);
  }, 1600);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "gsb-start") {
    chrome.storage.local.set({ gsbQueue: msg.queue, gsbRunning: true, gsbRunStatus: "Shuru kar raha hoon…" })
      .then(openCurrentTask);
  }
  if (msg && msg.type === "gsb-stop") {
    chrome.storage.local.get("gsbRunTabId").then(({ gsbRunTabId }) => {
      chrome.storage.local.set({ gsbRunning: false, gsbRunStatus: "Roka gaya" });
      if (gsbRunTabId) chrome.tabs.remove(gsbRunTabId).catch(() => {});
    });
  }
});
