/* Reads vegetable prices that are VISIBLE on the page you are browsing (no automatic browsing). */
(function(){
  const BAD = /(chips|powder|paste|ketchup|sauce|frozen|pickle|achar|dried|flakes|puree|oil|soup|masala|seed|juice|crisps|fries|namkeen|bhujia|dehydrated|cut |chopped|diced|mix|combo|organic|exotic box|kit|halwa|cake|bread|noodle|pizza|tikki|nuggets)/i;
  const WT = /(\d+(?:\.\d+)?)\s*(kg|kgs|g|gm|gms|gram|grams|pc|pcs|piece|pieces|unit|units|bunch|nos?)\b/i;
  const site = location.hostname.includes("zepto") ? "Zepto" : "Blinkit";

  function packToBase(unit, pack, qty, qu){
    // returns multiplier: price_per_our_unit = price / factor
    qu = qu.toLowerCase();
    const grams = /^(g|gm|gms|gram|grams)$/.test(qu) ? qty : /^kgs?$/.test(qu) ? qty*1000 : null;
    const pcs = /^(pc|pcs|piece|pieces|unit|units|nos?)$/.test(qu) ? qty : null;
    if(unit==="kg"){ return grams ? grams/1000 : null; }
    if(unit==="bunch"){ if(/bunch/.test(qu)) return qty; return grams ? grams/100 : (pcs||null); } // 1 bunch ≈ 100 g
    if(unit==="pc"){ return pcs || (grams ? 1 : null); }
    if(unit==="dozen"){ return pcs ? pcs/12 : null; }
    if(unit==="pack"){ const m=(pack||"").match(WT); if(!m) return pcs||null;
      const ourG = /k/i.test(m[2]) ? +m[1]*1000 : /p/i.test(m[2]) ? null : +m[1];
      if(ourG && grams) return grams/ourG; const ourP = /p/i.test(m[2]) ? +m[1] : null; if(ourP && pcs) return pcs/ourP; return null; }
    return null;
  }
  function findItem(text){
    const t = " "+text.toLowerCase().replace(/[()]/g," ")+" ";
    if(BAD.test(t)) return null;
    let best=null, bestLen=0;
    for(const it of self.GSB_ITEMS){ for(const a of it.alias){ if(t.includes(" "+a+" ") && a.length>bestLen){ best=it; bestLen=a.length; } } }
    return best;
  }
  function scan(){
    const found = {};
    const priceEls = [...document.querySelectorAll("body *")].filter(el => el.children.length===0 && /^\s*₹\s?\d+(\.\d+)?\s*$/.test(el.textContent));
    const seen = new Set();
    for(const pe of priceEls){
      const st = getComputedStyle(pe); if(/line-through/.test(st.textDecorationLine||st.textDecoration)) continue;
      let card = pe;
      for(let i=0;i<8 && card;i++){ card = card.parentElement; if(!card) break; const tx = card.innerText||""; if(tx.length>15 && WT.test(tx) && tx.length<400) break; }
      if(!card || seen.has(card)) continue; seen.add(card);
      const tx = card.innerText||""; if(tx.length>400) continue;
      const it = findItem(tx.split("\n").slice(0,6).join(" ")); if(!it) continue;
      const w = tx.match(WT); if(!w) continue;
      const price = parseFloat(pe.textContent.replace(/[^\d.]/g,"")); if(!(price>0)) continue;
      const f = packToBase(it.unit, it.pack, parseFloat(w[1]), w[2]); if(!f) continue;
      const per = Math.round(price / f);
      const title = (tx.split("\n").find(l=>findItem(l))||it.name).trim().slice(0,60);
      if(!found[it.id] || per < found[it.id].per) found[it.id] = { id:it.id, name:it.name, per, unit:it.unit, seen:`${title} · ${w[0]} · ₹${price}`, site };
    }
    return found;
  }
  let timer=null;
  async function autoScan(){
    const { gsbOn } = await chrome.storage.local.get("gsbOn"); if(gsbOn===false) return;
    const f = scan(); if(!Object.keys(f).length) return;
    const { gsbPrices={}, gsbCompare={} } = await chrome.storage.local.get(["gsbPrices","gsbCompare"]);
    for(const id in f){
      const old=gsbPrices[id]; if(!old || old.site!==f[id].site || f[id].per<old.per || Date.now()-(old.t||0)>6*3600e3) gsbPrices[id]={...f[id], t:Date.now()};
      // Keep BOTH sites' latest reading separately too, for side-by-side comparison.
      if(!gsbCompare[id]) gsbCompare[id] = { name:f[id].name, unit:f[id].unit };
      gsbCompare[id][f[id].site] = { per:f[id].per, seen:f[id].seen, t:Date.now() };
    }
    await chrome.storage.local.set({ gsbPrices, gsbCompare });
  }
  const run = () => { clearTimeout(timer); timer=setTimeout(autoScan, 1200); };
  new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
  run();
  chrome.runtime.onMessage.addListener((msg,_,reply)=>{ if(msg==="gsb-scan"){ autoScan().then(()=>reply(true)); return true; } });
})();
