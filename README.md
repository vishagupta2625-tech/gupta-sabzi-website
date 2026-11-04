# 🥬 Gupta Sabzi Bhandar — Website

Roz subah mandi se taaza sabzi, online apps se sasta. Kandivali West.

---

## 📝 Roz daam kaise badlein (2 minute)

1. VS Code mein `data/products.js` kholo
2. Jis sabzi ka daam badalna hai, uska **`buy:`** (mandi ka khareed daam) badlo
   ```js
   {id:1, name:"Potato", ... buy:100, mrp:130, inStock:true, unit:"kg"},
   ```
   - `buy` = aapne mandi mein kitne mein liya → website **apne-aap munafa jod ke** daam dikhayegi (₹100 → ₹125)
   - `mrp` = Blinkit/Zepto ka daam (comparison ke liye, `0` = mat dikhao)
   - `inStock:false` = "Out of stock" dikhega
   - Munafa % file ke upar `window.MARGIN` mein hai (Sabzi 25%, Patta sabzi 30%, Exotic 30%)
   - Kisi ek sabzi ka alag munafa: `margin:35,` jod do
3. Upar `window.PRICES_UPDATED = "2026-11-05";` mein **aaj ki date** daalo
4. **Cmd + S** (save)
5. ✅ Website 1–2 minute mein apne-aap update ho jaayegi

> ⚠️ Sirf numbers aur `true`/`false` badlein. Comma `,` aur quotes `"` mat hatana.
> Galti hui to website pe laal sandesh aayega — file mein comma check karo.

---

## 📁 Files

| File | Kya hai |
|---|---|
| `data/products.js` | **Roz ke daam aur stock** ← sabse zyada yahi badlegi |
| `data/shop.js` | Dukaan ka naam, number, UPI, time, delivery charge |
| `data/reviews.js` | Customer reviews |
| `img/` | Sabziyon ki photos (`1.webp` = Potato, id ke hisaab se) |
| `index.html` | Website ka code (isse mat chhedo) |

---

## 🚀 Ek baar ka setup (pehli baar)

### 1. GitHub account aur repository
1. https://github.com pe free account banao
2. **New repository** → naam: `gupta-sabzi` → **Public** → Create

### 2. VS Code se GitHub pe daalo
1. `papa/gupta-sabzi-website` folder mein **`gupta-sabzi.code-workspace`** pe double-click karo (VS Code khulega). "Install recommended extensions" aaye to **Install** dabao
2. Left side **Source Control** icon (teen gol wala) → **Publish to GitHub** → `gupta-sabzi` → Public
3. GitHub login maangega — login kar lo

### 3. Website live karo (GitHub Pages — free)
1. GitHub pe repository → **Settings → Pages**
2. Source: **Deploy from a branch** → Branch: **main** → folder **/ (root)** → Save
3. 1–2 minute baad link milega: `https://<aapka-username>.github.io/gupta-sabzi/`
4. Ye link `data/shop.js` mein `siteUrl:` mein daal do

### 4. Save karte hi automatic update (GitDoc)
1. VS Code mein **Extensions** (Cmd+Shift+X) → `GitDoc` search → **Install**
2. Bas! Ab `products.js` save karte hi 3 second mein GitHub pe chala jaayega,
   aur website 1–2 minute mein update ho jaayegi.

GitDoc nahi chahiye? To save ke baad **Source Control → Commit → Sync** dabao (settings mein Sync apne-aap hota hai).

---

## 👀 Website apne computer pe dekhna
`index.html` pe right-click → **Open with Live Server**

## 🔐 Shop admin page
Logo pe 5 baar tap → daam check karne aur "Aaj ke daam" WhatsApp message copy karne ke liye.

---

## 🧩 Blinkit / Zepto ke daam apne-aap (Chrome Extension)

### Ek baar install karo
1. Chrome mein `chrome://extensions` kholo
2. Upar daayein **Developer mode** ON karo
3. **Load unpacked** → `papa/gupta-sabzi-website/chrome-extension` folder chuno
4. 🧩 puzzle icon → **Gupta Sabzi – Apps Prices** ko 📌 pin karo

### Hafte mein ek baar
1. Blinkit kholo (apna Kandivali ka address set ho) → **"vegetables"** search karo, neeche tak scroll karo
2. Extension icon dabao → daam list mein dikhenge (Auto-read **ON** rahe)
3. **📋 Copy for VS Code** dabao
4. VS Code mein `data/apps-prices.js` kholo → **Cmd+A → Cmd+V → Cmd+S**
5. Website pe kaata hua daam (Blinkit ka) apne-aap update ✅
