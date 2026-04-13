/* ==============================================
   CHARACTERS DATA
   Each entry represents one character you can
   choose to fight in B2: Battle Selection.

   REQUIRED FIELDS:
   ─────────────────────────────────────────────
   name        — display name shown on hover & Dream Ready
   img         — portrait image path (shown in B2 grid + Dream Ready left portrait)
                 leave '' for a placeholder until you have art
   cardId      — the id of this character's CH card in CARDS[]
                 used to look up their card pool (ev cards etc.)
   dazedImg    — portrait image for the Dazed version
                 shown on Dream Ready right portrait + Second Chance overlay
   dazedName   — display name for the Dazed (e.g. 'Dazed Sparrow')
   dazedCardId — the id of this character's DA card in CARDS[]
                 used to set enemy HP and portrait in Second Chance
   dialogue    — array of strings the enemy says at battle start
                 each string types out letter-by-letter, pauses 5s, then next line
   ============================================= */
const CHARACTERS = [
  // ── TEMPLATE — copy this block for each character you add ──────────
  // {
  //   name:        'Sparrow',
  //   img:         'assets/chars/sparrow.png',
  //   cardId:      '001-HS-CH1',
  //   dazedImg:    'assets/chars/sparrow_dazed.png',
  //   dazedName:   'Dazed Sparrow',
  //   dazedCardId: '003-HS-DA1',
  //   dialogue: [
  //     'You dare enter my dream?',
  //     'I will show you true darkness!',
  //   ],
  // },
  // ── PLACEHOLDERS — replace these with your real characters ─────────
  { name: 'Character 01', img: '', cardId: '', dazedImg: '', dazedName: 'Dazed 01', dazedCardId: '', dialogue: ['...'] },
  { name: 'Character 02', img: '', cardId: '', dazedImg: '', dazedName: 'Dazed 02', dazedCardId: '', dialogue: ['...'] },
  { name: 'Character 03', img: '', cardId: '', dazedImg: '', dazedName: 'Dazed 03', dazedCardId: '', dialogue: ['...'] },
  { name: 'Character 04', img: '', cardId: '', dazedImg: '', dazedName: 'Dazed 04', dazedCardId: '', dialogue: ['...'] },
  { name: 'Character 05', img: '', cardId: '', dazedImg: '', dazedName: 'Dazed 05', dazedCardId: '', dialogue: ['...'] },
  { name: 'Character 06', img: '', cardId: '', dazedImg: '', dazedName: 'Dazed 06', dazedCardId: '', dialogue: ['...'] },
  { name: 'Character 07', img: '', cardId: '', dazedImg: '', dazedName: 'Dazed 07', dazedCardId: '', dialogue: ['...'] },
];

/* ==============================================
   SKILL PARENT MAP
   ============================================= */
const SKILL_PARENT_MAP = {
  'CHS':  'CH',
  'CHSS': 'CH',
  'DZS':  'DZ',
  'DZSS': 'DZ',
  'DAS':  'DA',
  'DASS': 'DA',
};

/* ==============================================
   CARDS DATA

   FIELD REFERENCE
   ─────────────────────────────────────────────
   id            — Unique card ID. Convention: '001-MCS-CH1'
   name          — Card name
   title         — Card subtitle / flavour title
   type          — Card type (see TYPE GUIDE below)
   set           — Set code: OHS, MCS, HS, GS
   era           — Era string e.g. '50 BME' (CH / DA / LO cards)
   territory     — Territory name from TERRITORY_MAP
                   (auto-fills zone & energy for CH/DA/LO cards)
   atk/def/hp/shd — Combat stats (CH, DZ, DA cards only)
   eg            — Energy cost 1–4
   specialLetters — Letters that can join other words e.g. ['S']
   mergedLetters  — Letters already joined (usually [])
   description   — Card rules text
   img           — Path to card art e.g. 'assets/cards/sparrow.png'
   isDefault     — true = every player owns this card from the start
   effects       — Array of effect objects (B4 engine)
   eventType     — EV cards only: Lucid / Nightmare / Liminal /
                   Recurring / Daydream / Fever
   isMainChar    — true = can only be placed in the Main Character slot
   isSideChar    — true = can only be placed in the Side Character slot

   ── LINKING TAGS (for enemy deck builder) ─────
   charTag       — Links a card to a specific CH or DA card.
                   Set this on:
                     CHS, CHSS  → the CH card they belong to
                     DAS, DASS  → the DA card they belong to
                     DZ         → the CH (or DA) card this Dozer
                                  fights alongside
                     LO         → the CH (or DA) card whose dream
                                  this location appears in
                                  (optional — territory fallback
                                   is used if charTag is absent)
                     EV         → the CH card whose event pool
                                  this event belongs to
                                  (omit for generic events)
                   e.g.  charTag: '001-MCS-CH1'

   parentTag     — Links a DZS or DZSS skill card to the specific
                   DZ (Dozer) card it belongs to.
                   Set this ONLY on DZS and DZSS cards.
                   Do NOT set charTag on DZS/DZSS — use parentTag.
                   e.g.  parentTag: '007-MCS-DZ1'

   ── TYPE GUIDE ────────────────────────────────
   CH    Character card (main / side)
   CHS   Character Skill      → charTag  = CH card id
   CHSS  Character Sub-Skill  → charTag  = CH card id
   DZ    Dozer                → charTag  = CH (or DA) card id
   DZS   Dozer Skill          → parentTag = DZ card id  ← NOT charTag
   DZSS  Dozer Sub-Skill      → parentTag = DZ card id  ← NOT charTag
   DA    Dazed Character (Second Chance antagonist)
   DAS   Dazed Skill          → charTag  = DA card id
   DASS  Dazed Sub-Skill      → charTag  = DA card id
   DR    Dreamscape (generic filler, no tag needed)
   LO    Location             → charTag  = CH or DA card id (optional)
                                territory = territory name (fallback)
   EV    Event                → charTag  = CH card id (optional)

   ── QUICK EXAMPLES ────────────────────────────
   // Mr Pirate — Character card
   // { id:'001-MCS-CH1', type:'CH', name:'Mr Pirate', territory:'Tidalia', ... }

   // Mr Pirate's skill
   // { id:'002-MCS-CHS1', type:'CHS', charTag:'001-MCS-CH1', name:'Anchor Slam', ... }

   // Mr Pirate's Dozer companion
   // { id:'007-MCS-DZ1', type:'DZ', charTag:'001-MCS-CH1', name:'Crew Mate', ... }

   // Crew Mate's skill  ← parentTag points to the DZ, NOT the CH
   // { id:'008-MCS-DZS1', type:'DZS', parentTag:'007-MCS-DZ1', name:'Cannonball', ... }

   // Location in Mr Pirate's dream
   // { id:'020-MCS-LO1', type:'LO', charTag:'001-MCS-CH1', territory:'Tidalia', name:'Sunken Galleon', ... }

   // Evil Pirateer — Dazed version of Mr Pirate
   // { id:'030-MCS-DA1', type:'DA', name:'Evil Pirateer', territory:'Tidalia', ... }

   // Evil Pirateer's skill
   // { id:'031-MCS-DAS1', type:'DAS', charTag:'030-MCS-DA1', name:'Dark Tide', ... }
   ============================================= */
const CARDS = [
];

/* ==============================================
   BUFFS & DEBUFFS
   Define every buff and debuff used in the game here.
   The engine reads this array and registers each
   entry via defineBuffDebuff() on startup.

   REQUIRED FIELDS:
   ─────────────────────────────────────────────
   id          — unique slug used in card effects
                 e.g. 'increase_atk', 'poisoned'
   isDebuff    — true = debuff, false/omit = buff

   OPTIONAL FIELDS:
   ─────────────────────────────────────────────
   label       — short display name (shown in tooltip)
                 defaults to id with underscores → spaces
   img         — path to a custom PNG icon, same style
                 as character/card images:
                 'assets/buffs/increase_atk.png'
                 leave '' or omit to use the coloured
                 letter-tile fallback
   iconColor   — fallback tile colour (hex) when no img
                 defaults: '#00c9c8' buff / '#e03c5a' debuff
   stacks      — max stack count (default 1)
   permanent   — true = never expires (default false)
   undispellable — true = cannot be removed (default false)
   code        — effect string run each tick while active
                 (same C2 syntax as card effects)
                 leave '' if the buff is purely cosmetic /
                 handled by card effect triggers
   ============================================= */
const BUFFS = [
  // ── TEMPLATE — copy this block for each buff ──
  // {
  //   id:           'increase_atk',
  //   label:        'ATK Up',
  //   img:          'assets/buffs/increase_atk.png',
  //   iconColor:    '#00c9c8',
  //   stacks:       3,
  //   permanent:    false,
  //   undispellable:false,
  //   code:         '',
  // },
];

const DEBUFFS = [
  // ── TEMPLATE — copy this block for each debuff ──
  // {
  //   id:           'poisoned',
  //   label:        'Poison',
  //   img:          'assets/debuffs/poisoned.png',
  //   iconColor:    '#e03c5a',
  //   stacks:       5,
  //   permanent:    false,
  //   undispellable:false,
  //   code:         'HP:-5',
  // },
];

/* ==============================================
   ENERGY TYPES (E1-E24)
   id: energy code, name: display name,
   type: 'Release' or 'Absorb',
   desc: what it does
   ============================================= */
const ENERGY_TYPES = {
  'E1':  { name: 'Quiescent',                       type: 'Absorb',  desc: 'Lack of Magnetic Energy — Ability to cause an EMP effect, destroying the functions of electrical objects' },
  'E2':  { name: 'Thermal',                          type: 'Release', desc: 'Thermal Energy — Ability to create heat' },
  'E3':  { name: 'Calmness',                         type: 'Absorb',  desc: 'Lack of Wind Energy — Ability to decrease moisture in the air' },
  'E4':  { name: 'Elastic Potential',                type: 'Release', desc: 'Elastic Potential Energy — Ability to store an object\'s energy through stretching' },
  'E5':  { name: 'Darkness',                         type: 'Absorb',  desc: 'Lack of Radiant / Electromagnetic Energy — Ability to absorb all light, causing absolute darkness in an area' },
  'E6':  { name: 'Magnetic',                         type: 'Release', desc: 'Magnetic Energy — Ability to attract or repel metallic objects' },
  'E7':  { name: 'Tidal',                            type: 'Release', desc: 'Tidal Energy — Ability to push an object in a specified direction (different from kinetic)' },
  'E8':  { name: 'Vacuum',                           type: 'Absorb',  desc: 'Lack of Sound Energy — Ability to negate all sound' },
  'E9':  { name: 'Radiant / Electromagnetic',        type: 'Release', desc: 'Radiant / Electromagnetic Energy — Ability to create light / manipulate objects\' movement' },
  'E10': { name: 'Electrical',                       type: 'Release', desc: 'Electrical Energy — Ability to generate electricity' },
  'E11': { name: 'Disconnect',                       type: 'Absorb',  desc: 'Lack of Electrical Energy — Ability to nullify all electronics' },
  'E12': { name: 'Durability',                       type: 'Absorb',  desc: 'Lack of Elastic Potential Energy — Ability to increase the hardness of any object' },
  'E13': { name: 'Stillness',                        type: 'Absorb',  desc: 'Lack of Tidal Energy — Ability to stop things from gaining speed' },
  'E14': { name: 'Nuclear',                          type: 'Release', desc: 'Nuclear Energy — Ability to increase an energy\'s output through an intense release of energy' },
  'E15': { name: 'Mechanical (Potential) / Kinetic', type: 'Release', desc: 'Mechanical (Potential) Energy — Ability to store energy in an object. Kinetic Energy — Ability to increase an object\'s stored energy through movement' },
  'E16': { name: 'Gravitational',                    type: 'Release', desc: 'Gravitational Energy — Ability to manipulate an object\'s gravity' },
  'E17': { name: 'Frigid',                           type: 'Absorb',  desc: 'Lack of Thermal Energy — Ability to freeze any object by absorbing heat' },
  'E18': { name: 'Dormant',                          type: 'Absorb',  desc: 'Lack of Nuclear Energy — Ability to nullify energy effects altogether' },
  'E19': { name: 'Inactive',                         type: 'Absorb',  desc: 'Lack of Chemical Energy — Ability to exhaust any person or any object around the area' },
  'E20': { name: 'Chemical',                         type: 'Release', desc: 'Chemical Energy — Ability to increase an object or user\'s ability to work' },
  'E21': { name: 'Stability',                        type: 'Absorb',  desc: 'Lack of Gravitational Energy — Ability to absorb all gravity, rendering any incoming form of impacts useless' },
  'E22': { name: 'Sound',                            type: 'Release', desc: 'Sound Energy — Able to amplify the volume of sound and vibrations' },
  'E23': { name: 'Wind',                             type: 'Release', desc: 'Wind Energy — Ability to manipulate movements of the air' },
  'E24': { name: 'Static',                           type: 'Absorb',  desc: 'Lack of Mechanical (Potential) Energy — Ability to "teleport" to another object\'s location. Lack of Kinetic Energy — Ability to stop all motion' },
};

/* ==============================================
   TERRITORY DATA (83 territories across 9 zones)
   Zone codes: NW Z1, N Z2, NE Z3, W Z4, C Z5,
               E Z6, SW Z7, S Z8, SE Z9
   ============================================= */
const TERRITORY_DATA = {

  // ── Northwest (NW) Z1 ──────────────────────
  'Calmoria':         { zone:'NW Z1', main:'Calmness E3',                          secondary:'—',                               third:'—' },
  'Quiescentia':      { zone:'NW Z1', main:'Quiescent E1',                         secondary:'—',                               third:'—' },
  'Quiesmather':      { zone:'NW Z1', main:'Quiescent E1',                         secondary:'Thermal E2',                      third:'—' },
  'Thermalia':        { zone:'NW Z1', main:'Thermal E2',                           secondary:'—',                               third:'—' },
  'Thermalm':         { zone:'NW Z1', main:'Thermal E2',                           secondary:'Calmness E3',                     third:'—' },
  'Thermunia':        { zone:'NW Z1', main:'Thermal E2',                           secondary:'Nuclear E14',                     third:'—' },
  'Thermaval':        { zone:'NW Z1', main:'Thermal E2',                           secondary:'Gravitational E16',               third:'—' },

  // ── North (N) Z2 ───────────────────────────
  'Serenelast':       { zone:'N Z2',  main:'Calmness E3',                          secondary:'Elastic Potential E4',            third:'—' },
  'Darkelastis':      { zone:'N Z2',  main:'Darkness E5',                          secondary:'Elastic Potential E4',            third:'—' },
  'Darklund':         { zone:'N Z2',  main:'Darkness E5',                          secondary:'—',                               third:'—' },
  'Elastoria':        { zone:'N Z2',  main:'Elastic Potential E4',                 secondary:'—',                               third:'—' },
  'Elastomagentia':   { zone:'N Z2',  main:'Elastic Potential E4',                 secondary:'Magnetic E6',                     third:'—' },
  'Gravelastia':      { zone:'N Z2',  main:'Gravitational E16',                    secondary:'Elastic Potential E4',            third:'Darkness E5' },
  'Magnitidal':       { zone:'N Z2',  main:'Magnetic E6',                          secondary:'Tidal E7',                        third:'—' },
  'Magnethia':        { zone:'N Z2',  main:'Magnetic E6',                          secondary:'—',                               third:'—' },
  'Magnetidavac':     { zone:'N Z2',  main:'Magnetic E6',                          secondary:'Tidal E7',                        third:'Vacuum E8' },
  'Tidalia':          { zone:'N Z2',  main:'Tidal E7',                             secondary:'—',                               third:'—' },

  // ── Northeast (NE) Z3 ──────────────────────
  'Disconnectia':     { zone:'NE Z3', main:'Disconnect E11',                       secondary:'—',                               third:'—' },
  'Disquiecentia':    { zone:'NE Z3', main:'Disconnect E11',                       secondary:'Quiescent E1',                    third:'—' },
  'Dormavacua':       { zone:'NE Z3', main:'Dormant E18',                          secondary:'Vacuum E8',                       third:'—' },
  'Dormantria':       { zone:'NE Z3', main:'Dormant E18',                          secondary:'Radiant / Electromagnetic E9',    third:'—' },
  'Electridis':       { zone:'NE Z3', main:'Electrical E10',                       secondary:'Disconnect E11',                  third:'—' },
  'Electradiana':     { zone:'NE Z3', main:'Electrical E10',                       secondary:'Radiant / Electromagnetic E9',    third:'—' },
  'Electrionia':      { zone:'NE Z3', main:'Electrical E10',                       secondary:'—',                               third:'—' },
  'Quieslectria':     { zone:'NE Z3', main:'Quiescent E1',                         secondary:'Electrical E10',                  third:'—' },
  'Quiescinact':      { zone:'NE Z3', main:'Quiescent E1',                         secondary:'Inactive E19',                    third:'—' },
  'Radiantos':        { zone:'NE Z3', main:'Radiant / Electromagnetic E9',         secondary:'—',                               third:'—' },
  'Radiantia':        { zone:'NE Z3', main:'Radiant / Electromagnetic E9',         secondary:'Disconnect E11',                  third:'—' },
  'Tidalvac':         { zone:'NE Z3', main:'Tidal E7',                             secondary:'Magnetic E6',                     third:'Dormant E18' },
  'Vacuoros':         { zone:'NE Z3', main:'Vacuum E8',                            secondary:'—',                               third:'—' },
  'Vacuradia':        { zone:'NE Z3', main:'Vacuum E8',                            secondary:'Radiant / Electromagnetic E9',    third:'—' },

  // ── West (W) Z4 ────────────────────────────
  'Duriquies':        { zone:'W Z4',  main:'Durability E12',                       secondary:'Quiescent E1',                    third:'—' },
  'Durabilis':        { zone:'W Z4',  main:'Durability E12',                       secondary:'—',                               third:'—' },
  'Duracore':         { zone:'W Z4',  main:'Durability E12',                       secondary:'Nuclear E14',                     third:'—' },
  'Mechanucropolis':  { zone:'W Z4',  main:'Mechanical (Potential) / Kinetic E15', secondary:'Nuclear E14',                     third:'—' },
  'Mechanovia':       { zone:'W Z4',  main:'Mechanical (Potential) / Kinetic E15', secondary:'—',                               third:'—' },
  'Nucleonovia':      { zone:'W Z4',  main:'Nuclear E14',                          secondary:'—',                               third:'—' },
  'Nuclearis':        { zone:'W Z4',  main:'Nuclear E14',                          secondary:'Stillness E13',                   third:'—' },
  'Nuclechros':       { zone:'W Z4',  main:'Nuclear E14',                          secondary:'Mechanical (Potential) / Kinetic E15', third:'Stability E21' },
  'Nuclestria':       { zone:'W Z4',  main:'Nuclear E14',                          secondary:'Stability E21',                   third:'—' },
  'Quiescilla':       { zone:'W Z4',  main:'Quiescent E1',                         secondary:'Stillness E13',                   third:'—' },
  'Quithermia':       { zone:'W Z4',  main:'Quiescent E1',                         secondary:'Stillness E13',                   third:'Thermal E2' },
  'Stabilicore':      { zone:'W Z4',  main:'Stability E21',                        secondary:'Nuclear E14',                     third:'Sound E22' },
  'Stildura':         { zone:'W Z4',  main:'Stillness E13',                        secondary:'Durability E12',                  third:'—' },
  'Stilla':           { zone:'W Z4',  main:'Stillness E13',                        secondary:'—',                               third:'—' },
  'Thermalis':        { zone:'W Z4',  main:'Thermal E2',                           secondary:'Stillness E13',                   third:'—' },

  // ── Central (C) Z5 ─────────────────────────
  'Gravitrona':       { zone:'C Z5',  main:'Gravitational E16',                    secondary:'Nuclear E14',                     third:'—' },
  'Gravitalis':       { zone:'C Z5',  main:'Gravitational E16',                    secondary:'—',                               third:'—' },
  'Soundgraviton':    { zone:'C Z5',  main:'Sound E22',                            secondary:'Gravitational E16',               third:'Nuclear E14' },
  'Sonograv':         { zone:'C Z5',  main:'Sound E22',                            secondary:'Gravitational E16',               third:'—' },
  'Tidalgrav':        { zone:'C Z5',  main:'Tidal E7',                             secondary:'Gravitational E16',               third:'—' },
  'Windtide':         { zone:'C Z5',  main:'Wind E23',                             secondary:'Tidal E7',                        third:'—' },

  // ── East (E) Z6 ────────────────────────────
  'Chemistadora':     { zone:'E Z6',  main:'Chemical E20',                         secondary:'Static E24',                      third:'Dormant E18' },
  'Chemistria':       { zone:'E Z6',  main:'Chemical E20',                         secondary:'—',                               third:'—' },
  'Dormwindia':       { zone:'E Z6',  main:'Dormant E18',                          secondary:'Wind E23',                        third:'—' },
  'Dormont':          { zone:'E Z6',  main:'Dormant E18',                          secondary:'—',                               third:'—' },
  'Dormantystria':    { zone:'E Z6',  main:'Dormant E18',                          secondary:'Static E24',                      third:'Wind E23' },
  'Dormantechia':     { zone:'E Z6',  main:'Dormant E18',                          secondary:'Inactive E19',                    third:'—' },
  'Frigida':          { zone:'E Z6',  main:'Frigid E17',                           secondary:'—',                               third:'—' },
  'Frigisona':        { zone:'E Z6',  main:'Frigid E17',                           secondary:'Sound E22',                       third:'—' },
  'Inactornica':      { zone:'E Z6',  main:'Inactive E19',                         secondary:'Electrical E10',                  third:'—' },
  'Inactonia':        { zone:'E Z6',  main:'Inactive E19',                         secondary:'—',                               third:'—' },
  'Inachem':          { zone:'E Z6',  main:'Inactive E19',                         secondary:'Chemical E20',                    third:'—' },
  'Windfrost':        { zone:'E Z6',  main:'Wind E23',                             secondary:'Frigid E17',                      third:'—' },

  // ── Southwest (SW) Z7 ──────────────────────
  'Duramech':         { zone:'SW Z7', main:'Durability E12',                       secondary:'Mechanical (Potential) / Kinetic E15', third:'—' },
  'Mechanoquies':     { zone:'SW Z7', main:'Mechanical (Potential) / Kinetic E15', secondary:'Quiescent E1',                    third:'—' },
  'Mechcalmia':       { zone:'SW Z7', main:'Mechanical (Potential) / Kinetic E15', secondary:'Calmness E3',                     third:'—' },
  'Stabletron':       { zone:'SW Z7', main:'Stability E21',                        secondary:'Mechanical (Potential) / Kinetic E15', third:'—' },

  // ── South (S) Z8 ───────────────────────────
  'Serenomagnia':     { zone:'S Z8',  main:'Calmness E3',                          secondary:'Magnetic E6',                     third:'—' },
  'Magnawind':        { zone:'S Z8',  main:'Magnetic E6',                          secondary:'Wind E23',                        third:'—' },
  'Soundara':         { zone:'S Z8',  main:'Sound E22',                            secondary:'—',                               third:'—' },
  'Sonorica':         { zone:'S Z8',  main:'Sound E22',                            secondary:'Wind E23',                        third:'—' },
  'Stabilis':         { zone:'S Z8',  main:'Stability E21',                        secondary:'—',                               third:'—' },
  'Stabilitone':      { zone:'S Z8',  main:'Stability E21',                        secondary:'Sound E22',                       third:'—' },
  'Windymagsta':      { zone:'S Z8',  main:'Wind E23',                             secondary:'Magnetic E6',                     third:'Static E24' },
  'Windmere':         { zone:'S Z8',  main:'Wind E23',                             secondary:'—',                               third:'—' },

  // ── Southeast (SE) Z9 ──────────────────────
  'Chemistatia':      { zone:'SE Z9', main:'Chemical E20',                         secondary:'Static E24',                      third:'—' },
  'Electriqia':       { zone:'SE Z9', main:'Electrical E10',                       secondary:'Quiescent E1',                    third:'Chemical E20' },
  'Radiastrix':       { zone:'SE Z9', main:'Radiant / Electromagnetic E9',         secondary:'Static E24',                      third:'—' },
  'Statica':          { zone:'SE Z9', main:'Static E24',                           secondary:'Magnetic E6',                     third:'—' },
  'Stativia':         { zone:'SE Z9', main:'Static E24',                           secondary:'—',                               third:'—' },
  'Staticonia':       { zone:'SE Z9', main:'Static E24',                           secondary:'Disconnect E11',                  third:'—' },
  'Windastra':        { zone:'SE Z9', main:'Wind E23',                             secondary:'Static E24',                      third:'—' },
};
