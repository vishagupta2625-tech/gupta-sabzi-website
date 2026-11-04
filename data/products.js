/* =====================================================================
   GUPTA SABZI BHANDAR — DAILY PRICES  (Roz ke daam yahan badlein)
   ---------------------------------------------------------------------
   buy     = aapne MANDI mein kitne mein khareeda (per kg / per pc / per bunch)
             -> website apne-aap MUNAFA jod ke bechne ka daam banayegi
   mrp     = Blinkit / Zepto ka daam (comparison ke liye). 0 = mat dikhao
   inStock = true  -> website pe dikhega
             false -> "Out of stock" dikhega
   margin  = (optional) kisi ek sabzi ka alag munafa %, jaise  margin:35,

   Example: buy:100  + 25% munafa  ->  website pe ₹125

   Sirf NUMBERS aur true/false badlein. Comma (,) aur quotes ("") mat hatana.
   Save karein (Cmd+S) -> website 1-2 minute mein apne-aap update.
   ===================================================================== */

window.PRICES_UPDATED = "2026-11-04";   // aaj ki date daalein, jaise "2026-11-05"

// 👉 MUNAFA % (har category ka). Badlo to saari sabziyon ka daam badal jayega
window.MARGIN = {
  veg:    25,   // Fresh Vegetables (aloo, pyaz, bhindi...)
  leafy:  30,   // Patta sabzi (dhaniya, palak, methi...) — zyada kharab hoti hai
  exotic: 30    // Exotic (mushroom, broccoli...)
};

window.PRODUCTS = [
  // ---------- Fresh Vegetables ----------
  {id:1,  cat:"veg", name:"Potato",            hn:"Aloo",           e:"🥔", buy:100, mrp:100, inStock:true,  unit:"kg"},
  {id:2,  cat:"veg", name:"Onion",             hn:"Pyaz",           e:"🧅", buy:19, mrp:34, inStock:true,  unit:"kg"},
  {id:3,  cat:"veg", name:"Tomato",            hn:"Tamatar",        e:"🍅", buy:24, mrp:48, inStock:false,  unit:"kg"},
  {id:4,  cat:"veg", name:"Lady Finger",       hn:"Bhindi",         e:"🫛", buy:32, mrp:64, inStock:true,  unit:"kg"},
  {id:5,  cat:"veg", name:"Cauliflower",       hn:"Phool Gobhi",    e:"🥦", buy:24, mrp:45, inStock:true,  unit:"pc", season:true},
  {id:6,  cat:"veg", name:"Carrot",            hn:"Gajar",          e:"🥕", buy:32, mrp:60, inStock:true,  unit:"kg", season:true},
  {id:7,  cat:"veg", name:"Brinjal",           hn:"Baingan",        e:"🍆", buy:29, mrp:55, inStock:true,  unit:"kg"},
  {id:8,  cat:"veg", name:"Cucumber",          hn:"Kheera",         e:"🥒", buy:24, mrp:48, inStock:true,  unit:"kg"},
  {id:9,  cat:"veg", name:"Capsicum",          hn:"Shimla Mirch",   e:"🫑", buy:48, mrp:90, inStock:true,  unit:"kg"},
  {id:10, cat:"veg", name:"Green Chilli",      hn:"Hari Mirch",     e:"🌶️", buy:48, mrp:100, inStock:true, unit:"kg"},
  {id:11, cat:"veg", name:"Ginger",            hn:"Adrak",          e:"🫚", buy:80, mrp:160, inStock:true, unit:"kg"},
  {id:12, cat:"veg", name:"Garlic",            hn:"Lehsun",         e:"🧄", buy:128, mrp:240, inStock:true, unit:"kg"},
  {id:13, cat:"veg", name:"Bottle Gourd",      hn:"Lauki",          e:"🥒", buy:20, mrp:40, inStock:true,  unit:"pc"},
  {id:14, cat:"veg", name:"Green Peas",        hn:"Hari Matar",     e:"🫛", buy:48, mrp:95, inStock:true,  unit:"kg", season:true},
  {id:15, cat:"veg", name:"Bitter Gourd",      hn:"Karela",         e:"🥒", buy:40, mrp:80, inStock:true,  unit:"kg"},
  {id:16, cat:"veg", name:"Ridge Gourd",       hn:"Turai",          e:"🥒", buy:36, mrp:70, inStock:true,  unit:"kg"},
  {id:17, cat:"veg", name:"Pumpkin",           hn:"Kaddu / Sitaphal",e:"🎃", buy:24, mrp:48, inStock:true,  unit:"kg"},
  {id:18, cat:"veg", name:"Radish",            hn:"Mooli",          e:"🥕", buy:24, mrp:45, inStock:true,  unit:"kg", season:true},
  {id:19, cat:"veg", name:"Sweet Potato",      hn:"Shakarkandi",    e:"🍠", buy:36, mrp:70, inStock:true,  unit:"kg", season:true},
  {id:40, cat:"veg", name:"Beetroot",          hn:"Chukandar",      e:"🍠", buy:32, mrp:60, inStock:true,  unit:"kg", season:true},
  {id:41, cat:"veg", name:"French Beans",      hn:"Beans / Faliyan",e:"🫛", buy:48, mrp:90, inStock:true,  unit:"kg"},
  {id:42, cat:"veg", name:"Cluster Beans",     hn:"Gawar Phali",    e:"🫛", buy:44, mrp:85, inStock:true,  unit:"kg"},
  {id:43, cat:"veg", name:"Sweet Corn",        hn:"Bhutta",         e:"🌽", buy:16, mrp:35, inStock:true,  unit:"pc"},
  {id:44, cat:"veg", name:"Colocasia",         hn:"Arbi",           e:"🥔", buy:40, mrp:75, inStock:true,  unit:"kg"},
  {id:45, cat:"veg", name:"Raw Banana",        hn:"Kaccha Kela",    e:"🍌", buy:32, mrp:60, inStock:true,  unit:"dozen"},
  {id:46, cat:"veg", name:"Drumstick",         hn:"Sahjan",         e:"🥢", buy:64, mrp:120, inStock:true, unit:"kg"},
  {id:47, cat:"veg", name:"Lemon",             hn:"Nimbu",          e:"🍋", buy:4, mrp:10, inStock:true,  unit:"pc"},
  // ---------- Leafy Greens & Herbs ----------
  {id:20, cat:"leafy", name:"Coriander",       hn:"Dhaniya",        e:"🌿", buy:8, mrp:20, inStock:true,  unit:"bunch"},
  {id:21, cat:"leafy", name:"Spinach",         hn:"Palak",          e:"🥬", buy:12, mrp:30, inStock:true,  unit:"bunch", season:true},
  {id:22, cat:"leafy", name:"Mint",            hn:"Pudina",         e:"🌱", buy:8, mrp:20, inStock:true,  unit:"bunch"},
  {id:23, cat:"leafy", name:"Fenugreek",       hn:"Methi",          e:"🍃", buy:12, mrp:28, inStock:true,  unit:"bunch", season:true},
  {id:24, cat:"leafy", name:"Cabbage",         hn:"Patta Gobhi",    e:"🥬", buy:19, mrp:40, inStock:true,  unit:"pc"},
  {id:25, cat:"leafy", name:"Spring Onion",    hn:"Hara Pyaz",      e:"🧅", buy:12, mrp:25, inStock:true,  unit:"bunch", season:true},
  {id:26, cat:"leafy", name:"Curry Leaves",    hn:"Kadi Patta",     e:"🍃", buy:4, mrp:10, inStock:true,  unit:"bunch"},
  {id:27, cat:"leafy", name:"Mustard Greens",  hn:"Sarson ka Saag", e:"🥬", buy:15, mrp:35, inStock:true,  unit:"bunch", season:true},
  {id:28, cat:"leafy", name:"Dill Leaves",     hn:"Soya Saag",      e:"🌿", buy:12, mrp:25, inStock:true,  unit:"bunch", season:true},
  {id:29, cat:"leafy", name:"Bathua Greens",   hn:"Bathua",         e:"🌱", buy:12, mrp:25, inStock:true,  unit:"bunch", season:true},
  // ---------- Exotic Vegetables ----------
  {id:60, cat:"exotic", name:"Broccoli",       hn:"Hari Gobhi",     e:"🥦", buy:35, mrp:70, inStock:true,  unit:"pc"},
  {id:61, cat:"exotic", name:"Button Mushroom",hn:"Khumbi",         e:"🍄", buy:31, mrp:60, inStock:true,  unit:"pack", pack:"200 g"},
  {id:62, cat:"exotic", name:"Zucchini",       hn:"Zucchini",       e:"🥒", buy:38, mrp:80, inStock:true,  unit:"pc"},
  {id:63, cat:"exotic", name:"Baby Corn",      hn:"Chhota Bhutta",  e:"🌽", buy:27, mrp:55, inStock:true,  unit:"pack", pack:"200 g"},
  {id:64, cat:"exotic", name:"Cherry Tomato",  hn:"Chhote Tamatar", e:"🍅", buy:35, mrp:70, inStock:true,  unit:"pack", pack:"200 g"},
  {id:65, cat:"exotic", name:"Red & Yellow Bell Pepper",hn:"Laal-Peeli Shimla Mirch",e:"🫑",buy:46, mrp:95, inStock:true,unit:"pack",pack:"2 pc"},
  {id:66, cat:"exotic", name:"Iceberg Lettuce",hn:"Salad Patta",    e:"🥬", buy:38, mrp:80, inStock:true,  unit:"pc"},
];
