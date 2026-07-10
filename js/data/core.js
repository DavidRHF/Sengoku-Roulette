/* ============================================================================
 *  core.js  —  Statuses, Tools, Companions, Locations
 *  Sengoku no Wa (戦国の輪) — "Wheel of the Warring States"
 *  --------------------------------------------------------------------------
 *  All game content lives in plain data objects on window.DATA so the game
 *  runs from file:// (double-click index.html) as well as GitHub Pages.
 *
 *  RARITY:  higher `rarity` weight  = MORE common (easier to roll).
 *           The best statuses/tools carry the smallest weights.
 *
 *  TIERS:   'cursed' < 'poor' < 'plain' < 'fortunate' < 'exalted'
 *           Tier drives the "luck" bias a status/tool lends to later spins.
 *
 *  STATS:   str / wis / cha are clamped 0..20.  hp clamped 15..50.
 *           Status supplies a base; the tool nudges it.
 *
 *  CIRCLES: shared tags. Two statuses that share a circle can draw the same
 *           story beats, encounters, companions and rest events — a peasant
 *           and a drunkard both wander the "low" circle, so their roads cross.
 * ========================================================================== */

window.DATA = window.DATA || {};

/* ----------------------------------------------------------------- STATUSES */
DATA.statuses = [
  // ---- CURSED / POOR (common, weak) -------------------------------------
  { id:"hinin", name:"Hinin (Outcast)", rarity:20, tier:"cursed",
    hp:16, str:5, wis:7, cha:4, luck:-3,
    circles:["low","outcast","wanderer"],
    startLoc:"outskirts",
    blurb:"Cast beneath the four castes — a gravedigger, a beggar, unclean in the eyes of the world. You own nothing but the road." },

  { id:"beggar", name:"Wandering Beggar", rarity:20, tier:"cursed",
    hp:18, str:6, wis:8, cha:7, luck:-2,
    circles:["low","outcast","wanderer"],
    startLoc:"kyoto",
    blurb:"You sleep under temple eaves and eat what the pious leave behind. Hunger has sharpened your wits, if nothing else." },

  { id:"drunkard", name:"Sake-sodden Drunkard", rarity:19, tier:"poor",
    hp:22, str:9, wis:3, cha:9, luck:-2,
    circles:["low","entertainer","criminal"],
    startLoc:"edo",
    blurb:"The gourd is never empty for long, and neither is your list of debts. Men laugh with you, then take your coin." },

  { id:"peasant", name:"Landless Peasant", rarity:20, tier:"poor",
    hp:22, str:9, wis:5, cha:5, luck:-1,
    circles:["low","peasant"],
    startLoc:"farm",
    blurb:"No field of your own, only another man's paddy to flood and drain. War took your village; the road took the rest." },

  { id:"farmer", name:"Rice Farmer (Hyakushō)", rarity:18, tier:"plain",
    hp:26, str:11, wis:6, cha:6, luck:0,
    circles:["peasant","low"],
    startLoc:"farm",
    blurb:"You know the moods of the paddy and the weight of the tax. When lords war, it is your grain and your sons they spend." },

  { id:"fisher", name:"Coastal Fisherman", rarity:17, tier:"plain",
    hp:26, str:12, wis:8, cha:5, luck:0,
    circles:["peasant","low"],
    startLoc:"coast",
    blurb:"The sea feeds you and would gladly drown you. You read cloud and current the way scholars read scrolls." },

  { id:"woodcutter", name:"Mountain Woodcutter", rarity:17, tier:"plain",
    hp:28, str:14, wis:5, cha:4, luck:0,
    circles:["peasant","low","wanderer"],
    startLoc:"forest",
    blurb:"Axe on shoulder, you climb where the mist lives. The mountain kami know your name, and you leave them offerings." },

  // ---- PLAIN (fairly common) --------------------------------------------
  { id:"bandit", name:"Nobushi Bandit", rarity:15, tier:"poor",
    hp:28, str:14, wis:6, cha:7, luck:-1,
    circles:["criminal","warrior","wanderer"],
    startLoc:"tokaido",
    blurb:"A deserter turned brigand, you levy your own 'toll' on the highway. The law would shorten you by a head." },

  { id:"ronin", name:"Wandering Ronin", rarity:14, tier:"plain",
    hp:30, str:15, wis:9, cha:7, luck:0,
    circles:["warrior","wanderer"],
    startLoc:"tokaido",
    blurb:"A masterless sword. Once you served a lord; now his castle is ash and you sell your steel by the day." },

  { id:"merchant", name:"Traveling Merchant", rarity:14, tier:"plain",
    hp:24, str:6, wis:13, cha:14, luck:1,
    circles:["merchant","wanderer"],
    startLoc:"edo",
    blurb:"Beneath the samurai in rank, above them in ready coin. You trade in silk, salt, and secrets alike." },

  { id:"smith", name:"Swordsmith", rarity:12, tier:"fortunate",
    hp:32, str:15, wis:12, cha:6, luck:1,
    circles:["artisan"],
    startLoc:"edo",
    blurb:"You fold steel a thousand times and pray to Inari over the forge. Warlords wait on your blades." },

  { id:"actor", name:"Shirabyōshi Dancer", rarity:11, tier:"fortunate",
    hp:24, str:5, wis:12, cha:17, luck:1,
    circles:["entertainer","noble"],
    startLoc:"kyoto",
    blurb:"You dance in white robes for the courts and shrines. A song from you can open a lord's gate — or his purse." },

  // ---- FORTUNATE (uncommon, strong) -------------------------------------
  { id:"sohei", name:"Sōhei (Warrior Monk)", rarity:10, tier:"fortunate",
    hp:36, str:16, wis:13, cha:8, luck:1,
    circles:["religious","warrior"],
    startLoc:"shrine",
    blurb:"You chant the sutras and wield the naginata. The great temples field armies, and you are one of their spears." },

  { id:"miko", name:"Shrine Maiden (Miko)", rarity:10, tier:"fortunate",
    hp:26, str:6, wis:15, cha:13, luck:2,
    circles:["religious","noble"],
    startLoc:"shrine",
    blurb:"You dance the kagura and speak for the kami. Warriors seek your divinations before they ride to die." },

  { id:"monk", name:"Zen Monk", rarity:11, tier:"fortunate",
    hp:28, str:8, wis:17, cha:11, luck:2,
    circles:["religious"],
    startLoc:"shrine",
    blurb:"Emptiness and the sword are the same to you. Daimyō invite you to gardens to hear your riddles and their doom." },

  { id:"kunoichi", name:"Kunoichi (Shinobi)", rarity:8, tier:"fortunate",
    hp:30, str:13, wis:16, cha:14, luck:1,
    circles:["criminal","warrior","wanderer"],
    startLoc:"kyoto",
    blurb:"You pass as maid, priestess, or courtesan. Poison, patience, and a whispered word are your true weapons." },

  { id:"shinobi", name:"Shinobi (Ninja)", rarity:8, tier:"fortunate",
    hp:32, str:15, wis:16, cha:10, luck:1,
    circles:["criminal","warrior","wanderer"],
    startLoc:"forest",
    blurb:"Iga-born and shadow-trained, you sell secrets and swift deaths. No lord admits to hiring you; all of them do." },

  { id:"samurai", name:"Samurai Retainer", rarity:7, tier:"fortunate",
    hp:40, str:17, wis:12, cha:11, luck:2,
    circles:["warrior","noble"],
    startLoc:"edo",
    startComp:"ashigaru",
    blurb:"Two swords at your hip and a lord's crest on your back. Duty (giri) binds you tighter than any rope." },

  // ---- EXALTED (rare, powerful) -----------------------------------------
  { id:"kuge", name:"Court Noble (Kuge)", rarity:6, tier:"exalted",
    hp:28, str:6, wis:16, cha:17, luck:3,
    circles:["noble"],
    startLoc:"kyoto",
    blurb:"Blood of the old imperial court. You have no armies, only lineage, ceremony, and the ear of the Emperor." },

  { id:"daimyo", name:"Daimyō (Warlord)", rarity:3, tier:"exalted",
    hp:46, str:16, wis:16, cha:18, luck:4,
    circles:["noble","warrior"],
    startLoc:"edo",
    startComp:"retainer",
    blurb:"A province bows to you and ten thousand spears answer your war-fan. But every ally would gladly wear your head." },
];

/* -------------------------------------------------------------------- TOOLS */
DATA.tools = [
  { id:"barehands", name:"Only Bare Hands", rarity:20, tier:"cursed",
    str:-2, wis:0, cha:0, hp:0,
    blurb:"No steel, no staff. Calloused knuckles and desperate nerve." },

  { id:"hoe", name:"Rusted Farming Hoe", rarity:18, tier:"poor",
    str:1, wis:0, cha:-1, hp:0,
    blurb:"A tool of the paddy pressed into service as a weapon. It insults every enemy it meets." },

  { id:"gourd", name:"Sake Gourd", rarity:16, tier:"poor",
    str:0, wis:-2, cha:3, hp:2,
    blurb:"Liquid courage. Loosens tongues — yours most of all." },

  { id:"net", name:"Fishing Net & Knife", rarity:15, tier:"plain",
    str:1, wis:2, cha:0, hp:0,
    blurb:"Tangle a foe, gut a fish. Humble but versatile." },

  { id:"bo", name:"Bamboo Staff (Bō)", rarity:16, tier:"plain",
    str:2, wis:1, cha:0, hp:1,
    blurb:"The monk's road-companion. Cheap, honest, and surprisingly deadly." },

  { id:"axe", name:"Woodcutter's Axe", rarity:15, tier:"plain",
    str:4, wis:0, cha:-1, hp:1,
    blurb:"Splits pine and skull with equal candor." },

  { id:"pack", name:"Straw Cloak & Pack", rarity:14, tier:"plain",
    str:0, wis:2, cha:1, hp:3,
    blurb:"A mino cloak, dry rations, flint. The wanderer's true armor is preparation." },

  { id:"tanto", name:"Tantō (Dagger)", rarity:13, tier:"plain",
    str:2, wis:1, cha:1, hp:0,
    blurb:"Small, silent, close. A blade for alleys and betrayals." },

  { id:"yumi", name:"Yumi (Longbow)", rarity:10, tier:"fortunate",
    str:3, wis:3, cha:0, hp:0,
    blurb:"The asymmetric war-bow. Death delivered before the enemy sees your face." },

  { id:"naginata", name:"Naginata (Glaive)", rarity:9, tier:"fortunate",
    str:5, wis:1, cha:0, hp:2,
    blurb:"Reach and sweep. The polearm of temple-guards and warrior women alike." },

  { id:"ninjatools", name:"Shinobi Tools", rarity:8, tier:"fortunate",
    str:3, wis:4, cha:1, hp:0,
    blurb:"Kunai, caltrops, smoke, and rope. A whole trade folded into a black cloth." },

  { id:"wakizashi", name:"Wakizashi (Short Sword)", rarity:8, tier:"fortunate",
    str:4, wis:1, cha:2, hp:1,
    blurb:"The blade of honor, never surrendered, worn even indoors." },

  { id:"sutra", name:"Sutra Scroll & Beads", rarity:8, tier:"fortunate",
    str:0, wis:5, cha:2, hp:1,
    blurb:"The Heart Sutra and a rosary of 108 beads. Words that steady the hand and the fearful." },

  { id:"katana", name:"Fine Katana", rarity:5, tier:"fortunate",
    str:6, wis:1, cha:3, hp:3,
    blurb:"A named blade by a known smith. Its curve alone commands respect." },

  { id:"masamune", name:"Masamune Blade", rarity:2, tier:"exalted",
    str:8, wis:2, cha:4, hp:5,
    blurb:"Steel so pure that leaves are said to drift around its edge rather than be cut. A relic worth a province." },
];

/* --------------------------------------------------------------- COMPANIONS */
/* mods are ADDED to the relevant stat when a check uses it.  A drunkard drags
   charisma checks down; a samurai lifts strength checks. `luck` shifts all
   spins slightly. Companions are gained/lost through the journey.            */
DATA.companions = {
  ashigaru:   { name:"Loyal Ashigaru", trait:"warrior",
                mods:{str:3, wis:0, cha:0}, luck:1,
                blurb:"A foot-soldier who chose you over his dead lord. Steady spear, steadier heart." },
  retainer:   { name:"Veteran Retainer", trait:"warrior",
                mods:{str:4, wis:2, cha:1}, luck:2,
                blurb:"Grey at the temples, terrifying with a blade. He has buried three masters." },
  ronin_frnd: { name:"Ronin Swordsman", trait:"warrior",
                mods:{str:4, wis:1, cha:0}, luck:1,
                blurb:"Masterless like the wind, loyal like a dog that chose you." },
  monk_frnd:  { name:"Mendicant Monk", trait:"scholar",
                mods:{str:0, wis:4, cha:2}, luck:2,
                blurb:"Begging bowl and bottomless calm. He talks men down from murder." },
  miko_frnd:  { name:"Traveling Miko", trait:"scholar",
                mods:{str:0, wis:3, cha:3}, luck:2,
                blurb:"She reads omens in birdflight and softens hard hearts with older songs." },
  scholar:    { name:"Disgraced Scholar", trait:"scholar",
                mods:{str:-1, wis:5, cha:1}, luck:1,
                blurb:"Exiled from the court for a poem. Knows every law, road, and grudge in the land." },
  merchant_c: { name:"Shrewd Merchant", trait:"talker",
                mods:{str:0, wis:2, cha:4}, luck:1,
                blurb:"Can sell rain to a river. Where he walks, doors and purses open." },
  courtesan:  { name:"Court Entertainer", trait:"talker",
                mods:{str:-1, wis:1, cha:5}, luck:1,
                blurb:"A voice that stops swords mid-swing. She knows what every lord fears." },
  shinobi_c:  { name:"Silent Shinobi", trait:"trickster",
                mods:{str:2, wis:4, cha:0}, luck:1,
                blurb:"Speaks once a day, saves your life twice. Locks and guards mean nothing to them." },
  child:      { name:"Orphaned Child", trait:"innocent",
                mods:{str:0, wis:1, cha:2}, luck:1,
                blurb:"Small, quick, and quietly lucky. The gods seem to watch this one." },
  drunkard_c: { name:"Cheerful Drunkard", trait:"liability",
                mods:{str:1, wis:-2, cha:-2}, luck:-2,
                blurb:"Good company, terrible timing. He will greet an ambush like an old friend." },
  wardog:     { name:"Mountain War-Dog", trait:"beast",
                mods:{str:3, wis:1, cha:-1}, luck:0,
                blurb:"Half-wolf, wholly yours. Smells iron and ill intent on the wind." },
  packhorse:  { name:"Sturdy Packhorse", trait:"beast",
                mods:{str:2, wis:0, cha:0}, luck:1,
                blurb:"Carries your goods and your wounded. Slows an escape but never a march." },
};

/* ---------------------------------------------------------------- LOCATIONS */
/* `type` groups locations for shared encounter/rest pools.
   `links` are the roads onward — travel outcomes move you between them.       */
DATA.locations = {
  edo:      { name:"Edo — Castle Town", type:"city",   sacred:false,
              links:["tokaido","outskirts","coast"],
              blurb:"A boomtown of samurai barracks, merchant rows, and the shōgun's rising keep." },
  kyoto:    { name:"Kyoto — Imperial Capital", type:"city", sacred:true,
              links:["tokaido","outskirts","shrine"],
              blurb:"The old capital of a thousand temples, courtiers, and quiet knives." },
  outskirts:{ name:"Town Outskirts", type:"road", sacred:false,
              links:["edo","kyoto","farm","tokaido"],
              blurb:"Where the paper lanterns end and the barrier-gates check every traveler." },
  tokaido:  { name:"The Tōkaidō Road", type:"road", sacred:false,
              links:["edo","kyoto","outskirts","river","mountain"],
              blurb:"The great eastern highway, thick with pilgrims, porters, and highwaymen." },
  farm:     { name:"Rice Paddies", type:"rural", sacred:false,
              links:["outskirts","forest","river"],
              blurb:"Flooded terraces mirror the sky. Peasants bow low and pray the levies pass them by." },
  forest:   { name:"Deep Forest", type:"wild", sacred:false,
              links:["mountain","farm","river"],
              blurb:"Cedar dark and old. Tengu are said to snatch the boastful from these paths." },
  mountain: { name:"Mountain Pass", type:"wild", sacred:false,
              links:["forest","tokaido","shrine"],
              blurb:"Thin air, thinner trails. Bandits and hermits share the cold heights." },
  river:    { name:"River Crossing", type:"wild", sacred:false,
              links:["farm","forest","tokaido","coast"],
              blurb:"No bridge — only ferrymen, fords, and the swollen brown current." },
  coast:    { name:"Fishing Harbor", type:"coast", sacred:false,
              links:["edo","river"],
              blurb:"Salt-grey wharves, drying nets, and rumors of red-haired traders from beyond the sea." },
  shrine:   { name:"Shrine & Temple Grounds", type:"sacred", sacred:true,
              links:["kyoto","mountain","forest"],
              blurb:"Vermilion torii climb the hill. Bells, cedar-smoke, and the hush before the kami." },
};
