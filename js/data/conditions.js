/* ============================================================================
 *  conditions.js — lasting afflictions & boons the traveller carries
 *  --------------------------------------------------------------------------
 *  A condition rides with the player and shapes the road until it is cured or
 *  wears off. The engine reads these generic params:
 *    stat:{str,wis,cha}   — modifies EFFECTIVE stats while held
 *    luck:N               — adds/subtracts fortune
 *    perEncounter:{hp,coin}— applied after every trial (poison drain, regen…)
 *    block:N              — absorbs the next N damaging blows (a ward/shield)
 *    instant:{hp,maxhp,coin}— one-time on gain (a hardy frame, a heavy purse…)
 *    duration:N           — wears off after N steps (0/absent = until cured)
 *  kind: good | bad | neutral  (colours the panel; cures target the "bad" ones)
 * ========================================================================== */
window.DATA = window.DATA || {};
DATA.conditions = {
  // ---- boons -------------------------------------------------------------
  shielded:       { name:"Shielded",        kind:"good", block:2,
    desc:"A spirit-ward turns aside the next 2 blows you would take." },
  blessed:        { name:"Blessed",         kind:"good", perEncounter:{hp:1},
    desc:"A kami's favour mends you a little after every trial." },
  hardy:          { name:"Hardy",           kind:"good", instant:{maxhp:12},
    desc:"An iron constitution — you can take far more punishment." },
  emboldened:     { name:"Emboldened",      kind:"good", stat:{str:3},
    desc:"War-fury quickens your arm (+3 Strength)." },
  clear_minded:   { name:"Clear-Minded",    kind:"good", stat:{wis:3},
    desc:"A still mind sees every trap (+3 Wisdom)." },
  silver_tongued: { name:"Silver-Tongued",  kind:"good", stat:{cha:3},
    desc:"Words fall from you like honey (+3 Charisma)." },
  lucky_star:     { name:"Lucky Star",      kind:"good", luck:3,
    desc:"Fortune walks a step ahead of you." },
  well_provisioned:{ name:"Well-Provisioned",kind:"good", instant:{coin:24},
    desc:"You set out with a heavy purse (+24 mon)." },
  // ---- banes -------------------------------------------------------------
  poisoned:       { name:"Poisoned",        kind:"bad", perEncounter:{hp:-1},
    desc:"Venom in your veins — you lose 1 life after every trial until cured." },
  broken_leg:     { name:"Broken Leg",      kind:"bad", stat:{str:-3},
    desc:"A shattered leg; every struggle is uphill (−3 Strength)." },
  feverish:       { name:"Feverish",        kind:"bad", perEncounter:{hp:-1}, stat:{wis:-2},
    desc:"Fever clouds your mind and drains you (−2 Wisdom, −1 life each trial)." },
  haunted_spirit: { name:"Haunted",         kind:"bad", stat:{cha:-3},
    desc:"Restless dead cling to you; people shy away (−3 Charisma)." },
  cursed:         { name:"Cursed",          kind:"bad", perEncounter:{hp:-1}, luck:-3,
    desc:"A curse dogs your every step (ill fortune, −1 life each trial)." },
  in_debt:        { name:"In Debt",         kind:"bad", instant:{coin:-12}, perEncounter:{coin:-1},
    desc:"You owe dangerous people; the interest never sleeps." },
  // ---- neither here nor there -------------------------------------------
  battle_scarred: { name:"Battle-Scarred",  kind:"neutral", stat:{str:2, cha:-2},
    desc:"Old wounds harden you and unsettle others (+2 Strength, −2 Charisma)." },
  fox_touched:    { name:"Fox-Touched",     kind:"neutral", luck:2, stat:{wis:-1},
    desc:"A kitsune's mischief follows you — lucky, but muddled (+fortune, −1 Wisdom)." },
};

// the ~dozen fates that can land on the Random Conditions wheel (good/bad/neutral mix)
DATA.conditionWheel = [
  "shielded", "hardy", "emboldened", "lucky_star", "blessed",
  "poisoned", "broken_leg", "feverish", "cursed", "in_debt",
  "battle_scarred", "fox_touched",
];
