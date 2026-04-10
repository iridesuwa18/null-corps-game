/* =============================================
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

/* =============================================
   SKILL PARENT MAP
   ============================================= */
const SKILL_PARENT_MAP = {
  'CHS':  'CH',
  'CHSS': 'CH',
  'DZS':  'DZ',
  'DZSS': 'DZ',
  'DAS':  'DA',
  'DASS': 'DA',

/* =============================================
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
  //   eg: 2,                   // Energy Cost (1–4)
  //   specialLetters: ['S'],   // Letters that can join other words
  //   mergedLetters: [],        // Letters already joined
  //   description: 'Card description here.',
  //   img: 'assets/cards/sparrow.png',  // Card art path
  //   isDefault: true,         // Default card (always owned)
  //   effects: [],             // Card effects (B4)
  //   eventType: '',           // For EV cards: Lucid/Nightmare/Liminal/Recurring/Daydream/Fever
  // },
];

/* =============================================
   TERRITORY DATA
   ============================================= */
const TERRITORY_DATA = {
  'Calmoria':       { zone:'NW Z1', main:'Calmness E3', secondary:'—', third:'—' },
  'Quiescentia':    { zone:'NW Z1', main:'Quiescent E1', secondary:'—', third:'—' },
  'Quiesmather':    { zone:'NW Z1', main:'Quiescent E1', secondary:'Thermal E2', third:'—' },
  'Thermalia':      { zone:'NW Z1', main:'Thermal E2', secondary:'—', third:'—' },
  'Thermalm':       { zone:'NW Z1', main:'Thermal E2', secondary:'Calmness E3', third:'—' },
  'Thermunia':      { zone:'NW Z1', main:'Thermal E2', secondary:'Nuclear E14', third:'—' },
  'Thermaval':      { zone:'NW Z1', main:'Thermal E2', secondary:'Gravitational E16', third:'—' },
  'Serenelast':     { zone:'N Z2',  main:'Calmness E3', secondary:'Elastic Potential E4', third:'—' },
  'Darkelastis':    { zone:'N Z2',  main:'Darkness E5', secondary:'Elastic Potential E4', third:'—' },
  'Darklund':       { zone:'N Z2',  main:'Darkness E5', secondary:'—', third:'—' },
  'Elastoria':      { zone:'N Z2',  main:'Elastic Potential E4', secondary:'—', third:'—' },
  'Elastomagentia': { zone:'N Z2',  main:'Elastic Potential E4', secondary:'Magnetic E6', third:'—' },
  'Gravelastia':    { zone:'N Z2',  main:'Gravitational E16', secondary:'Elastic Potential E4', third:'Darkness E5' },
  'Magnitidal':     { zone:'N Z2',  main:'Magnetic E6', secondary:'Tidal E7', third:'—' },
  'Magnethia':      { zone:'N Z2',  main:'Magnetic E6', secondary:'—', third:'—' },
  'Magnetidavac':   { zone:'N Z2',  main:'Magnetic E6', secondary:'Tidal E7', third:'Vacuum E8' },
  'Tidalia':        { zone:'N Z2',  main:'Tidal E7', secondary:'—', third:'—' },
  'Disconnectia':   { zone:'NE Z3', main:'Disconnect E11', secondary:'—', third:'—' },
};
