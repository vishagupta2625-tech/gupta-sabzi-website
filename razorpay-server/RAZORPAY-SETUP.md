# 💳 Razorpay setup — Gupta Sabzi Bhandar

Website pe "Pay Online (Card / UPI / Netbanking)" option chalu karne ke 3 hisse hain.
Pehle **TEST mode** mein karo (asli paisa nahi katega), sab theek chale tab **LIVE**.

---

## 1️⃣ Razorpay account + keys
1. https://dashboard.razorpay.com pe Sign up (papa ke mobile/email se)
2. Upar toggle **Test Mode** rakho
3. **Account & Settings → API Keys → Generate Key**
4. 2 cheezein milengi — **sambhaal ke rakho**:
   - **Key ID** → `rzp_test_xxxxxxxx` (ye website pe ja sakti hai)
   - **Key Secret** → ⚠️ **kisi ko mat dena, website ya GitHub pe kabhi mat daalna**

## 2️⃣ Cloudflare Worker (free chhota server)
1. https://dash.cloudflare.com pe free account banao
2. **Workers & Pages → Create → Create Worker** → naam: `gupta-sabzi-pay` → **Deploy**
3. **Edit code** → saara code hata ke `razorpay-server/worker.js` ka poora code paste karo → **Deploy**
4. Worker → **Settings → Variables and Secrets → Add**:
   | Name | Value | Type |
   |---|---|---|
   | `RZP_KEY_ID` | `rzp_test_xxxxxxxx` | Text |
   | `RZP_KEY_SECRET` | aapki Key Secret | **Secret** |
   | `ALLOWED_ORIGIN` | `https://vishagupta2625-tech.github.io` | Text |
5. Worker ka link copy karo, jaise `https://gupta-sabzi-pay.xxxx.workers.dev`

## 3️⃣ Website mein jodo
`data/shop.js` mein:
```js
razorpayKeyId:  "rzp_test_xxxxxxxx",
razorpayServer: "https://gupta-sabzi-pay.xxxx.workers.dev",
```
Save → Commit → Sync. 1–2 minute baad cart mein **"Pay Online"** option aa jayega.

## ✅ Test karo (Test mode)
- Card: `4111 1111 1111 1111`, koi bhi future date, CVV `123`, OTP jo bhi maange
- UPI: `success@razorpay`
- Payment ke baad WhatsApp order mein likha aayega: **PAID ONLINE ₹X – Razorpay pay_xxx ✓**
- Razorpay dashboard → **Transactions → Payments** mein bhi dikhega

## 🚀 LIVE karna
1. Razorpay mein **KYC / Activate account** poora karo (PAN, bank account, dukaan ki details) — approval 1–3 din
2. **Live Mode** mein naya Key ID + Secret banao
3. Cloudflare variables mein `RZP_KEY_ID` aur `RZP_KEY_SECRET` live wale daalo
4. `shop.js` mein `razorpayKeyId` live wala (`rzp_live_...`) daalo → Commit → Sync

## ℹ️ Dhyan rakho
- Razorpay har payment pe ~2% fee kaatta hai (UPI pe kam/zero ho sakta hai — dashboard mein dekho)
- Paisa bank mein T+2 din mein aata hai
- Delivery se pehle **Razorpay dashboard / app** mein payment "Captured" dikhe, ye zaroor check karo
