/* ============================================================================
 *  rests.js — the night's rest
 *  --------------------------------------------------------------------------
 *  After two encounters you make camp. Rest events are drawn by the current
 *  location's TYPE (city→inn, wild→rough camp, sacred→temple lodging, etc.).
 *  Most restore health; some turn dangerous, triggering their own spins.
 *  Same effect keys as encounters (hp, maxhp, item, comp, rmComp, flag, ending).
 * ========================================================================== */
window.DATA = window.DATA || {};

DATA.rests = [
  /* ---------------- CITY: the inn / lodging house --------------------- */
  { id:"inn_meal", title:"A Warm Inn", loc:["city"], circles:["any"], weight:10,
    scene:{ text:"You take a room at a ryokan. Hot bath, hot rice, a futon that does not fight back. You sleep like the honored dead.", hp:9 } },
  { id:"inn_gossip", title:"Talk by the Hearth", loc:["city"], circles:["any"], weight:8,
    scene:{ text:"Around the inn's fire, travelers trade the news of every road. You learn which paths ahead are safe.", hp:5, flag:"road_news" } },
  { id:"inn_theft", title:"A Thief in the Night", loc:["city","road"], circles:["any"], weight:6,
    scene:{ text:"You wake to a hand in your pack. A cutpurse, quick and quiet.",
      spin:{ prompt:"Catch the thief?", stat:"wis",
        options:[
          { label:"Seize him", weight:9, valence:"good", text:"You pin the thief and reclaim your goods — plus his, as penalty.", item:"Thief's takings", hp:2 },
          { label:"Chase him off", weight:8, valence:"neutral", text:"He bolts into the dark. You lose a little sleep but nothing else.", hp:3 },
          { label:"Sleep through it", weight:6, valence:"bad", text:"You wake to a lighter purse and a colder morning.", hp:1 },
        ] } } },
  { id:"inn_courtesan", title:"The Teahouse Upstairs", loc:["city"], circles:["noble","entertainer","merchant","warrior"], weight:5,
    scene:{ text:"An elegant entertainer joins your table, all wit and knowing smiles. She has heard things worth hearing.",
      spin:{ prompt:"An evening of company.", stat:"cha",
        options:[
          { label:"Charm and listen", weight:8, valence:"good", text:"She likes you enough to travel a while, and knows what every lord fears.", comp:"courtesan", hp:4 },
          { label:"Keep it professional", weight:9, valence:"neutral", text:"Pleasant talk, a little wisdom, a fair fee. You wake rested.", hp:6 },
          { label:"Drink the night away", weight:7, valence:"bad", text:"You wake broke, headachey, and missing a sandal. Worth it, probably.", hp:2 },
        ] } } },

  /* ---------------- ROAD: post-station / roadside -------------------- */
  { id:"post_station", title:"The Post Station", loc:["road"], circles:["any"], weight:9,
    scene:{ text:"A Tōkaidō post-station offers a plank bed and thin miso soup. Humble, but it keeps the rain off.", hp:6 } },
  { id:"road_camp", title:"Camp by the Milestone", loc:["road"], circles:["any"], weight:8,
    scene:{ text:"You bed down beside a stone milestone, small fire crackling. Sleep comes uneasy but sufficient.", hp:4 } },
  { id:"road_ambush", title:"Ambush at Midnight", loc:["road","wild"], circles:["any"], weight:6,
    scene:{ text:"You wake to boots in the dark — bandits have crept up on your fire.",
      spin:{ prompt:"Fight for your camp.", stat:"str",
        options:[
          { label:"Rout them", weight:9, valence:"good", text:"You were less asleep than they hoped. They flee, leaving loot behind.", hp:-4, item:"Ambusher's spoils" },
          { label:"Hold the fire", weight:8, valence:"bad", text:"You drive them off but take a club to the ribs first.", hp:-11 },
          { label:"Vanish into the dark", weight:7, valence:"neutral", text:"You slip your bedroll and let them rob an empty camp, watching from the trees.", hp:-2 },
        ] } } },

  /* ---------------- RURAL: barn, farmhouse --------------------------- */
  { id:"farmhouse", title:"A Farmer's Hospitality", loc:["rural"], circles:["any"], weight:9,
    scene:{ text:"A kind farm family shares their hearth, their millet gruel, and stories of the old days. You sleep in clean straw.", hp:8 } },
  { id:"barn", title:"The Hayloft", loc:["rural"], circles:["any"], weight:8,
    scene:{ text:"You bury yourself in warm hay in an empty barn. Mice for company, but dry and safe.", hp:5 } },
  { id:"farm_kindness", title:"Repaid Kindness", loc:["rural","farm"], circles:["any"], weight:5,
    scene:{ text:"The family you helped earlier insists you stay. They send you off with provisions and a blessing.",
      requiresFlag:"defender",
      scene_effect:true, hp:10, item:"Villager's provisions", flag:"beloved" } },

  /* ---------------- WILD: rough camp -------------------------------- */
  { id:"wild_camp", title:"Rough Camp", loc:["wild"], circles:["any"], weight:9,
    scene:{ text:"You clear a spot, build a small fire, and keep one ear open. The wilderness does not rest, so neither do you fully.", hp:4 } },
  { id:"tree_sleep", title:"Sleeping in the Branches", loc:["wild","forest"], circles:["any"], weight:7,
    scene:{ text:"You lash yourself into the fork of a great cedar, safe from what walks the forest floor.",
      spin:{ prompt:"A restless night aloft.", stat:"wis",
        options:[
          { label:"Sleep soundly", weight:9, valence:"good", text:"The high wind rocks you like a cradle. You wake surprisingly whole.", hp:6 },
          { label:"Vagabond below", weight:7, valence:"bad", text:"A thief tries your pack from below. You drop on him hard — and land badly yourself.", hp:-7, item:"Vagabond's knife" },
          { label:"Cold and cramped", weight:8, valence:"neutral", text:"You doze in fits, stiff and chilled, but nothing finds you.", hp:1 },
        ] } } },
  { id:"cave_shelter", title:"A Dry Cave", loc:["wild","mountain","forest"], circles:["any"], weight:7,
    scene:{ text:"You find a dry cave and a windbreak. Deeper in, eyes may or may not be watching.",
      spin:{ prompt:"Settle in the cave.", stat:"str",
        options:[
          { label:"Uncontested rest", weight:9, valence:"good", text:"The cave is empty and warm. Best sleep in days.", hp:8 },
          { label:"The bear's cave", weight:6, valence:"bad", text:"It was not empty. You escape the waking bear, but not unmarked.", hp:-12 },
          { label:"Uneasy watch", weight:8, valence:"neutral", text:"You sleep with one eye open. Rested enough, spooked enough.", hp:3 },
        ] } } },

  /* ---------------- SACRED: temple lodging -------------------------- */
  { id:"temple_lodging", title:"Guest of the Temple", loc:["sacred"], circles:["any"], weight:10,
    scene:{ text:"The monks offer a pilgrim's cell, plain vegetarian fare, and the deep quiet of the mountain. You wake clean in body and mind.", hp:10, flag:"rested_temple" } },
  { id:"night_prayer", title:"Midnight Sutras", loc:["sacred"], circles:["religious","any"], weight:7,
    scene:{ text:"You join the monks for the pre-dawn chanting. The bell, the smoke, the low voices — something in you unknots.",
      spin:{ prompt:"Sit the vigil.", stat:"wis",
        options:[
          { label:"Deep peace", weight:9, valence:"good", text:"You touch a stillness beneath your fear. It stays with you like a lantern.", hp:9, flag:"centered" },
          { label:"Restless mind", weight:8, valence:"neutral", text:"Your thoughts will not sit, but the effort still rests you.", hp:5 },
        ] } } },
  { id:"haunted_shrine", title:"The Restless Dead", loc:["sacred","wild","road"], circles:["any"], weight:5,
    scene:{ text:"You camp near an old battlefield-shrine. In the small hours, pale shapes drift among the graves, murmuring.",
      requiresFlag:"haunted",
      spin:{ prompt:"Face the yūrei.", stat:"wis",
        options:[
          { label:"Pray for them", weight:9, valence:"good", text:"You chant what rites you know. The shapes bow and fade; the weight lifts from your shoulders.", hp:4, rmFlag:"haunted", flag:"laid_to_rest" },
          { label:"Endure till dawn", weight:7, valence:"bad", text:"You shiver through it, sleepless, colder in the soul by morning.", hp:-5 },
        ] } } },

  /* ---------------- COAST: fishing village ------------------------- */
  { id:"fisher_hut", title:"A Fisherman's Hut", loc:["coast"], circles:["any"], weight:9,
    scene:{ text:"A weathered fisher shares grilled fish and rice wine, and the sound of the sea rocks you to sleep.", hp:8 } },
  { id:"beach_camp", title:"Sleeping on the Sand", loc:["coast"], circles:["any"], weight:7,
    scene:{ text:"You bed down above the tide-line under a sky thick with stars. The waves keep watch for you.", hp:5 } },
  { id:"beach_wreck", title:"Wreckage on the Tide", loc:["coast"], circles:["any"], weight:5,
    scene:{ text:"Dawn reveals cargo washed up from some foundered ship, scattered along the sand.",
      spin:{ prompt:"Comb the wreck.", stat:"wis",
        options:[
          { label:"Salvage the goods", weight:9, valence:"good", text:"You gather sound cargo the sea has gifted you — worth good coin at market.", hp:2, item:"Salvaged cargo" },
          { label:"Sea's ill temper", weight:6, valence:"bad", text:"A rogue wave catches you at the wrong moment and drags you over the rocks.", hp:-8 },
        ] } } },

  /* ---------------- UNIVERSAL FALLBACK ----------------------------- */
  { id:"open_sky", title:"Under the Open Sky", loc:["any"], circles:["any"], weight:6,
    scene:{ text:"No shelter tonight but the stars and your cloak. You sleep light, wake stiff, and go on.", hp:3 } },
  { id:"restless", title:"A Sleepless Night", loc:["any"], circles:["any"], weight:5,
    scene:{ text:"Sleep will not come. You lie listening to the dark, turning your worries like stones, and rise gritty-eyed but moving.", hp:1 } },

  /* ---------------- DREAMS THAT TURN THE ROAD (destiny) ------------- */
  { id:"prophetic_dream", title:"A Dream of the Far Road", loc:["any"], circles:["any"], weight:4, once:true, minStep:4,
    scene:{ text:"In sleep a white stag leads you down a road you have never walked, to a gate of light, and will not let you look away. You wake certain it meant something.",
      spin:{ prompt:"What do you make of the dream?", stat:"wis",
        options:[
          { label:"Take it as a summons", weight:9, valence:"good", quest:"pilgrimage", text:"You cannot un-see it. At dawn you turn your steps toward the far shrine of the dream.", flag:"blessed_omen", hp:4 },
          { label:"Seek its deeper meaning", weight:7, valence:"good", quest:"enlighten", text:"A dream like a door. You resolve to walk until you understand what stood on the other side.", flag:"centered", hp:3 },
          { label:"Dismiss it as fatigue", weight:7, valence:"neutral", text:"You are tired, that is all. You rise and shake the stag from your head — mostly.", hp:5 },
        ] } } },

  { id:"campfire_confession", title:"A Confession by the Fire", loc:["road","wild","rural","farm"], circles:["any"], weight:4, once:true, minStep:5,
    scene:{ text:"A fellow traveler shares your fire and, deep in the night, weeps out a name — the same warlord whose men once shattered your own life. He asks if you will help him see justice done.",
      spin:{ prompt:"How do you answer him?", stat:"cha",
        options:[
          { label:"Make his cause yours", weight:9, valence:"good", quest:"revenge", text:"Two griefs braid into one purpose. You clasp his hand across the coals and swear it together.", flag:"vendetta", comp:"ronin_frnd" },
          { label:"Counsel him toward peace", weight:7, valence:"good", quest:"pilgrimage", text:"You talk him down from the blade, and in doing so talk yourself toward a gentler road than vengeance.", flag:"centered", hp:3 },
          { label:"Offer only silence", weight:7, valence:"neutral", text:"You have no words for his grief, only shared warmth against the dark. By morning he has gone.", hp:5 },
        ] } } },

  { id:"temple_lodging_pledge", title:"The Abbot's Offer", loc:["sacred"], circles:["any"], weight:5, minStep:3,
    scene:{ text:"The temple grants you a cell for the night. Before dawn prayers the old abbot studies you and says, plainly, that the war needs more than swords. He offers you a purpose, if you will take it.",
      spin:{ prompt:"Consider the abbot's charge.", stat:"wis",
        options:[
          { label:"Accept a sacred errand", weight:9, valence:"good", boostItem:"Sutra scroll", boostAmt:2.0, quest:"pilgrimage", text:"You take his blessing and his charge: carry word and mercy along the burning roads. The walk itself is now the work.", flag:"temple_ally", hp:6 },
          { label:"Rest, and only rest", weight:9, valence:"neutral", text:"You bow, but keep your own road. The cell is warm; the rice, plain and good.", hp:8 },
          { label:"Trouble the quiet", weight:5, valence:"bad", text:"You cannot still your restlessness, and disturb the dawn prayers. The monks feed you and firmly see you out.", hp:3, flag:"impure" },
        ] } } },
];
