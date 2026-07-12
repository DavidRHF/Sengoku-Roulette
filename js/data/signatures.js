/* ============================================================================
 *  signatures.js — one signature roll per station
 *  --------------------------------------------------------------------------
 *  Each station has exactly ONE encounter that only it can ever draw
 *  (`requiresStatus`), fired at most once (`once`). These are the defining
 *  moment of that life — the outcast's grim bargain, the smith's masterwork,
 *  the daimyō's war council. They carry no `loc`/`circles` gate, so they can
 *  surface anywhere on that character's road. Pushed onto DATA.encounters.
 * ========================================================================== */
(function () {
  const SIG = [

  { id:"sig_hinin", requiresStatus:"hinin", once:true, weight:9, minStep:2, art:"poison", title:"The Untouchable's Bargain",
    scene:{ text:"A magistrate's man finds you in the dark — for who else would touch the dead? There is a body that must vanish before dawn, and coin for the one with no name to lose.",
      spin:{ prompt:"Do the unclean work?", stat:"wis",
        options:[
          { label:"Make it disappear", weight:10, valence:"good", coin:18, flag:"underworld", text:"You do what no honest man will, and the magistrate owes you a silence worth more than the silver. The underworld remembers a useful ghost." },
          { label:"Demand a fair price", weight:7, valence:"good", coin:10, flag:"leverage", boostItem:"Coin purse", boostAmt:1.8, text:"You have seen his face at this work now. That is a coin you can spend later." },
          { label:"Refuse the filth", weight:6, valence:"neutral", hp:2, text:"Even the lowest may keep one thing clean. You walk away with empty hands and an unbowed neck." },
        ] } } },

  { id:"sig_beggar", requiresStatus:"beggar", once:true, weight:9, minStep:2, art:"wounded", title:"The Dying Stranger's Gift",
    scene:{ text:"A traveler collapses in the ditch where you sleep, feverish and finished. He presses a wrapped bundle into your hands and begs you to carry it to no one in particular — just onward.",
      spin:{ prompt:"What do you do?", stat:"cha",
        options:[
          { label:"Sit with him to the end", weight:10, valence:"good", item:"Coin purse", flag:"beloved", text:"You hold a stranger's hand as the road takes him. In the bundle: coin, and a note thanking a kindness he never lived to see repaid. The villages hear of it." },
          { label:"Take the bundle and go", weight:7, valence:"good", coin:14, flag:"unkind", text:"The dead have no use for silver. You do. You leave before his eyes close, richer and a little colder." },
          { label:"Fetch help", weight:6, valence:"neutral", hp:1, text:"You run for aid that comes too late, and receive only a monk's tired blessing for trying." },
        ] } } },

  { id:"sig_drunkard", requiresStatus:"drunkard", once:true, weight:9, minStep:2, art:"gamble", title:"The Bottomless Cup",
    scene:{ text:"A warlord's champion slams down a gourd and a purse: out-drink him, and both are yours. The whole wineshop leans in to watch the famous sot go to work.",
      spin:{ prompt:"Match him?", stat:"str",
        options:[
          { label:"Cup for cup, to the floor", weight:10, valence:"good", boostItem:"Sake flask", boostAmt:2.4, coin:14, item:"Sake flask", flag:"beloved", text:"Your legendary liver does what it was born to. The champion slides under the table; the room roars your name and buys the next round." },
          { label:"Pace yourself, win on wits", weight:7, valence:"good", coin:6, text:"You water your cups when no one looks and outlast him by cunning. A quieter victory, but a victory." },
          { label:"Black out first", weight:6, valence:"bad", hp:-6, coin:-4, text:"The floor rises to meet you. You wake in the gutter, lighter of purse and heavier of head." },
        ] } } },

  { id:"sig_peasant", requiresStatus:"peasant", once:true, weight:9, minStep:2, art:"gate", title:"When the Collectors Came",
    scene:{ text:"Tax-men with spears arrive at the poor field you were working, and mean to take the seed-rice too. The other landless hang back, watching to see what you will do.",
      spin:{ prompt:"Stand or bend?", stat:"cha",
        options:[
          { label:"Hide the seed, talk them down", weight:9, valence:"good", flag:"defender", coin:6, text:"You bury the seed-rice under the nightsoil where no proud samurai will dig, and send them off with the chaff. The village will not forget who fed them through winter." },
          { label:"Pay what they demand", weight:7, valence:"neutral", costCoin:8, text:"You give up your little hoard to keep your skin. The field survives; your purse does not." },
          { label:"Raise the others against them", weight:6, valence:"bad", text:"You shout of ikki, of peasants standing as one — and the spears decide to make an example of the loud one.", predicament:"conscript" },
        ] } } },

  { id:"sig_farmer", requiresStatus:"farmer", once:true, weight:9, minStep:2, art:"storm", title:"The Dike Breaks",
    scene:{ text:"A typhoon rain bursts the paddy dike the night before harvest. Water is taking the year's rice — and, downslope, threatening a neighbor's hut where a child sleeps.",
      spin:{ prompt:"What do you save?", stat:"str",
        options:[
          { label:"Save the harvest", weight:9, valence:"good", coin:20, maxhp:2, text:"You wrestle mud and water till dawn and hold the crop. Sold well, it makes you the rare peasant with silver — and a back like iron." },
          { label:"Save the child", weight:9, valence:"good", flag:"beloved", hp:-3, text:"You let the rice go and pull the neighbor's child from the flood. The harvest drowns; your name is spoken like a prayer up and down the valley." },
          { label:"Freeze, and lose both", weight:5, valence:"bad", hp:-6, coin:-6, text:"You hesitate one moment too long in the dark water, and the flood decides for you. It takes nearly everything." },
        ] } } },

  { id:"sig_fisher", requiresStatus:"fisher", once:true, weight:9, minStep:2, art:"coast", title:"The Great Catch",
    scene:{ text:"Your net snags a shoal so vast it could feed a village — but a black squall is rolling in fast, and a full net will swamp the boat.",
      spin:{ prompt:"Haul or cut?", stat:"str",
        options:[
          { label:"Haul it all in", weight:9, valence:"good", coin:16, item:"Salvaged cargo", text:"You break your back and half the boat, but you land it. The catch of a lifetime — the market can scarcely pay for it all." },
          { label:"Take half, ride the storm", weight:8, valence:"good", coin:8, text:"You cut the net at the shoulder and keep what won't drown you. Enough silver, and enough sense to spend it." },
          { label:"Capsize in the swell", weight:5, valence:"bad", hp:-8, text:"Greed and the sea are old partners. The boat goes over and the shoal goes free; you claw back to shore with nothing but your life." },
        ] } } },

  { id:"sig_woodcutter", requiresStatus:"woodcutter", once:true, weight:9, minStep:2, art:"mystic", title:"The Kami of the Old Cedar",
    scene:{ text:"Deep in the pines stands a cedar older than any lord, a straw rope about its trunk. As your axe rises, the wind stops, and something in the wood is watching.",
      spin:{ prompt:"Fell it, or bow?", stat:"wis",
        options:[
          { label:"Lay down the axe, make an offering", weight:10, valence:"good", item:"Mountain charm", flag:"blessed_shrine", text:"You bow to the old one and leave rice at its roots. A warmth settles on you like a hand; the mountain marks you as a friend." },
          { label:"Fell it for the rare timber", weight:6, valence:"bad", coin:20, flag:"hunted", text:"You take the sacred wood and a fortune with it — but something follows you out of those trees, and does not tire." },
          { label:"Back away quietly", weight:7, valence:"neutral", hp:2, text:"Some trees are not yours to take. You find your firewood elsewhere and sleep easier for it." },
        ] } } },

  { id:"sig_bandit", requiresStatus:"bandit", once:true, weight:9, minStep:2, art:"bandits", title:"The Old Crew Rides Again",
    scene:{ text:"Your former gang finds you on the road, grinning through their scars. There's a fat merchant train coming through the pass tomorrow, and they've saved you a share — if you still have the stomach.",
      spin:{ prompt:"Ride with them?", stat:"str",
        options:[
          { label:"One last score", weight:9, valence:"good", item:"Bandit's purse", coin:16, text:"You take the pass like the old days — swift, ugly, and rich. Your cut is heavy and no one dies who didn't reach for a blade first." },
          { label:"Sell them to a magistrate", weight:6, valence:"good", coin:12, flag:"sworn_service", text:"You trade your crew for a pardon and a lord's coin. A cold thing to do — but the road to respectability is paved with colder." },
          { label:"Refuse, and be hunted", weight:6, valence:"bad", hp:-6, flag:"hunted", text:"You want out. They take that as a threat, and now the men who know all your tricks want you silenced." },
        ] } } },

  { id:"sig_ronin", requiresStatus:"ronin", once:true, weight:9, minStep:2, art:"court", title:"A Lord Who Would Have You",
    scene:{ text:"A minor lord, impressed by your bearing, offers what every masterless samurai secretly aches for: a name to serve, a stipend, a roof. All it costs is your freedom.",
      spin:{ prompt:"Take the oath?", stat:"cha",
        options:[
          { label:"Swear yourself to him", weight:9, valence:"good", item:"Clan crest", flag:"sworn_service", coin:10, text:"You kneel, and a wandering blade becomes a retainer once more. The crest on your back means someone, at last, will answer for you." },
          { label:"Prove your worth in a duel first", weight:8, valence:"good", boostItem:"Whetstone", boostAmt:1.8, flag:"blessed_blade", text:"You ask to be tested, and cut down his champion cleanly. He doubles the offer; your steel is spoken of after." },
          { label:"Keep your freedom", weight:6, valence:"neutral", coin:5, hp:2, text:"You bow, and decline. The open road is a hard master, but it is the only one you have chosen." },
        ] } } },

  { id:"sig_merchant", requiresStatus:"merchant", once:true, weight:9, minStep:2, art:"market", title:"Cornering the Market",
    scene:{ text:"War means shortage, and shortage means fortune. You spot a chance to buy up every bale of a scarce good before the daimyō's quartermasters do — if you dare stake it all.",
      spin:{ prompt:"How do you play it?", stat:"wis",
        options:[
          { label:"Buy the whole supply", weight:9, valence:"good", needCoin:10, costCoin:10, coinBoost:{min:40,amt:1.6}, coin:44, item:"Trade ledger", text:"You corner it, and when the armies come begging you name your price. This is how merchant houses are truly born." },
          { label:"A careful hedge", weight:8, valence:"good", coin:16, text:"You take a measured position, splitting the risk. Solid profit, no sleepless nights." },
          { label:"The market turns on you", weight:6, valence:"bad", coin:-12, text:"A rival's caravan arrives early and the price collapses. You eat the loss and a hard lesson." },
        ] } } },

  { id:"sig_smith", requiresStatus:"smith", once:true, weight:9, minStep:2, art:"fire", title:"The Masterwork Commission",
    scene:{ text:"A great lord lays gold on your anvil and asks for the finest blade you will ever make — a sword to be remembered. The forge roars. This is the work you were born for.",
      spin:{ prompt:"Forge it how?", stat:"wis",
        options:[
          { label:"Pour your soul into the steel", weight:9, valence:"good", flag:"blessed_blade", coin:22, text:"For thirty days you fold and pray over the steel. What leaves your forge is not a tool but a legend — and lords will know your name for a century." },
          { label:"Fine work, fair speed", weight:8, valence:"good", coin:14, item:"Whetstone", text:"A superb blade, delivered on time. Not immortal — but it will feed you well and keep the commissions coming." },
          { label:"Rush it, and shame the mark", weight:5, valence:"bad", flag:"marked", text:"You hurry, and the blade shatters in the lord's own hand at the demonstration. Your name is now known — for the wrong reason." },
        ] } } },

  { id:"sig_actor", requiresStatus:"actor", once:true, weight:9, minStep:2, art:"festival", title:"Command Performance",
    scene:{ text:"A daimyō commands you to dance at his banquet, before a hall of hard-eyed warlords. Please them, and doors open across the realm. Bore them, and the doors shut for good.",
      spin:{ prompt:"Dance for them.", stat:"cha",
        options:[
          { label:"Bewitch the whole hall", weight:9, valence:"good", flag:"patron", item:"Festival gifts", coin:14, text:"You move like water and firelight, and even the grim old generals forget their wars. A great lord claims you as his own; gifts rain down." },
          { label:"A safe, lovely turn", weight:8, valence:"good", coin:8, text:"You give them grace without daring, and leave to warm applause and a fair purse. No enemies made, no legends either." },
          { label:"A scandalous misstep", weight:5, valence:"bad", flag:"marked", text:"A veil slips, a lord is mocked, and the laughter curdles. You are remembered now in a way you did not want." },
        ] } } },

  { id:"sig_sohei", requiresStatus:"sohei", once:true, weight:9, minStep:2, art:"battlefield", title:"The Temple Under Siege",
    scene:{ text:"A warlord's army comes to burn your monastery for sheltering the wrong refugees. The monks look to you — the one who can wield both sutra and naginata.",
      spin:{ prompt:"How do you defend it?", stat:"str",
        options:[
          { label:"Hold the gate yourself", weight:9, valence:"good", flag:"defender", hp:-5, item:"Sutra scroll", text:"You stand in the gateway with your naginata and your prayers and you do not yield. The temple stands; the story of the monk who held the gate will outlast the warlord." },
          { label:"Parley for the refugees' lives", weight:8, valence:"good", flag:"temple_ally", boostItem:"Sutra scroll", boostAmt:1.8, text:"You walk out unarmed and bargain for the innocents. The temple loses its treasures but keeps its soul — and a powerful debt owed to you." },
          { label:"Lead the retreat", weight:6, valence:"neutral", hp:-2, text:"You get the young monks and the refugees out the mountain path as the roof burns behind you. Not a victory — but they are alive." },
        ] } } },

  { id:"sig_miko", requiresStatus:"miko", once:true, weight:9, minStep:2, art:"vision", title:"The Oracle's Trance",
    scene:{ text:"A lord kneels before your shrine and demands the kami's word on his coming battle. The presence rises in you, cold and vast. What passes your lips could change the war.",
      spin:{ prompt:"What do you speak?", stat:"wis",
        options:[
          { label:"Speak the true omen", weight:9, valence:"good", flag:"blessed_shrine", item:"Kami's talisman", hp:-2, text:"You let the kami speak through you, whole and terrible. It empties you like a poured cup — but the shrine's holiness clings to you ever after." },
          { label:"Tell him what he'll pay for", weight:6, valence:"good", coin:16, flag:"marked", text:"You give the lord the victory he wants to hear and take his gold. If the battle goes ill, he will remember whose omen it was." },
          { label:"Purify yourself in the falls", weight:8, valence:"good", flag:"purified", text:"You refuse to be used and go instead to the cold falls, washing the lord's war from your skin. You come back centered, and clean." },
        ] } } },

  { id:"sig_monk", requiresStatus:"monk", once:true, weight:9, minStep:2, art:"monk", title:"The Koan at the Crossroads",
    scene:{ text:"An old hermit sits where four roads meet and, without looking up, asks you a question with no answer: 'Which way does the wind blow when no one walks the road?'",
      spin:{ prompt:"How do you meet it?", stat:"wis",
        options:[
          { label:"Sit, and simply not-know", weight:10, valence:"good", flag:"centered", text:"You lower yourself into the dust beside him and let the question dissolve rather than solving it. When you rise, something in you has quietly come to rest." },
          { label:"Learn at his feet", weight:8, valence:"good", flag:"hermit_taught", hp:2, text:"You stay three days and three nights. The hermit teaches you nothing you can repeat and everything you needed." },
          { label:"Answer cleverly and move on", weight:6, valence:"neutral", coin:2, text:"You offer a sharp reply; he laughs, unimpressed. Cleverness, you suspect, was exactly the wrong road." },
        ] } } },

  { id:"sig_kunoichi", requiresStatus:"kunoichi", once:true, weight:9, minStep:2, art:"poison", title:"The Whispered Commission",
    scene:{ text:"A great lady summons you behind a screen. Her rival must be... embarrassed, she says, and slides across a purse and a name. In your trade, 'embarrassed' has many meanings.",
      spin:{ prompt:"Take the work?", stat:"wis",
        options:[
          { label:"Accept, and hold the secret", weight:9, valence:"good", flag:"leverage", coin:16, item:"Vial of poison", text:"You take the commission and, more valuable, her trust. A noblewoman's secret is a blade you can hold to a throat for years." },
          { label:"Work it clean and vanish", weight:8, valence:"good", flag:"underworld", coin:12, text:"You do the quiet thing and are three provinces away before dawn. The underworld notes a professional." },
          { label:"Get made", weight:5, valence:"bad", flag:"hunted", hp:-4, text:"A servant sees your face where no face should be. The commission is blown, and now two houses want you gone." },
        ] } } },

  { id:"sig_shinobi", requiresStatus:"shinobi", once:true, weight:9, minStep:2, art:"cave", title:"The Impossible Keep",
    scene:{ text:"Your handler names an unwinnable job: the war-plans locked in the highest room of an enemy castle, guarded like a daimyō's own life. The pay is a small fortune. The odds are worse.",
      spin:{ prompt:"How do you get in?", stat:"wis",
        options:[
          { label:"Over the walls in the dark", weight:9, valence:"good", flag:"witness", item:"Storehouse takings", coin:14, text:"Grapnel, shadow, held breath. You take the plans and leave nothing but an open window. What you read on the way out is worth more than the gold." },
          { label:"Walk in as someone else", weight:8, valence:"good", flag:"leverage", boostItem:"Shinobi garb", boostAmt:2.2, text:"You stroll past the guards wearing a dead man's face and a servant's tray. Cleaner than any wall-climb, and you learn every corridor." },
          { label:"Trip the alarm", weight:5, valence:"bad", text:"A loose tile, a barking dog, and the whole keep wakes. You flee empty-handed into a hunt.", predicament:"jail" },
        ] } } },

  { id:"sig_samurai", requiresStatus:"samurai", once:true, weight:9, minStep:2, art:"duel", title:"The Duel of Honor",
    scene:{ text:"A rival retainer, drunk on pride, insults your lord to your face before witnesses. There is only one answer the code allows. Steel will settle it at dawn.",
      spin:{ prompt:"Meet him at dawn.", stat:"str",
        options:[
          { label:"Cut him down cleanly", weight:9, valence:"good", flag:"blessed_blade", coin:8, text:"One breath, one step, one stroke. He is on the ground before the insult has faded from the air. Your lord's honor — and your reputation — are made whole." },
          { label:"First blood, then mercy", weight:8, valence:"good", flag:"resolved", text:"You draw first blood and stay your hand, letting him keep his life and lose his pride. Witnesses call it the act of a true samurai." },
          { label:"Underestimate him", weight:5, valence:"bad", hp:-9, text:"He is faster than his cups suggested. You win, barely, but carry his blade's answer in your side for a long while." },
        ] } } },

  { id:"sig_kuge", requiresStatus:"kuge", once:true, weight:9, minStep:2, art:"court", title:"Intrigue at the Cloud Court",
    scene:{ text:"Two factions circle the throne, and both want your ancient name behind them. A word from you in the right ear could raise a chancellor — or ruin one. Everyone is watching which way you lean.",
      spin:{ prompt:"Play the game.", stat:"cha",
        options:[
          { label:"Outmaneuver them all", weight:9, valence:"good", flag:"patron", item:"Seal of office", coin:16, text:"You let both factions believe you theirs, then hand victory to the one who will owe you most. A seal of office lands in your hands like a ripe plum." },
          { label:"Broker the peace between them", weight:8, valence:"good", flag:"leverage", cha:0, text:"You quietly reconcile the rivals and take, as your fee, a secret from each. Knowledge is the only coin that spends at court." },
          { label:"Back the losing side", weight:5, valence:"bad", flag:"hunted", text:"You misread the winds. When your faction falls, the new chancellor remembers your voice among his enemies." },
        ] } } },

  { id:"sig_daimyo", requiresStatus:"daimyo", once:true, weight:9, minStep:2, art:"war_council", title:"The War Council",
    scene:{ text:"Your generals kneel around the map-table, lamplight on their armor, waiting for your word. A rival province lies exposed. The realm — or ruin — turns on what you say next.",
      spin:{ prompt:"Give the order.", stat:"cha",
        options:[
          { label:"Strike for the whole province", weight:9, valence:"good", comp:"ashigaru", flag:"patron", coin:14, text:"You commit the army and the gamble pays: the province falls, and lesser lords hurry to swear themselves to a warlord clearly going places." },
          { label:"Consolidate and hold", weight:8, valence:"good", flag:"sworn_service", text:"You strengthen what you have rather than overreach. Your borders harden; your retainers' loyalty deepens into something like devotion." },
          { label:"A reckless overreach", weight:5, valence:"bad", hp:-6, coin:-8, text:"Ambition outruns supply. The campaign bogs down in mud and blood, and you buy a hard lesson with good men." },
        ] } } },

  { id:"sig_yamabushi", requiresStatus:"yamabushi", once:true, weight:9, minStep:2, art:"storm", title:"The Trial of the Waterfall",
    scene:{ text:"The order sets you the great austerity: to stand beneath the winter falls until the mountain speaks. The water is a hammer of ice. Most who try are carried out.",
      spin:{ prompt:"Endure it?", stat:"wis",
        options:[
          { label:"Stand until the mountain speaks", weight:9, valence:"good", flag:"centered", maxhp:3, text:"Cold beyond cold, then nothing, then a stillness at the center of the roar. You step out reborn, the world washed clean and quiet." },
          { label:"Purify and withdraw with honor", weight:8, valence:"good", flag:"purified", text:"You take the water as long as wisdom allows, then bow out whole. Cleansed, if not transformed." },
          { label:"Push past your limit", weight:5, valence:"bad", hp:-8, text:"Pride keeps you under too long. They pull you blue and senseless from the pool; the mountain's lesson is nearly your last." },
        ] } } },

  { id:"sig_sumo", requiresStatus:"sumo", once:true, weight:9, minStep:2, art:"sumo", title:"The Champion's Bout",
    scene:{ text:"The reigning champion of the province stands in the ring and points at you. A daimyō's purse and a shrine full of roaring believers hang on the next sixty seconds.",
      spin:{ prompt:"Take the ring.", stat:"str",
        options:[
          { label:"Throw the champion down", weight:9, valence:"good", item:"Wager winnings", coin:18, flag:"beloved", text:"Belt to belt, you find the angle and walk the mountain of a man out over the bales. The shrine erupts; coins and your name fly together into the air." },
          { label:"Win on cunning footwork", weight:8, valence:"good", coin:10, text:"You slip his charge and let his own weight betray him. Less roar, but the purse is the same weight." },
          { label:"Get thrown", weight:5, valence:"bad", hp:-7, text:"He is a landslide with a topknot. You land in the front row, and your pride lands harder." },
        ] } } },

  { id:"sig_physician", requiresStatus:"physician", once:true, weight:9, minStep:2, art:"plague", title:"The Lord's Fever",
    scene:{ text:"Riders drag you to a castle where a daimyō burns with a fever his own doctors have given up on. Cure him and be made; fail, and a grieving house may blame the last hands that tried.",
      spin:{ prompt:"Treat the warlord?", stat:"wis",
        options:[
          { label:"Break the fever", weight:9, valence:"good", flag:"patron", coin:20, item:"Medicine box", text:"Cool cloths, bitter draughts, three sleepless nights — and on the fourth the fever breaks. A daimyō in your debt is a roof over your head for life." },
          { label:"Ease his suffering honestly", weight:7, valence:"good", flag:"beloved", text:"You cannot save him, so you make his last days gentle and tell his family the truth. They remember the physician who did not lie." },
          { label:"Promise more than you can give", weight:5, valence:"bad", flag:"hunted", text:"You swear a cure to buy time, and when he dies anyway, the house wants the charlatan's head." },
        ] } } },

  { id:"sig_tea_master", requiresStatus:"tea_master", once:true, weight:9, minStep:2, art:"tea", title:"The Warlords' Tea",
    scene:{ text:"Two lords who have bled each other for a generation agree to meet in your tea-room — and only there, and only if you pour. A single ceremony now holds a war in its hands.",
      spin:{ prompt:"Hold the peace.", stat:"cha",
        options:[
          { label:"A flawless, wordless peace", weight:9, valence:"good", flag:"patron", coin:14, text:"Every motion is water; every silence says what words would ruin. By the last bowl the lords are trading verses, not threats. Both will remember who made it possible." },
          { label:"A humble, disarming pour", weight:8, valence:"good", flag:"temple_ally", text:"You make yourself small and the ritual vast, and the tension drains into the steam. No treaty — but no war today." },
          { label:"A single trembling hand", weight:5, valence:"bad", flag:"marked", text:"The whisk clatters at the wrong moment; the spell breaks; one lord leaves with his hand on his hilt. You are blamed for what follows." },
        ] } } },

  { id:"sig_biwa", requiresStatus:"biwa", once:true, weight:9, minStep:2, art:"biwa", title:"The Song That Names the Dead",
    scene:{ text:"At a battlefield shrine, the survivors ask you to sing the fallen to rest. You feel the restless dead crowding close as your fingers find the first cold notes.",
      spin:{ prompt:"Sing the lament.", stat:"cha",
        options:[
          { label:"Sing them all to rest", weight:9, valence:"good", flag:"laid_to_rest", item:"Festival gifts", coin:8, text:"Verse by verse you name the dead and set them down, and the weight lifts from the whole field. The living weep and press gifts upon you; something older nods, and departs." },
          { label:"A gentle, sombre air", weight:8, valence:"good", flag:"beloved", text:"Not the great lament, but enough. The mourners' grief turns soft, and they bless the blind singer who eased it." },
          { label:"A verse that wakes them", weight:5, valence:"bad", hp:-5, text:"You reach for a forbidden mode, and the dead lean closer than they should. You break off shaking, colder than before." },
        ] } } },

  { id:"sig_pirate", requiresStatus:"pirate", once:true, weight:9, minStep:2, art:"harbor", title:"The Treasure Junk",
    scene:{ text:"Word reaches you of a fat merchant junk, low in the water with foreign silver, anchored in a lonely cove with a skeleton watch. This is the score they sing about.",
      spin:{ prompt:"Take her?", stat:"str",
        options:[
          { label:"Board her in the dark", weight:9, valence:"good", item:"Salvaged cargo", coin:22, text:"Grapples, bare feet on wet deck, a short sharp scuffle — and she's yours before the watch can shout. The hold is a dragon's hoard." },
          { label:"Split it with the crew", weight:8, valence:"good", comp:"ronin_frnd", coin:12, text:"You share the plunder wide and buy a loyalty that steel can't. A hard hand joins you for the roads ahead." },
          { label:"Run her aground", weight:5, valence:"bad", hp:-7, text:"The tide turns against you and the junk grinds onto rocks, taking half the treasure to the bottom. You limp off with a fraction and a lesson." },
        ] } } },

  { id:"sig_horsemaster", requiresStatus:"horsemaster", once:true, weight:9, minStep:2, art:"cavalry", title:"The Decisive Charge",
    scene:{ text:"A battle hangs in the balance and the enemy line has a seam. Your captain's eyes find you: only cavalry can hit it in time, and only you can lead them there.",
      spin:{ prompt:"Sound the charge?", stat:"str",
        options:[
          { label:"Break their line", weight:9, valence:"good", flag:"resolved", item:"Riding crop", coin:12, text:"You take the seam at a full gallop and burst it wide, and the enemy host folds like wet paper. Songs will place you at the front of that charge." },
          { label:"Feint, then flank", weight:8, valence:"good", flag:"honored_dead", text:"You draw them out with a false rush, then take them from the side. Fewer of your riders fall — and the ones who do, fall honored." },
          { label:"Charge into a pike wall", weight:5, valence:"bad", hp:-9, text:"The seam was bait. You wheel away through a hedge of spears, and only good horsemanship brings you out alive." },
        ] } } },

  { id:"sig_jonin", requiresStatus:"jonin", once:true, weight:9, minStep:2, art:"war_council", title:"The Web of Spies",
    scene:{ text:"From the shadows you hold threads into a dozen provinces. Now two great houses both bid for the same secret you already possess — and a third would pay to know you have it.",
      spin:{ prompt:"How do you play the web?", stat:"wis",
        options:[
          { label:"Sell to the highest, twice", weight:9, valence:"good", flag:"leverage", coin:26, text:"You sell the secret to one house and the fact of the sale to the other. Two purses, and a grip on three lords who now dare not cross you." },
          { label:"Feed a careful double-cross", weight:8, valence:"good", flag:"witness", coin:10, text:"You let each house think it has turned you, and walk away holding the proof of all their treasons." },
          { label:"Get burned by your own agent", weight:5, valence:"bad", flag:"hunted", text:"A thread you trusted was already cut. The houses learn your name, and the hunter becomes the hunted." },
        ] } } },

  { id:"sig_exiled_noble", requiresStatus:"exiled_noble", once:true, weight:9, minStep:2, art:"reckoning", title:"The Road Back to the Capital",
    scene:{ text:"A courier finds you in your exile with news: the man who slandered you has enemies now, and there is a narrow path back to the capital — for one who can prove his innocence, or make his own truth.",
      spin:{ prompt:"How do you return?", stat:"cha",
        options:[
          { label:"Gather the leverage to clear your name", weight:9, valence:"good", flag:"leverage", item:"Faded finery", coin:10, text:"You collect a letter here, a bought witness there, until the slander unravels. You are not yet home — but the road no longer forbids you." },
          { label:"Turn their weapons on them", weight:8, valence:"good", flag:"witness", text:"You expose your enemy's own crimes and let the court do your work. Cold, patient, and very nearly just." },
          { label:"Make peace with exile", weight:7, valence:"neutral", flag:"centered", hp:2, text:"You read the courier's letter twice, then let it fall in the river. Some roads home cost more than the home is worth." },
        ] } } },

  { id:"sig_bandit_chief", requiresStatus:"bandit_chief", once:true, weight:9, minStep:2, art:"bandits", title:"The Mountain Domain",
    scene:{ text:"Your ragged army looks to you from the pass. Below lie a rich caravan road and a cluster of undefended villages. A lord in all but birth must decide what kind of lord he means to be.",
      spin:{ prompt:"Rule how?", stat:"cha",
        options:[
          { label:"Bleed the caravan road", weight:9, valence:"good", item:"Bandit's purse", coin:20, comp:"ashigaru", text:"You take the road for your own and tax every cart that dares it. Coin floods in, and desperate men flock to a chief who pays." },
          { label:"Take the villages under your protection", weight:8, valence:"good", flag:"beloved", text:"You offer the villages safety for tribute, and mean it. Bandit or lord — from below, the difference starts to blur, and they bless your name." },
          { label:"Overreach and provoke a daimyō", weight:5, valence:"bad", hp:-6, text:"You raid one caravan too many — one flying a great lord's colors. Now a real army is climbing your mountain." },
        ] } } },

  ];
  window.DATA = window.DATA || {};
  DATA.encounters = (DATA.encounters || []).concat(SIG);
})();
