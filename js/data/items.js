/* ============================================================================
 *  items.js — what each carried thing IS, and what it DOES
 *  --------------------------------------------------------------------------
 *  DATA.itemCat(name)  -> art category (used by art.js for the picture)
 *  DATA.itemInfo(name) -> { title, cat, desc, benefit } for the click popup
 *
 *  Signature gear gets a hand‑written entry (real mechanical benefit). Anything
 *  gained on the road falls through to a category‑based description so every
 *  item you can ever hold has a meaningful card.
 * ========================================================================== */
window.DATA = window.DATA || {};

/* ---- name -> art/mechanics category (keyword rules, order matters) ------ */
DATA.itemCat = function (name) {
  const n = (name || "").toLowerCase();
  if (/matchlock|teppo|teppō|musket|gun/.test(n)) return "gun";
  if (/wakizashi|tant|katana|blade|sword|naginata/.test(n)) return "blade";
  if (/knife/.test(n)) return "knife";
  if (/spear|yari/.test(n)) return "spear";
  if (/sutra|scroll/.test(n)) return "scroll";
  if (/papers|pass|itinerary|permit/.test(n)) return "papers";
  if (/ledger/.test(n)) return "ledger";
  if (/poem|card/.test(n)) return "card";
  if (/seal|token/.test(n)) return "seal";
  if (/crest|mon\b/.test(n)) return "crest";
  if (/cargo/.test(n)) return "cargo";
  if (/gifts/.test(n)) return "gifts";
  if (/provisions/.test(n)) return "provisions";
  if (/rice|sack/.test(n)) return "food";
  if (/bowl/.test(n)) return "bowl";
  if (/herbs|moxa/.test(n)) return "herbs";
  if (/flask|sake|gourd/.test(n)) return "gourd";
  if (/charm|talisman|omamori|ofuda/.test(n)) return "charm";
  if (/wand|gohei/.test(n)) return "wand";
  if (/whetstone|stone/.test(n)) return "stone";
  if (/hook|grappl/.test(n)) return "hook";
  if (/smoke/.test(n)) return "smoke";
  if (/poison|vial/.test(n)) return "vial";
  if (/war fan|gunbai/.test(n)) return "warfan";
  if (/fan/.test(n)) return "fan";
  if (/mask/.test(n)) return "mask";
  if (/purse|coin|payment|capital|winnings|takings|spoils|profit|hidden/.test(n)) return "coin";
  return "bundle";
};

/* ---- hand‑written cards for signature gear ----------------------------- */
DATA.items = {
  "Travel papers": { desc:"Sealed permits stamped by a provincial office, naming you and your business on the road.", benefit:"Opens a guaranteed safe passage through barrier‑gates (sekisho) — the surest slice on the wheel." },
  "Traveler's pass": { desc:"A humbler road‑permit, talked out of a checkpoint captain.", benefit:"Marks you as cleared to travel; smooths later inspections." },
  "Sutra scroll": { desc:"A hand‑copied Buddhist sutra, its ink gone soft with years of prayer.", benefit:"Widens your best outcome in sermons, debates, funeral rites, and the stilling of restless spirits." },
  "Purification wand": { desc:"A haraegushi of white folded streamers, for Shinto rites of cleansing.", benefit:"Unlocks the purification rite to lay a spirit to rest — a near‑certain success where others bleed." },
  "Vial of poison": { desc:"A stoppered vial of a kunoichi's quiet, patient art.", benefit:"Widens the deadly path in shadow‑contracts and lethal commissions." },
  "Smoke bombs": { desc:"Paper‑cased charges that burst into a blinding wall of smoke.", benefit:"Widens clean escapes and infiltrations. Spent when used." },
  "Grappling hook": { desc:"An iron kagi‑nawa on a coil of braided silk rope.", benefit:"Improves climbs, break‑ins, and rooftop escapes." },
  "Clan crest": { desc:"A lacquered mon marking the house whose name you carry.", benefit:"Widens outcomes wherever warrior rank and loyalty carry weight." },
  "Seal of office": { desc:"An official's stamp of rank and command — worth more than any blade at a gate.", benefit:"Commands deference at barrier‑gates, war‑councils, and oath‑takings." },
  "Poem card": { desc:"A perfumed tanzaku card bearing a single courtly verse.", benefit:"Widens your triumph in poetry contests and the salons of the capital." },
  "War fan": { desc:"A solid gunbai signalling fan, carried by those who command.", benefit:"Widens command outcomes on and around the battlefield." },
  "Dance fan": { desc:"A folding sensu, snapped open on the stage to a held breath.", benefit:"Widens performance and quick courtly wit." },
  "Coin purse": { desc:"A string of copper mon and a little hoarded silver.", benefit:"Greases bribes and tolls, and counts toward a Fortune." },
  "Trade ledger": { desc:"A merchant's book of debts, prices, and quiet contacts.", benefit:"Lets you verify a venture before you leap — widens the shrewd choice." },
  "Whetstone": { desc:"A fine water‑stone that draws a mirror edge from good steel.", benefit:"Widens patient, careful craft at the forge." },
  "Sake flask": { desc:"A gourd of strong, cloudy rice wine.", benefit:"Widens drinking contests. Spent when shared." },
  "Sack of rice": { desc:"A measure of rice — food, wage, and currency all at once in this age.", benefit:"Can be shared to win a starving village's love. Spent when given." },
  "Begging bowl": { desc:"A chipped alms bowl, the badge of the mendicant.", benefit:"Opens charity and the invisibility of the poor." },
  "Fishing spear": { desc:"A barbed spear for river shallows and tide‑pools.", benefit:"A humble weapon — and a way to feed yourself on the road." },
  "Mountain charm": { desc:"An omamori pouch bought at a high‑peak shrine.", benefit:"A small ward of luck against the dangers of the wild." },
  "Enemy's itinerary": { desc:"A stolen schedule of your quarry's routes and guards.", benefit:"Widens the reckoning — foreknowledge undoes his defenses." },
  "Healing herbs": { desc:"Field herbs and moxa pressed on you by a mountain hermit.", benefit:"Steadies you and speeds mending when you are hurt." },
  "Villager's provisions": { desc:"Rice‑balls, pickles, and small comforts from grateful farmers.", benefit:"Sustains you along the hungry roads." },
  "Salvaged cargo": { desc:"Sound goods the sea gave up on the tide‑line.", benefit:"Worth good coin at market; counts toward a Fortune." },
  "Festival gifts": { desc:"Wrapped tokens won amid lanterns and drums.", benefit:"Small valuables and goodwill." },
  "Lord's token": { desc:"A carved token of a lord's personal favor.", benefit:"Opens doors wherever his name is feared or loved." },
  "Nanban matchlock": { desc:"A foreign teppō off a Portuguese carrack — rare, loud, and dreaded.", benefit:"Grim leverage; decisive where firepower speaks." },
  "Assassin's mask": { desc:"A dark half‑mask, the quiet uniform of the trade.", benefit:"Marks you as one who moves in the underworld." },
};

/* ---- resolve any item to a full card ----------------------------------- */
DATA.itemInfo = function (name) {
  const cat = DATA.itemCat(name);
  const explicit = DATA.items[name];
  if (explicit) return { title:name, cat, desc:explicit.desc, benefit:explicit.benefit };
  // category fallbacks for road‑gained items
  const FB = {
    coin:    { desc:"Coin and valuables gathered along the road.", benefit:"Counts toward a Fortune, and can grease a well‑placed bribe." },
    cargo:   { desc:"Trade goods worth good money at the right market.", benefit:"Counts toward a Fortune." },
    gifts:   { desc:"Small wrapped tokens and goodwill.", benefit:"Minor valuables." },
    provisions:{ desc:"Food and small comforts for the journey.", benefit:"Sustains you on the road." },
    blade:   { desc:"A serviceable blade taken up on the road.", benefit:"A weapon in hand when the wheel turns to steel." },
    knife:   { desc:"A short, easily hidden blade.", benefit:"A weapon for close and quiet work." },
    papers:  { desc:"Documents that speak for you at checkpoints.", benefit:"Smooths passage where papers are demanded." },
    seal:    { desc:"A mark of rank or favor.", benefit:"Opens doors where authority is respected." },
    food:    { desc:"Provisions against a hungry road.", benefit:"Can be shared, or eaten when there is nothing else." },
    herbs:   { desc:"Medicinal herbs for wounds and fevers.", benefit:"Steadies you when hurt." },
    charm:   { desc:"A blessed ward against misfortune.", benefit:"A little luck against the dark." },
    gun:     { desc:"A rare and dreaded firearm.", benefit:"Decisive leverage where firepower speaks." },
    mask:    { desc:"A dark mask of the shadow trades.", benefit:"Marks you to the underworld." },
  };
  const fb = FB[cat] || { desc:"A thing you carry on your road.", benefit:"May prove useful before the journey ends." };
  return { title:name, cat, desc:fb.desc, benefit:fb.benefit };
};
