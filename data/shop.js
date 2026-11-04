/* =====================================================================
   DUKAAN KI DETAILS (Shop settings) — zaroorat ho tab hi badlein
   ===================================================================== */

window.SHOP = {
  name: "Gupta Sabzi Bhandar",
  tagline: "Fresh from the mandi, every morning",
  taglineHn: "Roz subah mandi se seedha aapke ghar",
  whatsapp: "919920234119",          // 91 + mobile number (no +)
  phoneDisplay: "+91 99202 34119",
  upi: "9920234119@ybl",
  upiMerchant: false,
  // Razorpay (online payment). Dono bharne ke baad hi "Pay Online" option dikhega.
  razorpayKeyId:  "rzp_live_TwD8J3q3Ke3yK5",   // Razorpay Key ID, jaise "rzp_test_AbC123" (Secret key YAHAN KABHI MAT DAALNA)
  razorpayServer: "https://gupta-sabzi-pay.vishagupta2625.workers.dev",   // Cloudflare Worker ka link, jaise "https://gupta-sabzi-pay.<naam>.workers.dev"   // true karein jab PhonePe/Paytm Business (merchant) UPI ID lagayein
  area: "Kandivali West",
  deliveryRadius: "5 km",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Merwans+Cake+Shop+Mathuradas+Road+Kandivali+West+Mumbai",
  address: "Mathuradas Road, Opp. Merwans Cake Shop, Kandivali West, Mumbai – 400067",
  timing: "6:00 AM – 9:00 PM",
  openHour: 6,      // shop opens (24-hour clock)
  closeHour: 21,    // shop closes (21 = 9 PM)
  siteUrl: "https://vishagupta2625-tech.github.io/gupta-sabzi-website/",
  firstOrderOffer: "First order: FREE coriander + green chilli",   // set to "" to turn off
  freeDeliveryAbove: 199,
  deliveryCharge: 20
};
