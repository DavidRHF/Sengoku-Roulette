/* ============================================================================
 *  encounters.js — the road's events
 *  --------------------------------------------------------------------------
 *  An encounter is eligible when its `loc` matches the current location id OR
 *  its type (city/road/rural/wild/coast/sacred), AND its `circles` overlaps the
 *  player's circles ("any" matches all). Shared circles = shared roads: a
 *  ronin and a bandit both draw from the "warrior" pool.
 *
 *  A `scene` may hold a `spin` (a stat-swayed wheel). Options carry a `valence`
 *  ('good'/'bad'/'neutral'); the relevant stat + companions + luck bend the odds.
 *  An option may `goto` a `sub`-scene, so a cave-in or ambush can be several
 *  spins yet still count as ONE encounter.
 *
 *  Effect keys on an option/scene:
 *    hp:+/-   maxhp:+/-   item:"name"   comp:"companionId"   rmComp:true
 *    flag:"name"   loc:"locationId"   ending:"endingId"   goto:"subId"
 * ========================================================================== */
window.DATA = window.DATA || {};

DATA.encounters = [

  /* ===================== ROAD / UNIVERSAL ============================== */
  { id:"toll", title:"Highway Toll", loc:["road","wild","any"], circles:["any"], weight:10,
    scene:{ text:"Three nobushi step from the pines, blades bared. 'A toll,' the leader grins, 'for the safety of the road we ourselves endanger.'",
      spin:{ prompt:"How do you answer the brigands?", stat:"str",
        options:[
          { label:"Fight through", weight:10, valence:"good", text:"Your blade speaks first and last. Two flee; one does not rise. You take his coin.", hp:-6, item:"Bandit's purse" },
          { label:"Cut them down", weight:8, valence:"bad", text:"They were more than they looked. You win, but a spear opens your side.", hp:-14 },
          { label:"Pay the toll", weight:9, valence:"neutral", text:"You hand over coin and swallow your pride. They let you pass, laughing.", hp:0 },
          { label:"Talk past", weight:7, valence:"good", text:"You name a warlord they fear and imply his patronage. They melt back into the trees.", hp:0 },
        ] } } },

  { id:"wounded", title:"The Wounded Traveler", loc:["road","wild","rural","any"], circles:["any"], weight:8,
    scene:{ text:"A man lies groaning by the roadside, clutching a bloodied leg. Or so it seems.",
      spin:{ prompt:"Do you help him?", stat:"wis",
        options:[
          { label:"Tend his wound", weight:9, valence:"good", text:"He is genuine. A discharged foot-soldier, grateful and steady. He asks to walk with you.", comp:"ashigaru" },
          { label:"Approach warily", weight:9, valence:"good", text:"You sense the ambush an instant early — his 'friends' break cover into your ready guard. You drive them off.", hp:-5 },
          { label:"Walk past", weight:8, valence:"neutral", text:"You leave him to his fate, whatever it truly is. The road does not judge.", hp:0 },
          { label:"Rush to help", weight:7, valence:"bad", text:"It was a lure. Cutthroats spring from the ditch and bleed you before you break free.", hp:-12 },
        ] } } },

  { id:"barrier", title:"The Barrier Gate", loc:["road","city","outskirts","tokaido","edo","kyoto"], circles:["any"], weight:9,
    scene:{ text:"A sekisho barrier-gate. Guards demand your travel-papers and your business. The book of wanted faces lies open on their table.",
      spin:{ prompt:"How do you pass inspection?", stat:"cha",
        options:[
          { label:"Present papers", weight:10, valence:"good", text:"Your bearing and story satisfy them. They wave you through with a bow.", hp:0 },
          { label:"Talk your way through", weight:8, valence:"good", text:"A joke, a small gift, a flattered captain. The gate opens.", hp:0, item:"Traveler's pass" },
          { label:"Bluster", weight:7, valence:"bad", text:"They dislike your tone and search your things roughly, confiscating a valuable.", hp:-2 },
          { label:"Slip around at night", weight:6, valence:"neutral", text:"You take the smuggler's path over the hill. Slower, colder, but unseen.", hp:-3 },
        ] } } },

  { id:"ronin_duel", title:"A Challenge Issued", loc:["road","wild","city","any"], circles:["warrior","criminal","any"], weight:6,
    scene:{ text:"A lean swordsman blocks the road. 'I collect duels the way monks collect prayers,' he says. 'Draw.'",
      spin:{ prompt:"Face the duelist.", stat:"str",
        options:[
          { label:"Accept the duel", weight:9, valence:"good", text:"Steel rings once. He steps back, bows to a superior cut, and gifts you his spare blade.", hp:-4, item:"Duelist's tantō" },
          { label:"Strike first", weight:8, valence:"bad", text:"He was faster than pride. You win, barely, streaming blood from a shoulder wound.", hp:-13 },
          { label:"Refuse with grace", weight:7, valence:"good", text:"You bow and quote a line on the futility of empty duels. Impressed, he lets you pass.", hp:0 },
          { label:"Flee", weight:6, valence:"neutral", text:"You choose your legs over your honor. He laughs you down the road but does not follow.", hp:0 },
        ] } } },

  { id:"fox", title:"The Fox at the Crossroads", loc:["road","wild","forest","farm","any"], circles:["any"], weight:6,
    scene:{ text:"A white fox with too-clever eyes sits at the fork, watching you. A messenger of Inari — or a kitsune wearing mischief.",
      spin:{ prompt:"What do you do?", stat:"wis",
        options:[
          { label:"Offer rice, bow", weight:9, valence:"good", text:"You leave an offering and bow. The fox blinks slow approval; the day's luck turns kind.", flag:"blessed_fox" },
          { label:"Follow it", weight:7, valence:"good", text:"It leads you to a hollow tree hiding a traveler's forgotten cache of coin.", item:"Hidden coin" },
          { label:"Ignore it", weight:8, valence:"neutral", text:"You keep your eyes on the road. Foxes are not to be trusted, offering or no.", hp:0 },
          { label:"Chase it off", weight:6, valence:"bad", text:"You throw a stone. Bad idea. That night your food spoils and your sandals go missing.", hp:-4 },
        ] } } },

  { id:"storm", title:"Sudden Storm", loc:["road","wild","mountain","farm","any"], circles:["any"], weight:7,
    scene:{ text:"The sky goes bruise-purple and opens. Rain hammers the road to mud; thunder walks the ridgeline.",
      spin:{ prompt:"Where do you shelter?", stat:"wis",
        options:[
          { label:"Find a dry cave", weight:9, valence:"good", text:"You read the land and reach a dry overhang before the worst. You even light a fire.", hp:3 },
          { label:"Push on through", weight:8, valence:"bad", text:"Soaked and shivering, you slip on the trail and turn an ankle. Fever follows.", hp:-9 },
          { label:"Shelter under a shrine gate", weight:7, valence:"good", text:"A roadside jizō statue's little roof keeps you dry. You share your rice with the stone guardian.", hp:0, flag:"blessed_jizo" },
          { label:"Dig in and wait", weight:7, valence:"neutral", text:"You wrap in your cloak and endure. Dawn comes cold but whole.", hp:-2 },
        ] } } },

  { id:"beggar_child", title:"The Hungry Child", loc:["road","city","outskirts","any"], circles:["any"], weight:6,
    scene:{ text:"A ragged child tugs your sleeve, eyes huge with hunger. Behind them, no parents — only the war's long shadow.",
      spin:{ prompt:"How do you respond?", stat:"cha",
        options:[
          { label:"Share your food", weight:9, valence:"good", text:"You feed the child, who then refuses to leave your side — and proves oddly, reliably lucky.", comp:"child" },
          { label:"Give a coin", weight:8, valence:"neutral", text:"You press a coin into small hands and walk on. It is not enough. Nothing is.", hp:0 },
          { label:"Wave them off", weight:7, valence:"bad", text:"You brush past. A watching monk marks your hardness aloud, and the shame follows you.", flag:"unkind" },
        ] } } },

  /* ===================== BRANCH: THE RAVINE ============================ */
  { id:"ravine", title:"The Broken Path", loc:["wild","mountain","forest","river"], circles:["any"], weight:6,
    scene:{ text:"The trail crumbles beneath you and you slide down a wet ravine, landing hard in a cold, dark cleft. Above, the path is out of reach.",
      spin:{ prompt:"You are hurt and trapped. What now?", stat:"wis",
        options:[
          { label:"Search the cleft", weight:9, valence:"good", text:"Feeling along the wall, your hand finds a gap — a passage.", hp:-3, goto:"cave_passage" },
          { label:"Climb straight up", weight:8, valence:"bad", text:"Halfway up, the rock gives. You fall again, worse.", hp:-10, goto:"cave_passage" },
          { label:"Rest, then move", weight:7, valence:"neutral", text:"You bind your bruises and gather your nerve before exploring.", hp:-2, goto:"cave_passage" },
        ] } },
    sub:{
      cave_passage:{ text:"The passage opens into a dry cavern. Old bones lie in one corner — and beside them, a rusted chest and the glint of a shrine long forgotten.",
        spin:{ prompt:"Explore the cavern.", stat:"str",
          options:[
            { label:"Force the chest", weight:9, valence:"good", text:"Old iron gives way to reveal a fine wakizashi, still keen. You climb out at dusk, richer.", hp:-2, item:"Cavern wakizashi", loc:"forest" },
            { label:"Pray at the shrine", weight:8, valence:"good", text:"You bow to the forgotten kami. Warmth fills you; you find the climbing-holds you missed before.", hp:6, flag:"blessed_cave", loc:"forest" },
            { label:"Flee the bones", weight:7, valence:"bad", text:"Something in the dark stirs — bats, or worse. You scramble out bloodied but alive.", hp:-8, loc:"forest" },
          ] } },
    } },

  /* ===================== BRANCH: THE FORD ============================== */
  { id:"ford", title:"The Swollen Ford", loc:["river","wild","tokaido"], circles:["any"], weight:8,
    scene:{ text:"No bridge — only a brown, muscular current and a rope strung by earlier travelers. The far bank waits.",
      spin:{ prompt:"How do you cross?", stat:"str",
        options:[
          { label:"Wade the rope", weight:10, valence:"good", text:"Hand over hand, boots slipping, you haul across and collapse gasping on the far bank.", hp:-2 },
          { label:"Swim it", weight:7, valence:"bad", text:"The current takes you downstream and slams you into rocks before you claw ashore.", hp:-11, goto:"downstream" },
          { label:"Pay the ferryman", weight:8, valence:"good", text:"An old ferryman poles you across, trading gossip for coin. You learn the road ahead.", hp:0, flag:"road_news" },
          { label:"Wait for the water to fall", weight:6, valence:"neutral", text:"You lose half a day but cross dry and safe when the flood eases.", hp:0 },
        ] } },
    sub:{
      downstream:{ text:"You wash up far from the crossing, on a stranger's shore, having lost your bearings.",
        spin:{ prompt:"Get your bearings.", stat:"wis",
          options:[
            { label:"Follow the water", weight:9, valence:"good", text:"You trace the bank to a fishing hamlet and warm yourself by a stranger's fire.", hp:3, loc:"coast" },
            { label:"Cut inland", weight:8, valence:"neutral", text:"You push into the trees and eventually strike a known road.", hp:-2, loc:"forest" },
          ] } },
    } },

  /* ===================== CITY (EDO / KYOTO) =========================== */
  { id:"gambling", title:"The Gambling Den", loc:["city","edo","kyoto"], circles:["any"], weight:8,
    scene:{ text:"Behind a noodle shop, dice clatter on a straw mat. The house smiles. The stakes rise.",
      spin:{ prompt:"Do you play?", stat:"cha",
        options:[
          { label:"Play it cool", weight:8, valence:"good", text:"You read the room, quit while ahead, and pocket a tidy win.", item:"Winnings purse" },
          { label:"Chase the big pot", weight:9, valence:"bad", text:"The dealer's dice are loaded. You lose your coin and a tooth arguing about it.", hp:-6 },
          { label:"Expose the cheat", weight:6, valence:"good", text:"You catch the loaded die and call it. The crowd turns on the house; you leave a folk hero.", flag:"city_reputation" },
          { label:"Walk away", weight:7, valence:"neutral", text:"You keep your purse and your teeth. Dull, but wise.", hp:0 },
        ] } } },

  { id:"market", title:"The Great Market", loc:["city","edo","kyoto","coast"], circles:["merchant","any"], weight:8,
    scene:{ text:"Stalls of silk, salt, lacquer and rumor stretch under paper lanterns. A merchant eyes your goods — or your gullibility.",
      spin:{ prompt:"Strike a deal.", stat:"cha",
        options:[
          { label:"Haggle hard", weight:10, valence:"good", text:"You out-talk the trader and walk away with profit and a useful contact.", item:"Purse of profit", comp:null },
          { label:"Invest boldly", weight:7, valence:"good", text:"You gamble on a rare shipment. A shrewd merchant partners with you, impressed.", comp:"merchant_c" },
          { label:"Get fleeced", weight:8, valence:"bad", text:"The 'genuine antique' is worthless. Lesson bought at full price.", hp:0 },
          { label:"Browse only", weight:7, valence:"neutral", text:"You window-shop the world's goods and leave with your coin intact.", hp:0 },
        ] } } },

  { id:"cityfire", title:"Flowers of Edo", loc:["edo","city"], circles:["any"], weight:6,
    scene:{ text:"'Fire! Fire!' The cry runs the wooden streets — the flames the city grimly calls its 'flowers.' A child screams from an upper window.",
      spin:{ prompt:"The fire spreads fast.", stat:"str",
        options:[
          { label:"Rush in to save them", weight:9, valence:"good", text:"You haul the child out through smoke and falling beams. The grateful family will remember your face.", hp:-7, flag:"city_reputation" },
          { label:"Organize a bucket line", weight:8, valence:"good", text:"You marshal the panicked crowd; the fire is beaten back. Order, it turns out, is a weapon.", hp:-3 },
          { label:"Flee the flames", weight:7, valence:"bad", text:"You save yourself. Behind you a scream cuts off, and something in you cools that will not warm again.", flag:"unkind" },
        ] } } },

  { id:"audience", title:"Audience at the Manor", loc:["city","edo","kyoto"], circles:["noble","warrior","entertainer","religious"], weight:6,
    scene:{ text:"A local lord grants you audience. Cushions, tea, and a dozen unspoken tests of your manners and your worth.",
      spin:{ prompt:"Comport yourself before the lord.", stat:"cha",
        options:[
          { label:"Court his favor", weight:9, valence:"good", text:"Your bearing pleases him. He offers patronage and a token of his house.", item:"Lord's token", flag:"patron" },
          { label:"Offer counsel", weight:7, valence:"good", text:"You give sharp, honest advice on his rivals. He values a straight tongue; a retainer is assigned to you.", comp:"retainer" },
          { label:"Overstep", weight:8, valence:"bad", text:"You misjudge the etiquette. He is offended; you are shown out coldly, and watched thereafter.", flag:"marked" },
        ] } } },

  { id:"assassin", title:"A Blade in the Crowd", loc:["city","edo","kyoto"], circles:["noble","warrior","criminal"], weight:5,
    scene:{ text:"In the market crush, you feel the wrongness a heartbeat before the knife — someone means you dead, here, now.",
      spin:{ prompt:"React.", stat:"wis",
        options:[
          { label:"Read the killer", weight:9, valence:"good", text:"You spot the assassin and turn the blade back. Wounded but alive, you take his mask — and a clue.", hp:-6, item:"Assassin's mask", flag:"hunted" },
          { label:"Vanish in the crowd", weight:8, valence:"good", text:"You melt into the throng and lose them. Someone powerful wants you gone.", flag:"hunted" },
          { label:"Freeze", weight:6, valence:"bad", text:"The knife finds you before you understand. You survive, barely, and bleeding.", hp:-15, flag:"hunted" },
        ] } } },

  /* ===================== RURAL / FARM ================================= */
  { id:"village_bandits", title:"The Frightened Village", loc:["rural","farm","outskirts"], circles:["any"], weight:8,
    scene:{ text:"Villagers surround you, desperate. Bandits will return at the next moon to take their harvest and their daughters. They beg you to stay.",
      spin:{ prompt:"Answer the village.", stat:"str",
        options:[
          { label:"Lead their defense", weight:9, valence:"good", text:"You drill farmers into a wall of sharpened bamboo. When the bandits come, they break on it. A grateful youth joins you.", hp:-8, comp:"ashigaru", flag:"defender" },
          { label:"Set a clever trap", weight:7, valence:"good", text:"Pits, nets, and nerve win the day with barely a scratch. The village feasts you.", hp:-2, flag:"defender" },
          { label:"Take their coin and go", weight:7, valence:"neutral", text:"You accept payment for 'scouting the road' and quietly move on. Survival before saints.", hp:0 },
          { label:"Refuse", weight:6, valence:"bad", text:"You will not spend your blood on strangers. Their curses follow you down the road like crows.", flag:"unkind" },
        ] } } },

  { id:"taxmen", title:"The Tax Collectors", loc:["rural","farm","outskirts"], circles:["any"], weight:7,
    scene:{ text:"A lord's men flog a farmer who cannot pay the rice-levy. The old man's family weeps in the mud.",
      spin:{ prompt:"Do you intervene?", stat:"cha",
        options:[
          { label:"Shame the collectors", weight:8, valence:"good", text:"You invoke duty and the lord's own honor so sharply the men back down, red-faced.", flag:"defender" },
          { label:"Pay the debt yourself", weight:7, valence:"good", text:"You settle the levy from your own purse. The village will not forget the debt of kindness.", flag:"defender" },
          { label:"Fight them off", weight:6, valence:"bad", text:"Steel solves it for a night, but now the lord's law hunts you too.", hp:-6, flag:"hunted" },
          { label:"Look away", weight:8, valence:"neutral", text:"It is not your fight. You walk on. The crying follows farther than you'd like.", hp:0 },
        ] } } },

  { id:"festival", title:"The Harvest Festival", loc:["rural","farm","shrine","kyoto"], circles:["any"], weight:6,
    scene:{ text:"Drums, lanterns, and rice-wine — a matsuri to thank the kami for the harvest. The village throws open its doors.",
      spin:{ prompt:"Join the festivities?", stat:"cha",
        options:[
          { label:"Dance and feast", weight:10, valence:"good", text:"You lose yourself in the drums and wake fed, rested, and welcome.", hp:6 },
          { label:"Perform for them", weight:7, valence:"good", text:"Your song or story earns a place of honor — and gifts pressed into your hands.", hp:3, item:"Festival gifts" },
          { label:"Drink too deeply", weight:8, valence:"bad", text:"The sake wins. You wake in a ditch, lighter of purse and heavier of head.", hp:-4 },
        ] } } },

  { id:"sickchild", title:"The Feverish Child", loc:["rural","farm","outskirts","forest"], circles:["religious","any"], weight:6,
    scene:{ text:"A farmwife blocks your path, a limp child in her arms burning with fever. No doctor for three villages.",
      spin:{ prompt:"Can you help?", stat:"wis",
        options:[
          { label:"Brew a herb remedy", weight:9, valence:"good", text:"You know the mountain herbs. By dawn the fever breaks. The family adopts you as kin in spirit.", flag:"defender" },
          { label:"Pray with them", weight:8, valence:"good", text:"You lead the household in sutras through the night. Faith, or the herb-tea you also made, wins.", flag:"blessed_prayer" },
          { label:"Admit you cannot", weight:7, valence:"neutral", text:"You are honest and gentle. Some roads have no cure at their end.", hp:0 },
        ] } } },

  /* ===================== WILD / FOREST / MOUNTAIN ===================== */
  { id:"tengu", title:"The Tengu's Test", loc:["forest","mountain","wild"], circles:["any"], weight:5,
    scene:{ text:"On a high branch perches a red-faced, long-nosed tengu, wings folded, grinning. 'A boastful traveler,' it croaks. 'Amuse me, or fall.'",
      spin:{ prompt:"Face the mountain goblin.", stat:"wis",
        options:[
          { label:"Answer its riddle", weight:8, valence:"good", text:"You untangle the tengu's word-trap. Delighted, it teaches you a secret of the sword before it flies off.", flag:"tengu_lesson", maxhp:2 },
          { label:"Show humility", weight:9, valence:"good", text:"You bow and confess your smallness. The tengu, disarmed, points you to a hidden path down the mountain.", flag:"blessed_tengu", hp:2 },
          { label:"Boast back", weight:7, valence:"bad", text:"You match its arrogance. It hurls you off the branch to teach you your true size.", hp:-12 },
        ] } } },

  { id:"wolves", title:"Wolves on the Ridge", loc:["forest","mountain","wild"], circles:["any"], weight:8,
    scene:{ text:"Yellow eyes gather in the dusk. A winter-starved wolf pack circles, patient and thin.",
      spin:{ prompt:"Survive the pack.", stat:"str",
        options:[
          { label:"Stand and fight", weight:9, valence:"good", text:"Back to a rock, you drop the lead wolf; the pack breaks. You are bitten but standing.", hp:-6 },
          { label:"Make fire and noise", weight:8, valence:"good", text:"Flame and shouting scatter them into the dark. Wisdom over ferocity.", hp:-1 },
          { label:"Run", weight:7, valence:"bad", text:"Running from wolves is how one becomes wolf-food. You barely tree yourself, torn and shaking.", hp:-13 },
          { label:"Feed them and slip away", weight:6, valence:"neutral", text:"You throw your rations wide and cross the ridge while they squabble. Hungry, but whole.", hp:-2 },
        ] } } },

  { id:"hermit", title:"The Mountain Hermit", loc:["forest","mountain","wild","shrine"], circles:["any"], weight:6,
    scene:{ text:"A hut of bark and moss. Inside, an ancient hermit stirs a pot and does not seem surprised to see you.",
      spin:{ prompt:"Sit with the hermit.", stat:"wis",
        options:[
          { label:"Ask for wisdom", weight:9, valence:"good", text:"He speaks in riddles that untangle in your chest. You leave sharper of mind and calmer of heart.", maxhp:2, flag:"hermit_taught" },
          { label:"Share your food", weight:8, valence:"good", text:"You give freely; he gives back a pouch of healing herbs and a warm night's rest.", hp:8, item:"Healing herbs" },
          { label:"Demand directions", weight:7, valence:"neutral", text:"He points a bony finger down the mountain and returns to his pot. Fair enough.", hp:0 },
          { label:"Rob him", weight:5, valence:"bad", text:"There is nothing to steal but a curse, which you earn. Your luck sours for days.", flag:"cursed_hermit" },
        ] } } },

  { id:"woods_shrine", title:"The Forgotten Shrine", loc:["forest","mountain","wild"], circles:["any"], weight:6,
    scene:{ text:"Vermilion paint peeling, a small shrine leans among the roots — abandoned, but the air around it holds its breath.",
      spin:{ prompt:"At the forgotten shrine...", stat:"wis",
        options:[
          { label:"Clean and pray", weight:9, valence:"good", text:"You sweep the leaves and bow. Something old and grateful settles over you like a warm cloak.", hp:5, flag:"blessed_shrine" },
          { label:"Leave an offering", weight:8, valence:"good", text:"You leave rice and coin. In the morning, a fine talisman lies where the coin had been.", item:"Kami's talisman", flag:"blessed_shrine" },
          { label:"Take its offerings", weight:6, valence:"bad", text:"You pocket the old coins. The forest goes silent, then very much not. You leave at a run.", hp:-7, flag:"cursed" },
        ] } } },

  { id:"forest_ninja", title:"Shadows in the Cedars", loc:["forest","mountain"], circles:["warrior","criminal","noble","any"], weight:5,
    scene:{ text:"The birds stop. That is the only warning — then figures in grey drop from the canopy, blades reversed for a silent kill.",
      spin:{ prompt:"Ambushed by shinobi!", stat:"wis",
        options:[
          { label:"Turn the ambush", weight:8, valence:"good", text:"You read their angles and break their formation. One survivor bows to your skill and offers service.", hp:-7, comp:"shinobi_c" },
          { label:"Fight blind", weight:8, valence:"bad", text:"You cannot see them all. Steel finds you thrice before they withdraw, purpose unknown.", hp:-14, flag:"hunted" },
          { label:"Throw smoke and flee", weight:7, valence:"neutral", text:"You blind them with a fistful of dirt and vanish into the ferns. Whoever sent them will try again.", hp:-3, flag:"hunted" },
        ] } } },

  /* ===================== RIVER / COAST ================================ */
  { id:"ferryman", title:"The Old Ferryman", loc:["river","coast"], circles:["any"], weight:7,
    scene:{ text:"A stooped ferryman waits by his flat boat. 'Six mon to cross,' he rasps, 'and never look back at the water. Bad luck, looking back.'",
      spin:{ prompt:"Cross with the ferryman.", stat:"cha",
        options:[
          { label:"Pay and chat", weight:9, valence:"good", text:"He warms to you and shares which roads ahead are safe and which are not.", flag:"road_news" },
          { label:"Honor his superstition", weight:8, valence:"good", text:"You keep your eyes forward the whole way. He nods, satisfied, and undercharges you.", hp:2 },
          { label:"Look back anyway", weight:6, valence:"bad", text:"You glance at the water — and swear you see a pale hand beneath it. The rest of your day curdles.", flag:"cursed" },
          { label:"Haggle the fare", weight:7, valence:"neutral", text:"You talk him down a few mon. He grumbles but poles you across.", hp:0 },
        ] } } },

  { id:"nanban", title:"The Foreign Ship", loc:["coast"], circles:["merchant","noble","any"], weight:5,
    scene:{ text:"A great black-hulled ship of the nanban — the southern barbarians — rides at anchor. Red-haired men trade strange goods: glass, tobacco, and iron thunder-sticks.",
      spin:{ prompt:"Approach the foreigners.", stat:"wis",
        options:[
          { label:"Trade shrewdly", weight:8, valence:"good", text:"You bargain in gestures and coin and come away with a matchlock — a weapon that will change everything.", item:"Nanban matchlock", flag:"has_gun" },
          { label:"Learn their ways", weight:7, valence:"good", text:"A Jesuit shows you letters and a map of the wider world. Knowledge worth more than the gun.", maxhp:2, flag:"worldly" },
          { label:"Distrust them", weight:8, valence:"neutral", text:"You watch from the dock, take note, and buy nothing. Caution is a kind of profit.", hp:0 },
          { label:"Try to seize their goods", weight:5, valence:"bad", text:"Their thunder-sticks answer faster than your blade. You flee the wharf with a ball in your arm.", hp:-13 },
        ] } } },

  { id:"drowning", title:"The Drowning Man", loc:["river","coast"], circles:["any"], weight:6,
    scene:{ text:"A cry — a man thrashes in the current, going under, hand grasping at nothing.",
      spin:{ prompt:"The water is fast and cold.", stat:"str",
        options:[
          { label:"Dive in", weight:9, valence:"good", text:"You drag him ashore, both half-drowned. He is a merchant of means, and gratitude, and useful friends.", hp:-4, comp:"merchant_c" },
          { label:"Throw a rope", weight:8, valence:"good", text:"You keep your feet dry and your head clear, and haul him out clean. Wisdom saves two lives.", hp:0, flag:"road_news" },
          { label:"Hesitate", weight:6, valence:"bad", text:"You wade in too late and too clumsy. He slips away; the river takes him, and takes something from you too.", hp:-8, flag:"haunted" },
        ] } } },

  /* ===================== SACRED / SHRINE ============================== */
  { id:"purify", title:"The Purification", loc:["shrine","sacred","kyoto"], circles:["any"], weight:7,
    scene:{ text:"At the temizuya, cold spring-water waits to wash road and sin from your hands and mouth before the kami.",
      spin:{ prompt:"Perform the rite.", stat:"wis",
        options:[
          { label:"Purify with care", weight:10, valence:"good", text:"Water, breath, and stillness. You rise lighter, wounds aching less, mind clear.", hp:7, flag:"purified" },
          { label:"Rush through it", weight:8, valence:"neutral", text:"You splash and bow and hurry on. The kami, presumably, understand haste.", hp:1 },
          { label:"Skip the rite", weight:6, valence:"bad", text:"You track your road-filth to the altar itself. A priest's glare says the kami noticed.", flag:"impure" },
        ] } } },

  { id:"sohei_gate", title:"The Warrior Monks", loc:["shrine","sacred","mountain"], circles:["religious","warrior","any"], weight:6,
    scene:{ text:"Naginata-armed sōhei bar the temple road. 'The temple is at war,' the eldest says. 'Prove your worth or turn back.'",
      spin:{ prompt:"Answer the warrior monks.", stat:"str",
        options:[
          { label:"Spar for passage", weight:9, valence:"good", text:"You cross staves with their champion to a respectful draw. They open the gate and share their rice.", hp:-4, flag:"temple_ally" },
          { label:"Debate scripture", weight:7, valence:"good", text:"You out-quote the eldest monk on the Lotus Sutra. Delighted, he blesses your road.", flag:"temple_ally", hp:2 },
          { label:"Force the gate", weight:6, valence:"bad", text:"You will not be a match for a wall of glaives. You retreat, bleeding and humbled.", hp:-12 },
        ] } } },

  { id:"oracle", title:"The Oracle's Divination", loc:["shrine","sacred"], circles:["any"], weight:6,
    scene:{ text:"A miko kneels before you, sacred paper and bell in hand, ready to read your fortune in the kami's answer.",
      spin:{ prompt:"Receive the divination.", stat:"wis",
        options:[
          { label:"Great blessing (Dai-kichi)", weight:6, valence:"good", text:"The lots fall to the best omen. Fortune bends toward you for the road ahead.", flag:"blessed_omen", maxhp:2 },
          { label:"Small blessing", weight:10, valence:"neutral", text:"A modest, honest omen: patience rewarded, pride punished. You tie the slip to the shrine tree.", hp:1 },
          { label:"Curse (Kyō)", weight:8, valence:"bad", text:"The worst lot. The miko frowns and murmurs a prayer to soften what is coming.", flag:"ill_omen" },
        ] } } },

  { id:"hero_grave", title:"The Hero's Grave", loc:["shrine","sacred","wild","mountain"], circles:["warrior","noble","any"], weight:5,
    scene:{ text:"A weathered stone marks the grave of a warrior fallen generations ago, still honored with fresh flowers by unknown hands.",
      spin:{ prompt:"At the hero's grave...", stat:"cha",
        options:[
          { label:"Pay respects", weight:9, valence:"good", text:"You kneel and speak your own vows aloud. The old warrior's example steadies your spine for the road.", flag:"resolved", hp:2 },
          { label:"Leave your blade overnight", weight:7, valence:"good", text:"You lay your weapon on the stone till dawn. In the morning it feels truer in the hand.", flag:"blessed_blade" },
          { label:"Take the flowers", weight:5, valence:"bad", text:"You steal the offerings for yourself. Petty theft from the honored dead earns a petty, dogging misfortune.", flag:"cursed" },
        ] } } },

  /* ===================== WARRIOR / CRIMINAL SPECIFIC ================== */
  { id:"lord_offer", title:"Service Offered", loc:["city","edo","kyoto","road"], circles:["warrior","ronin","noble"], weight:6,
    scene:{ text:"A lord's steward finds you at a teahouse. 'My master needs blades of quality. He pays in rice and land. Are you for hire?'",
      spin:{ prompt:"Consider the offer of service.", stat:"cha",
        options:[
          { label:"Accept with honor", weight:9, valence:"good", text:"You pledge your sword. A veteran retainer is assigned to test and teach you — and stays.", comp:"retainer", flag:"sworn_service" },
          { label:"Negotiate terms", weight:7, valence:"good", text:"You bargain shrewdly for a better station. He respects the spine and grants it, with a token.", item:"Lord's token", flag:"sworn_service" },
          { label:"Decline politely", weight:7, valence:"neutral", text:"You keep your freedom. The steward bows; the road stays yours.", hp:0 },
          { label:"Insult the offer", weight:5, valence:"bad", text:"Pride makes you sneer. Word spreads that you are difficult, and doors quietly close.", flag:"marked" },
        ] } } },

  { id:"rival_gang", title:"Rival Territory", loc:["city","road","outskirts"], circles:["criminal","bandit","any"], weight:6,
    scene:{ text:"You've wandered into another crew's ground. Toughs peel off the wall to surround you, cracking knuckles.",
      spin:{ prompt:"Handle the rivals.", stat:"str",
        options:[
          { label:"Show your teeth", weight:9, valence:"good", text:"You drop the biggest one and dare the rest. They decide you're more trouble than sport.", hp:-5 },
          { label:"Buy them a drink", weight:8, valence:"good", text:"You flip a coin to their boss and swap war-stories. Enemies become uneasy allies for a night.", flag:"underworld" },
          { label:"Brawl the lot", weight:7, valence:"bad", text:"Six on one is always six on one. You win the ground and lose a lot of blood.", hp:-13 },
          { label:"Slip away", weight:6, valence:"neutral", text:"You fade down an alley before it starts. No glory, no wounds.", hp:0 },
        ] } } },

  { id:"poison_plot", title:"The Poisoned Cup", loc:["city","edo","kyoto","shrine"], circles:["kunoichi","shinobi","noble","criminal"], weight:5,
    scene:{ text:"At a formal dinner, your trained eye catches it: the host's cup and the guest of honor's have been quietly switched. Poison is in the room.",
      spin:{ prompt:"What do you do with this secret?", stat:"wis",
        options:[
          { label:"Prevent the murder", weight:8, valence:"good", text:"A knocked-over cup, an apology, a life saved. The intended victim owes you a debt he cannot yet repay.", flag:"powerful_debt" },
          { label:"Let it play out", weight:7, valence:"neutral", text:"You watch history rearrange itself and say nothing. Some deaths, you judge, are not yours to stop.", flag:"witness" },
          { label:"Take the poison for leverage", weight:6, valence:"good", text:"You palm the evidence. A vial of proof is a key that opens many doors — and a few graves.", item:"Vial of poison", flag:"leverage" },
        ] } } },

  { id:"battlefield", title:"The Field After Battle", loc:["road","rural","wild","farm","outskirts"], circles:["any"], weight:6,
    scene:{ text:"You crest a rise into a field of the freshly slain — banners trampled, crows already at work. The armies have moved on, leaving this.",
      spin:{ prompt:"Cross the killing-field.", stat:"wis",
        options:[
          { label:"Take arms from the dead", weight:9, valence:"good", text:"You gather good steel and coin the dead no longer need. War provisions the survivors.", item:"Battlefield spoils" },
          { label:"Give them rites", weight:7, valence:"good", text:"You pause to pray over the fallen strangers. A wandering monk joins you and walks on at your side.", comp:"monk_frnd", flag:"honored_dead" },
          { label:"Search for survivors", weight:6, valence:"good", text:"Beneath a horse you find a living ashigaru who swears his spear to the one who dug him out.", hp:-2, comp:"ashigaru" },
          { label:"Hurry past", weight:8, valence:"bad", text:"You flee the crows and the smell. The images ride with you into your dreams.", flag:"haunted" },
        ] } } },
];
