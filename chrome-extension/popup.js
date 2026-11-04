const $=id=>document.getElementById(id);
const per={kg:"/kg",pc:"/pc",bunch:"/bunch",dozen:"/dozen",pack:"/pack"};
async function show(){
  const {gsbOn=true,gsbPrices={}} = await chrome.storage.local.get(["gsbOn","gsbPrices"]);
  $("on").checked = gsbOn; $("st").textContent = gsbOn ? "ON – pages you open are read" : "OFF";
  const rows = Object.values(gsbPrices).sort((a,b)=>a.id-b.id);
  $("list").innerHTML = rows.length ? rows.map(r=>`<div class="it"><b>${r.name}</b><span>₹${r.per}${per[r.unit]||""}</span><small>${r.site}: ${r.seen.replace(/</g,"&lt;")}</small></div>`).join("")
    : `<div class="empty">Abhi koi daam nahi mila.<br>Blinkit pe <b>"vegetables"</b> ya <b>"potato"</b> search karo aur thoda scroll karo.</div>`;
  $("copy").disabled = !rows.length;
}
$("on").onchange = async e => { await chrome.storage.local.set({gsbOn:e.target.checked}); show(); };
$("clear").onclick = async () => { await chrome.storage.local.set({gsbPrices:{}}); show(); };
$("scan").onclick = async () => { const [t]=await chrome.tabs.query({active:true,currentWindow:true});
  try{ await chrome.tabs.sendMessage(t.id,"gsb-scan"); $("msg").textContent="✓ Page read"; }catch(e){ $("msg").textContent="Blinkit ya Zepto ka page kholo"; } show(); };
$("copy").onclick = async () => {
  const {gsbPrices={}} = await chrome.storage.local.get("gsbPrices");
  const d = new Date().toISOString().slice(0,10);
  const lines = Object.values(gsbPrices).sort((a,b)=>a.id-b.id).map(r=>`  ${r.id}: ${r.per},   // ${r.name} ${per[r.unit]||""} (${r.site})`);
  const txt = `/* Blinkit / Zepto ke daam — Chrome extension se copy kiye (${d}).\n   Ye website pe "mrp" (kaata hua daam) ki jagah dikhenge. */\nwindow.APPS_PRICES_DATE = "${d}";\nwindow.APPS_PRICES = {\n${lines.join("\n")}\n};\n`;
  await navigator.clipboard.writeText(txt);
  $("msg").textContent = "✓ Copied! VS Code mein data/apps-prices.js kholo → Cmd+A → Cmd+V → Cmd+S";
};
chrome.storage.onChanged.addListener(show); show();
