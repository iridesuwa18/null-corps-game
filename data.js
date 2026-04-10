/* ==============================================
   CHARACTERS DATA
   ============================================= */
const CHARACTERS = [
  // Add your characters here like this:
  // { name: 'Sparrow',    img: 'assets/chars/sparrow.png' },
  // { name: 'Null',       img: 'assets/chars/null.png' },
  // Placeholders so the grid is visible while building:
  { name: 'Character 01', img: '' },
  { name: 'Character 02', img: '' },
  { name: 'Character 03', img: '' },
  { name: 'Character 04', img: '' },
  { name: 'Character 05', img: '' },
  { name: 'Character 06', img: '' },
  { name: 'Character 07', img: '' },
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
   ============================================= */
const CARDS = [
  // Example card — copy and edit this block to add more:
  // {
  //   id: '001-MCS-CH1',       // Unique Card Number (B3-5)
  //   name: 'Sparrow',         // Card Name
  //   title: 'The Dream Catcher', // Card Title
  //   type: 'CH',              // Card Type: CH, DZ, CHS, CHSS, DZS, DZSS, DA, DAS, DASS, DR, LO, EV
  //   set: 'MCS',              // Set: OHS, MCS, HS, GS
  //   era: '50 BME',           // Era (CH/DA/LO cards)
  //   territory: 'Calmoria',   // Territory name (auto-fills zone & energy)
  //   atk: 3, def: 2, hp: 10, shd: 1,   // Stats (CH/DZ/DA only)
  //   eg: 2,                   // Energy Cost (1-4)
  //   specialLetters: ['S'],   // Letters that can join other words
  //   mergedLetters: [],        // Letters already joined
  //   description: 'Card description here.',
  //   img: 'assets/cards/sparrow.png',  // Card art path
  //   isDefault: true,         // Default card (always owned)
  //   effects: [],             // Card effects (B4)
  //   eventType: '',           // For EV cards: Lucid/Nightmare/Liminal/Recurring/Daydream/Fever
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
