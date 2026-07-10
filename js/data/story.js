/* ============================================================================
 *  story.js — Beginning story paths (the "why you walk the road")
 *  --------------------------------------------------------------------------
 *  An intro is eligible for a status if the status's id OR any of its circles
 *  appears in the intro's `for` list ("any" matches everyone). Because circles
 *  are shared, a peasant and a drunkard fish from the same "low" pool — their
 *  roads genuinely intertwine. The engine guarantees each status ≥10 eligible
 *  openings by combining circle beats + a few universal ones.
 *
 *  `quest` is the run's driving goal; it colors encounters and can decide the
 *  ending. `flag` sets a starting story flag.
 * ========================================================================== */
window.DATA = window.DATA || {};

DATA.storyIntros = [
  /* ---- LOW / OUTCAST / PEASANT --------------------------------------- */
  { id:"famine", for:["low","peasant","outcast"], quest:"survive",
    text:"A third year of famine. The lord's tax-men took the seed-rice itself. You leave the dying village to find food or a merciful death." },
  { id:"levy", for:["low","peasant"], quest:"escape",
    text:"Recruiters came at dawn to press every able body into the war-host. You slipped out the paddy-ditch before they counted you. Now you are a runaway, and the road is watching." },
  { id:"burned", for:["low","peasant","outcast","wanderer"], quest:"revenge",
    text:"Retreating soldiers burned your hamlet for sport. You buried what you could and kept one thing: the crest on a fallen banner. You mean to find the man who flew it." },
  { id:"debt", for:["low","entertainer","criminal"], quest:"escape",
    text:"You owe a moneylender more than your life is worth, and his men carry clubs, not abacuses. Kyoto is behind you. Everything else is ahead." },
  { id:"pilgrim_poor", for:["low","peasant","religious","wanderer"], quest:"pilgrimage",
    text:"You have nothing to give the world but your feet. You vow a pilgrimage to a distant shrine, begging your bread, trusting the kami to sort the rest." },

  /* ---- CRIMINAL / OUTLAW --------------------------------------------- */
  { id:"lastjob", for:["criminal","bandit"], quest:"fortune",
    text:"The band wants one more raid on the highway before the snows. You have a bad feeling and a good blade. One more, then you vanish." },
  { id:"bounty", for:["criminal","wanderer"], quest:"escape",
    text:"A magistrate has posted your face at every barrier-gate. The reward is generous enough that even friends are eyeing your neck. Keep moving." },
  { id:"contract", for:["shinobi","kunoichi","criminal"], quest:"contract",
    text:"A sealed letter, a fat purse, a target three provinces away. The client is nameless and the deadline is the next full moon. You have taken worse." },

  /* ---- WARRIOR / RONIN / SAMURAI ------------------------------------- */
  { id:"masterless", for:["warrior","ronin"], quest:"duty",
    text:"Your lord's castle fell and his line ended. Honor says you should have died with him. Instead you live, masterless, seeking a cause worthy of your two swords." },
  { id:"duel", for:["warrior"], quest:"duel",
    text:"A famed swordsman insulted your school. You ride to answer him, though half the road says he has never lost. A duel is a kind of prayer." },
  { id:"orders", for:["samurai","noble","warrior"], quest:"duty",
    text:"Your lord hands you a lacquered box and a name. Deliver the one, watch the other, ask nothing. Giri — duty — closes your mouth and points you down the Tōkaidō." },
  { id:"vendetta", for:["warrior","noble","ronin"], quest:"revenge",
    text:"Katakiuchi: a sanctioned vendetta. The man who killed your father lives under another lord's protection. The law permits your revenge — if you can reach him." },

  /* ---- MERCHANT / ARTISAN -------------------------------------------- */
  { id:"caravan", for:["merchant"], quest:"fortune",
    text:"You have staked everything on one caravan of silk and salt. Reach the far market before your rivals and you are made; lose it to bandits or rivers and you are ruined." },
  { id:"ledger", for:["merchant","criminal"], quest:"secret",
    text:"A ledger fell into your hands — proof that a great lord is smuggling firearms. Such a page is worth a fortune or a funeral. You decide which as you travel." },
  { id:"commission", for:["artisan","smith"], quest:"duty",
    text:"A daimyō has commissioned a blade worthy of a legend, and given you the steel and the deadline. Fail, and no forge in the land will hire you again." },
  { id:"forge_theft", for:["artisan","smith"], quest:"revenge",
    text:"A rival guild stole your finest blade and your reputation with it. You set out to reclaim both, hammer-hardened and quietly furious." },

  /* ---- RELIGIOUS ----------------------------------------------------- */
  { id:"relic", for:["religious"], quest:"pilgrimage",
    text:"A sacred relic must be carried to a mountain temple before the festival, past provinces at war. The abbot chose you. The kami, it seems, agree." },
  { id:"heresy", for:["religious","sohei"], quest:"duty",
    text:"A warlord has begun burning temples that will not bow. Your order sends you to rally the faithful — or to martyr yourself trying." },
  { id:"omen", for:["religious","miko","monk"], quest:"omen",
    text:"You dreamed the same black-sun dream three nights running. It points east, toward a lord who does not yet know he is doomed. You go to warn, or to witness." },
  { id:"enlighten", for:["religious","monk"], quest:"enlighten",
    text:"Your teacher's last koan sent you walking with no destination but understanding. The road itself is the practice." },

  /* ---- NOBLE / COURT ------------------------------------------------- */
  { id:"marriage", for:["noble","kuge"], quest:"alliance",
    text:"A marriage-alliance must be sealed between two houses that would rather war. You carry the letters and the fragile peace, and both would be simple to break." },
  { id:"intrigue", for:["noble","kuge","entertainer"], quest:"secret",
    text:"A whisper at court says the shōgun's health is failing and the succession is open. You leave the capital to weigh which lord to back — before the wrong one wins." },
  { id:"unify", for:["daimyo"], quest:"unify",
    text:"The realm is a shattered mirror of warring provinces. You mean to be the one who reassembles it — by marriage, by gold, or by the spear. Today you ride to secure your borders." },
  { id:"hostage", for:["daimyo","noble","warrior"], quest:"alliance",
    text:"Your heir sits as a 'guest'-hostage in a rival's castle, guaranteeing a peace nobody trusts. You travel to renegotiate the terms — or to steal your child back." },

  /* ---- ENTERTAINER --------------------------------------------------- */
  { id:"patron", for:["entertainer","noble"], quest:"fortune",
    text:"A powerful patron summons you to perform at his mountain villa. Such favor lifts a career — or ends one, if the wine and politics turn sour." },
  { id:"song_spy", for:["entertainer","criminal","kunoichi"], quest:"secret",
    text:"Behind your fan and your songs, you gather what lords let slip when they are charmed and drunk. Someone is paying handsomely for their loose tongues." },

  /* ---- WANDERER (broad) ---------------------------------------------- */
  { id:"stranger", for:["wanderer","low","warrior"], quest:"fortune",
    text:"You woke on the roadside with a lump on your skull and no memory of how you came here — only a road, a direction, and a stubborn will to keep walking." },
  { id:"rumor_gold", for:["wanderer","merchant","criminal","low"], quest:"fortune",
    text:"Every teahouse repeats it: a fallen lord's war-chest, buried when his army broke. Half the road is hunting it. Why not you?" },

  /* ---- UNIVERSAL (tops up any thin status) --------------------------- */
  { id:"war_comes", for:["any"], quest:"survive",
    text:"Two great houses are marching to meet each other, and your home lies squarely between their banners. Staying is death. You take the road while there is a road to take." },
  { id:"letter", for:["any"], quest:"duty",
    text:"A dying traveler pressed a sealed letter into your hands with a name and a place — 'before the new moon.' You could burn it. Instead you go." },
  { id:"strange_sky", for:["any"], quest:"omen",
    text:"A comet hangs over the capital and every priest reads it as ruin. Whatever is coming, you would rather meet it moving than waiting." },
  { id:"new_life", for:["any"], quest:"fortune",
    text:"There is nothing left for you here but ghosts and taxes. You shoulder what you own and set out to make a different life, or die trying to." },

  /* ---- ARTISAN (thin circle — enriched) ------------------------------ */
  { id:"guild_summons", for:["artisan","smith","merchant"], quest:"fortune",
    text:"The guild summons you to the capital to prove your craft against its finest. Win, and your name is made across the provinces; lose, and you go home a footnote." },
  { id:"master_dying", for:["artisan","smith"], quest:"duty",
    text:"Your old master is dying, and his last request is a strange one: carry his greatest unfinished work to a mountain temple and complete it there. You cannot refuse a dying teacher." },
  { id:"cursed_steel", for:["artisan","smith","warrior"], quest:"omen",
    text:"The blade you forged has been returned — its owner dead, the steel whispering. They say your work is cursed. You set out to unmake, or understand, what your hands have wrought." },

  /* ---- RELIGIOUS (thin circle — enriched) ---------------------------- */
  { id:"lost_scripture", for:["religious","monk","miko"], quest:"pilgrimage",
    text:"A scripture thought lost for a century has surfaced in a war-torn province. Your order sends you to recover it before the fighting turns it to ash." },
  { id:"false_prophet", for:["religious","sohei","monk"], quest:"duty",
    text:"A false prophet gathers desperate peasants into a doomed rebellion in your master's name. You go to stop the rising — with words if you can, with steel if you must." },

  /* ---- ADDITIONAL UNIVERSALS (top up every station) ------------------ */
  { id:"plague_road", for:["any"], quest:"survive",
    text:"A wasting sickness empties the villages behind you. You flee ahead of it down the road, carrying only your health and the hope of staying that way." },
  { id:"gold_road", for:["any"], quest:"fortune",
    text:"A dying prospector's map, half-burned but readable, points to river-gold in the far mountains. Foolish to trust it. You go anyway." },
  { id:"exile_road", for:["any"], quest:"escape",
    text:"You have been quietly, politely, absolutely exiled. Cross the province border by the new moon, they said, or be crossed off entirely. You walk." },
  { id:"dream_road", for:["any"], quest:"omen",
    text:"A dream you cannot shake shows a road, a bridge, and a choice. You wake certain it is a summons, and set out to meet whatever waits at the crossing." },
  { id:"ruined_road", for:["any"], quest:"fortune",
    text:"Your livelihood burned with the last raid. Everything you were is smoke now — so you go looking for everything you might yet become." },
];
