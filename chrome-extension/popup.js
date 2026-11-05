const $=id=>document.getElementById(id);
const per={kg:"/kg",pc:"/pc",bunch:"/bunch",dozen:"/dozen",pack:"/pack"};

function buildQueue(){
  // One Blinkit + one Zepto search per catalog item, cheapest/simplest alias as the search term.
  const q=[];
  for(const it of self.GSB_ITEMS){
    const term = it.name;
    q.push({ site:"Blinkit", term, id:it.id });
    q.push({ site:"Zepto", term, id:it.id });
  }
  return q;
}

function csvCell(v){ v=String(v==null?"":v); return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; }

async function show(){
  const {gsbOn=true,gsbPrices={},gsbCompare={},gsbRunning=false,gsbRunStatus="",gsbQueue=[]} = await chrome.storage.local.get(["gsbOn","gsbPrices","gsbCompare","gsbRunning","gsbRunStatus","gsbQueue"]);
  $("on").checked = gsbOn; $("st").textContent = gsbOn ? "ON – pages you open are read" : "OFF";

  $("runAll").style.display = gsbRunning ? "none" : "block";
  $("stopAll").style.display = gsbRunning ? "block" : "none";
  $("prog").textContent = gsbRunning ? (gsbRunStatus + (gsbQueue.length ? ` — ${gsbQueue.length} baaki` : "")) : (gsbRunStatus||"");

  const rows = Object.entries(gsbCompare).map(([id,v])=>({id:+id,...v})).sort((a,b)=>a.id-b.id);
  if(rows.length){
    const trs = rows.map(r=>{
      const z=r.Zepto, b=r.Blinkit;
      const zv = z?`₹${z.per}`:"—", bv = b?`₹${b.per}`:"—";
      let win="—", zc="", bc="";
      if(z && b){ if(z.per<b.per){win="Zepto";zc="win";} else if(b.per<z.per){win="Blinkit";bc="win";} else win="Same"; }
      else if(z){ win="Zepto"; zc="win"; } else if(b){ win="Blinkit"; bc="win"; }
      return `<tr><td>${r.name}${per[r.unit]||""}</td><td class="${zc}">${zv}</td><td class="${bc}">${bv}</td><td>${win}</td></tr>`;
    }).join("");
    $("list").innerHTML = `<table class="cmp"><thead><tr><th>Product</th><th>Zepto</th><th>Blinkit</th><th>Cheapest</th></tr></thead><tbody>${trs}</tbody></table>`;
  } else {
    $("list").innerHTML = `<div class="empty">Abhi koi daam nahi mila.<br>"⚡ Compare All" dabao, ya Blinkit/Zepto pe khud search karo.</div>`;
  }
  $("copy").disabled = !Object.keys(gsbPrices).length;
  $("exportXl").disabled = !rows.length;
}

$("on").onchange = async e => { await chrome.storage.local.set({gsbOn:e.target.checked}); show(); };
$("clear").onclick = async () => { await chrome.storage.local.set({gsbPrices:{}, gsbCompare:{}}); show(); };
$("scan").onclick = async () => { const [t]=await chrome.tabs.query({active:true,currentWindow:true});
  try{ await chrome.tabs.sendMessage(t.id,"gsb-scan"); $("msg").textContent="✓ Page read"; }catch(e){ $("msg").textContent="Blinkit ya Zepto ka page kholo"; } show(); };

$("runAll").onclick = async () => {
  const queue = buildQueue();
  await chrome.runtime.sendMessage({ type:"gsb-start", queue });
  $("msg").textContent = "Shuru — ye 3-5 minute le sakta hai, tab background mein khulenge.";
  show();
};
$("stopAll").onclick = async () => { await chrome.runtime.sendMessage({ type:"gsb-stop" }); show(); };

$("copy").onclick = async () => {
  const {gsbPrices={}} = await chrome.storage.local.get("gsbPrices");
  const d = new Date().toISOString().slice(0,10);
  const lines = Object.values(gsbPrices).sort((a,b)=>a.id-b.id).map(r=>`  ${r.id}: ${r.per},   // ${r.name} ${per[r.unit]||""} (${r.site})`);
  const txt = `/* Blinkit / Zepto ke daam — Chrome extension se copy kiye (${d}).\n   Ye website pe "mrp" (kaata hua daam) ki jagah dikhenge. */\nwindow.APPS_PRICES_DATE = "${d}";\nwindow.APPS_PRICES = {\n${lines.join("\n")}\n};\n`;
  await navigator.clipboard.writeText(txt);
  $("msg").textContent = "✓ Copied! VS Code mein data/apps-prices.js kholo → Cmd+A → Cmd+V → Cmd+S";
};

$("exportXl").onclick = async () => {
  const {gsbCompare={}} = await chrome.storage.local.get("gsbCompare");
  const rows = Object.values(gsbCompare).sort((a,b)=>a.name.localeCompare(b.name));
  const header = ["Product","Zepto","Blinkit","Cheapest"];
  const lines = [header.map(csvCell).join(",")];
  for(const r of rows){
    const z=r.Zepto, b=r.Blinkit;
    let win = "—";
    if(z && b) win = z.per<b.per ? "Zepto" : b.per<z.per ? "Blinkit" : "Same";
    else if(z) win="Zepto"; else if(b) win="Blinkit";
    lines.push([r.name, z?`₹${z.per}`:"", b?`₹${b.per}`:"", win].map(csvCell).join(","));
  }
  const csv = "﻿" + lines.join("\r\n");
  const blob = new Blob([csv], { type:"text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const d = new Date().toISOString().slice(0,10);
  await chrome.downloads.download({ url, filename:`gupta-sabzi-price-compare-${d}.csv`, saveAs:true });
  $("msg").textContent = "✓ CSV download ho rahi hai — Excel mein khul jaayegi.";
};

chrome.storage.onChanged.addListener(show); show();
