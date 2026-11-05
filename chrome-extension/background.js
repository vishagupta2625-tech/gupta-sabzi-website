/* Drives the "Compare All" automation: opens one search tab at a time on
   Blinkit / Zepto, reads the price (content.js does that), then moves on.
   Nothing runs unless the person pressed "Compare All" in the popup. */

function searchUrl(site, term){
  const q = encodeURIComponent(term);
  return site === "Blinkit" ? `https://blinkit.com/s/?q=${q}` : `https://www.zepto.com/search?query=${q}`;
}

async function openCurrentTask(){
  const { gsbQueue = [], gsbRunTabId = null, gsbRunning = false } = await chrome.storage.local.get(["gsbQueue", "gsbRunTabId", "gsbRunning"]);
  if (!gsbRunning) return;

  if (!gsbQueue.length){
    if (gsbRunTabId) { try { await chrome.tabs.remove(gsbRunTabId); } catch(e){} }
    await chrome.storage.local.set({ gsbRunning: false, gsbRunTabId: null, gsbRunStatus: "Done ✓ — Export to Excel dabao" });
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
