/* ============================================================================
 *  predicaments.js — when a roll goes truly wrong
 *  --------------------------------------------------------------------------
 *  A bad outcome can set `predicament:"jail"` (etc.) on its option. The engine
 *  then drops the player into one of these self-contained sequences — each its
 *  own wheel with its own escape / bribe / serve-your-time branches — before
 *  the journey resumes. Options use the ordinary effect keys plus two control
 *  keys:  `escape:true` (leave the predicament, back to the road) and
 *  `freeText` (a line logged on release).  `goto` jumps to another scene here.
 *
 *  Every predicament is guaranteed to terminate: unresolved options loop
 *  "another day" up to `maxDays`, after which `forced` fires a release scene.
 * ========================================================================== */
window.DATA = window.DATA || {};

DATA.predicaments = {

  /* ---------------------------- THE CELL ---------------------------- */
  jail: {
    title: "Thrown in the Cage", maxDays: 3, forced: "turned_loose",
    scenes: {
      entry: {
        text: "Iron, straw, and the stink of the men before you. A magistrate's holding-cage — and no one who knows your name knows you are here.",
        spin: { prompt: "How do you get out of this cell?", stat: "wis",
          options: [
            { label:"Bribe the jailer", weight:11, valence:"good", needCoin:12, costCoin:12, coinBoost:{min:30,amt:1.6}, escape:true,
              text:"You press your purse through the bars.", freeText:"A door is left unlatched at the turning of the watch. You are gone before the bell." },
            { label:"Show your seal", weight:12, valence:"good", needItem:"Seal of office", escape:true,
              text:"You demand the magistrate read your seal.", freeText:"Rank ends the matter. They all but apologize as they open the gate." },
            { label:"Slip the old lock", weight:8, valence:"good", boostItem:"Grappling hook", boostAmt:2.2, escape:true,
              text:"The lock is older than the war.", freeText:"It gives to patient fingers, and the night takes you over the wall." },
            { label:"Endure to judgment", weight:8, valence:"neutral", goto:"judgment",
              text:"You keep your head down and wait for the magistrate's court." },
            { label:"Beaten by the guards", weight:7, valence:"bad", hp:-8,
              text:"A bored jailer takes exception to your face, and his fists make the point." },
            { label:"Gaol-fever", weight:6, valence:"bad", hp:-6,
              text:"The damp straw breeds sickness, and it settles in your chest." },
          ] } },
      judgment: {
        text: "You are hauled blinking into the magistrate's court. He is tired, and looking for a reason.",
        spin: { prompt: "Plead your case.", stat: "cha",
          options: [
            { label:"Talk yourself free", weight:8, valence:"good", escape:true,
              text:"You untangle the charge thread by thread.", freeText:"The magistrate waves you out with a warning and a scowl." },
            { label:"Name a patron", weight:8, valence:"good", boostItem:"Clan crest", boostAmt:2.2, escape:true,
              text:"You invoke a name that carries weight.", freeText:"Rather than cross your house, he releases you." },
            { label:"Sentenced to labor", weight:9, valence:"bad", hp:-4, flag:"marked", escape:true,
              text:"Guilty enough. Weeks of road-work under the whip.", freeText:"At length they turn you loose at the gate — thinner, harder, and marked in the books." },
            { label:"A ruinous fine", weight:6, valence:"bad", consume:"Coin purse", hp:-2, escape:true,
              text:"Freedom has a price, and it empties your sleeves.", freeText:"Paid to the last mon, you stumble out into the street." },
          ] } },
      turned_loose: {
        text: "The magistrate never comes; the jailers tire of feeding you. One grey dawn they simply drag you to the gate and throw you into the mud of the road.",
        hp:-3, flag:"marked", escape:true,
        freeText:"Free — footsore, filthy, and wiser about the inside of a cell." },
    },
  },

  /* --------------------------- HELD FOR RANSOM --------------------- */
  ransom: {
    title: "Taken for Ransom", maxDays: 3, forced: "the_reckoning_price",
    scenes: {
      entry: {
        text: "You wake bound wrist and ankle in a bandit camp. 'Someone will pay for you,' the scar-faced chief grins, tossing your own blade hand to hand, 'or the crows eat well.'",
        spin: { prompt: "How do you get free of them?", stat: "cha",
          options: [
            { label:"Buy your own freedom", weight:11, valence:"good", needCoin:20, costCoin:20, coinBoost:{min:40,amt:1.6}, escape:true,
              text:"You offer your purse as your own ransom.", freeText:"The chief laughs at the joke of it, takes the coin, and cuts you loose." },
            { label:"Vanish in smoke", weight:9, valence:"good", needItem:"Smoke bombs", consume:"Smoke bombs", escape:true,
              text:"You still have a charge they never found.", freeText:"White smoke, a scramble, and the mountain dark swallows you whole." },
            { label:"Talk them onto a richer mark", weight:8, valence:"good", escape:true,
              text:"You spin a tale of a fat merchant train two valleys over.", freeText:"Half-convinced, they cut you loose to guide them — and you lose them at the ford." },
            { label:"A beating for your struggling", weight:8, valence:"bad", hp:-9,
              text:"You fight the ropes and earn fists and boot-heels for it." },
            { label:"Marched deeper into the hills", weight:6, valence:"bad", hp:-3, goto:"the_reckoning_price",
              text:"No ransom answers. They drag you up to their mountain lair to settle accounts." },
          ] } },
      the_reckoning_price: {
        text: "No coin has come for you, and the chief's patience is a purse with a hole in it. Tonight it ends, one way or another.",
        spin: { prompt: "Settle the account.", stat: "str",
          options: [
            { label:"Cut your way clear", weight:8, valence:"good", boostItem:"Whetstone", boostAmt:2.0, escape:true, hp:-6, item:"Ambusher's spoils",
              text:"You get a hand to a fallen guard's blade.", freeText:"You carve a bloody door out of the camp and do not look back." },
            { label:"A guild pays your bond", weight:6, valence:"good", escape:true, flag:"powerful_debt",
              text:"A merchant's guild, or a grudging kinsman, sends the silver.", freeText:"You are freed — and in debt now to someone who will remember it." },
            { label:"Sold to a labor gang", weight:8, valence:"bad", hp:-5, flag:"marked", escape:true,
              text:"They sell you down the road like a sack of rice.", freeText:"Weeks of breaking stone later, you slip your chain and limp free — poorer and scarred." },
            { label:"Left bound on the mountain", weight:3, valence:"bad", hp:-14, escape:true,
              text:"They tire of you and leave you roped to a pine for the cold and the crows.", freeText:"By first light you have worked the ropes raw and are free — barely." },
          ] } },
    },
  },

  /* -------------------------- PRESSED INTO WAR -------------------- */
  conscript: {
    title: "Pressed into the Levy", maxDays: 2, forced: "the_next_siege",
    scenes: {
      entry: {
        text: "A passing army is short of bodies. Rough hands shove a bamboo spear at you and a sergeant bawls you into the back rank. You are a soldier now, whether you like it or not.",
        spin: { prompt: "How do you get out of the ranks?", stat: "str",
          options: [
            { label:"Desert in the night", weight:9, valence:"good", boostItem:"Smoke bombs", boostAmt:2.0, escape:true,
              text:"You wait for the sentries to drowse.", freeText:"Between one torch and the next, you melt into the dark and are gone." },
            { label:"Buy your name off the muster", weight:9, valence:"good", needCoin:14, costCoin:14, escape:true,
              text:"A quiet word and a heavier purse for the sergeant.", freeText:"Your name quietly leaves the roll, and you leave the camp." },
            { label:"Distinguish yourself, then go", weight:7, valence:"good", escape:true, item:"Battlefield spoils", comp:"ashigaru",
              text:"You fight well enough in the skirmish to be noticed.", freeText:"When the field is won you are let go with spoils — and a foot-soldier who liked your nerve tags along." },
            { label:"Wounded in the first charge", weight:8, valence:"bad", hp:-11, escape:true,
              text:"A spear finds you as the lines crash together.", freeText:"Left for dead as the army rolls on, you crawl free of the field — bleeding, but loose." },
            { label:"Marched to the next siege", weight:6, valence:"bad", hp:-4, goto:"the_next_siege",
              text:"The battle is a draw. The army keeps you for another hard, hungry day." },
          ] } },
      the_next_siege: {
        text: "Another wall, another ditch, another sergeant's whistle. But in the chaos of the assault, the ranks come apart — and so does their hold on you.",
        spin: { prompt: "Seize the chaos.", stat: "wis",
          options: [
            { label:"Slip away in the smoke", weight:9, valence:"good", escape:true,
              text:"You drop the spear and go the other way.", freeText:"Amid the burning and the screaming, no one counts one missing conscript. You are free." },
            { label:"Loot and run", weight:7, valence:"good", escape:true, item:"Battlefield spoils",
              text:"You take what the fallen no longer need on your way out.", freeText:"Richer by a dead man's purse, you clear the walls and keep walking." },
            { label:"Caught in the breach", weight:7, valence:"bad", hp:-12, escape:true,
              text:"The defenders' arrows do not care which side pressed you.", freeText:"You drag yourself from the rubble when it is over — alive, and done with soldiering." },
          ] } },
    },
  },

};
