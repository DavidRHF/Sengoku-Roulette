/* ============================================================================
 *  endings.js — the many ways a road can end
 *  --------------------------------------------------------------------------
 *  After every beat the engine walks this list in priority order (high first)
 *  and fires the first ending whose `check(S)` returns true. Death is checked
 *  first (highest priority). Achievement endings gate on `S.steps` so most need
 *  a real journey — but a few can trigger early. A forced epilogue at the step
 *  cap guarantees every road ends.
 *
 *  S = { statusId, quest, circles[], hp, maxhp, steps, str,wis,cha,
 *        has(flag)->bool, hasComp(id)->bool, compCount, itemCount,
 *        loot (count of coin/loot items), locType }
 * ========================================================================== */
window.DATA = window.DATA || {};

DATA.MAX_STEPS = 21; // the road's length; the epilogue fires here at latest

DATA.endings = [

  /* ------------------------- DEATHS (hp <= 0) ------------------------- */
  { id:"death_hunted", title:"Silenced", priority:200, tone:"bad",
    check:S => S.hp<=0 && S.has("hunted"),
    text:"The blade that had been hunting you since the capital finds its mark at last, in a quiet place with no witnesses. Whoever wanted you gone sleeps easier tonight. Your name is struck from the ledgers as though it were an error." },

  { id:"death_wild", title:"Bones on the Mountain", priority:190, tone:"bad",
    check:S => S.hp<=0 && (S.locType==="wild"),
    text:"The mountain keeps what falls upon it. Snow, then moss, then only the shape of you in the roots. In spring a woodcutter finds your blade and wonders, briefly, who you were." },

  { id:"death_generic", title:"The Road Ends Here", priority:180, tone:"bad",
    check:S => S.hp<=0,
    text:"Your strength bleeds out into the dust of a road that does not pause for you. In an age that spends lives like copper coin, yours is spent. The wheel turns on without you." },

  /* --------------------- LEGENDARY (rare, great) --------------------- */
  { id:"legend", title:"Legend of the Age", priority:120, tone:"great",
    check:S => S.steps>=14 && S.str>=17 && (S.has("blessed_blade")||S.itemCount>=4) && S.hp>=S.maxhp*0.5,
    text:"They will tell this story for a hundred years, and get most of it wrong, and it will only grow. You walked into a broken century and left your name carved across it. Whatever you set out to do, the age itself now bends around the doing of it." },

  /* --------------------- QUEST-SPECIFIC VICTORIES -------------------- */
  { id:"unify", title:"The Realm United", priority:110, tone:"great",
    check:S => S.quest==="unify" && S.steps>=14 && S.cha>=15 && (S.has("sworn_service")||S.has("patron")||S.has("powerful_debt")||S.compCount>=1),
    text:"Province by province, marriage by marriage, siege by siege, the shattered mirror is made whole in your hands. Lords who would have killed you now kneel. The wars are not over — but they are, at last, YOUR wars to end." },

  { id:"province_held", title:"A Province Held", priority:100, tone:"good",
    check:S => S.quest==="unify" && S.steps>=11,
    text:"You did not unify the realm. But when the dust settles, your borders stand, your people are fed, and your banner still flies. In this age, to hold what is yours is its own kind of victory." },

  { id:"revenge_done", title:"Vengeance, and the Ash After", priority:105, tone:"good",
    check:S => S.quest==="revenge" && (S.has("resolved")|| (S.steps>=12 && S.str>=12)),
    text:"You find the one you were hunting, and you finish it. The debt is paid in the only coin the dead accept. Standing over it, you feel not triumph but a great grey quiet — the vendetta is over, and now you must learn to live without it." },

  { id:"pilgrimage_done", title:"The Pilgrimage Fulfilled", priority:105, tone:"good",
    check:S => S.quest==="pilgrimage" && S.steps>=10 && (S.has("rested_temple")||S.has("blessed_shrine")||S.has("purified")||S.has("temple_ally")),
    text:"You kneel at last before the far shrine, road-worn and changed. The kami do not speak — they never do — but the silence answers you fully. Whatever you carried here, you set it down, and you are lighter for the whole long walk." },

  { id:"satori", title:"Satori", priority:104, tone:"great",
    check:S => (S.quest==="enlighten"||S.quest==="omen"||S.circles.includes("religious")) && S.steps>=11 && (S.has("centered")||S.has("hermit_taught")||S.has("tengu_lesson")||S.has("laid_to_rest")),
    text:"On an ordinary morning, on an ordinary road, it simply arrives: the seeing-through. The war-torn world does not change, but your grip on it opens like a hand. You walk on, and the road and the walker are, for once, the same thing." },

  { id:"fortune_made", title:"A Fortune Made", priority:100, tone:"good",
    check:S => S.quest==="fortune" && S.steps>=8 && S.loot>=2,
    text:"The gamble pays. Coin becomes goods becomes contacts becomes coin again, faster than you can spend it. You buy a warehouse, then a name, then a measure of the one thing money can rent in this age: safety. The road brought you here — and now you can afford to leave it." },

  { id:"duty_done", title:"Duty Discharged", priority:100, tone:"good",
    check:S => S.quest==="duty" && S.steps>=11 && (S.has("sworn_service")||S.has("temple_ally")||S.has("patron")),
    text:"The lacquered box is delivered, the words are said, the oath is kept whole. Giri is a heavy thing to carry and a heavier thing to set down honorably — and you have done it. Your lord's crest sits a little lighter on your back." },

  { id:"peace_sealed", title:"The Peace Sealed", priority:100, tone:"good",
    check:S => S.quest==="alliance" && S.steps>=11 && S.cha>=13,
    text:"Two houses that hungered to destroy each other now share cups, however sourly. The marriage holds, the hostages come home, the swords stay sheathed one more season. It is a fragile thing you have built — and fragile peace is still peace." },

  { id:"contract_kept", title:"The Contract Kept", priority:100, tone:"good",
    check:S => (S.quest==="contract"||S.quest==="secret") && S.steps>=10 && (S.has("leverage")||S.has("witness")||S.has("underworld")||S.has("has_gun")),
    text:"The task is done in the dark, the way such things must be, and the payment is real. No banners, no songs — only a heavier purse and a lighter conscience than you'd feared. You disappear before anyone thinks to ask your name." },

  { id:"escape_done", title:"A New Name, A New Life", priority:98, tone:"good",
    check:S => S.quest==="escape" && S.steps>=11 && !S.has("hunted"),
    text:"Far enough, at last. In a valley where no one knows your face, you set down the old life like a pack that had grown too heavy. New name, new work, new roof against the rain. The war that shaped you rumbles on somewhere beyond the hills, and you let it." },

  { id:"peoples_hero", title:"The People's Champion", priority:99, tone:"good",
    check:S => S.steps>=11 && (S.has("beloved")||S.has("defender")||S.has("city_reputation")) && !S.has("unkind"),
    text:"You never sought it, but the villages pass your name hand to hand like a warm coal. When the great lords have starved and burned the small folk, you stood between. Songs about you will outlive every castle in this valley." },

  /* --------------------- GENERAL / SURVIVAL (fallbacks) ------------- */
  { id:"survive_well", title:"Weathered and Wiser", priority:40, tone:"good",
    check:S => S.steps>=DATA.MAX_STEPS && S.hp>=S.maxhp*0.5,
    text:"No grand banner, no epic finish — just a hard year survived on a hard road, and a self you did not expect to become. You walk into the next province lean, scarred, and quietly formidable. The wheel will turn again; you will be ready." },

  { id:"survive_hard", title:"A Hard Road Survived", priority:38, tone:"neutral",
    check:S => S.steps>=DATA.MAX_STEPS,
    text:"You are alive. In this century, on these roads, that is more than most can claim, and less than you had hoped. You limp on toward whatever comes next, poorer and warier, but breathing. Sometimes that is the whole of a life's ambition." },

  /* Absolute final safety net — should never actually be needed. */
  { id:"epilogue", title:"The Wheel Turns On", priority:1, tone:"neutral",
    check:S => S.steps>=DATA.MAX_STEPS+2,
    text:"Your story folds back into the great churn of the age, one thread among a million. The wars go on. The wheel turns. Somewhere, someone else picks up a fallen blade and begins." },
];
