/* ═══════════════════════════════════════════════════════════════
   cards/miscellaneous/territory_data.js
   ─────────────────────────────────────────────────────────────
   All 83 territories across 9 zones.
   Do NOT rename the variable — loader.js reads _NCG.territoryData.
   ═══════════════════════════════════════════════════════════════ */

window._NCG.territoryData = {

  // ── Northwest (NW) Z1 ──────────────────────────────────────
  'Calmoria':         { zone:'NW Z1', main:'Calmness E3',                          secondary:'—',                               third:'—' },
  'Quiescentia':      { zone:'NW Z1', main:'Quiescent E1',                         secondary:'—',                               third:'—' },
  'Quiesmather':      { zone:'NW Z1', main:'Quiescent E1',                         secondary:'Thermal E2',                      third:'—' },
  'Thermalia':        { zone:'NW Z1', main:'Thermal E2',                           secondary:'—',                               third:'—' },
  'Thermalm':         { zone:'NW Z1', main:'Thermal E2',                           secondary:'Calmness E3',                     third:'—' },
  'Thermunia':        { zone:'NW Z1', main:'Thermal E2',                           secondary:'Nuclear E14',                     third:'—' },
  'Thermaval':        { zone:'NW Z1', main:'Thermal E2',                           secondary:'Gravitational E16',               third:'—' },

  // ── North (N) Z2 ───────────────────────────────────────────
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

  // ── Northeast (NE) Z3 ──────────────────────────────────────
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

  // ── West (W) Z4 ────────────────────────────────────────────
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

  // ── Central (C) Z5 ─────────────────────────────────────────
  'Gravitrona':       { zone:'C Z5',  main:'Gravitational E16',                    secondary:'Nuclear E14',                     third:'—' },
  'Gravitalis':       { zone:'C Z5',  main:'Gravitational E16',                    secondary:'—',                               third:'—' },
  'Soundgraviton':    { zone:'C Z5',  main:'Sound E22',                            secondary:'Gravitational E16',               third:'Nuclear E14' },
  'Sonograv':         { zone:'C Z5',  main:'Sound E22',                            secondary:'Gravitational E16',               third:'—' },
  'Tidalgrav':        { zone:'C Z5',  main:'Tidal E7',                             secondary:'Gravitational E16',               third:'—' },
  'Windtide':         { zone:'C Z5',  main:'Wind E23',                             secondary:'Tidal E7',                        third:'—' },

  // ── East (E) Z6 ────────────────────────────────────────────
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

  // ── Southwest (SW) Z7 ──────────────────────────────────────
  'Duramech':         { zone:'SW Z7', main:'Durability E12',                       secondary:'Mechanical (Potential) / Kinetic E15', third:'—' },
  'Mechanoquies':     { zone:'SW Z7', main:'Mechanical (Potential) / Kinetic E15', secondary:'Quiescent E1',                    third:'—' },
  'Mechcalmia':       { zone:'SW Z7', main:'Mechanical (Potential) / Kinetic E15', secondary:'Calmness E3',                     third:'—' },
  'Stabletron':       { zone:'SW Z7', main:'Stability E21',                        secondary:'Mechanical (Potential) / Kinetic E15', third:'—' },

  // ── South (S) Z8 ───────────────────────────────────────────
  'Serenomagnia':     { zone:'S Z8',  main:'Calmness E3',                          secondary:'Magnetic E6',                     third:'—' },
  'Magnawind':        { zone:'S Z8',  main:'Magnetic E6',                          secondary:'Wind E23',                        third:'—' },
  'Soundara':         { zone:'S Z8',  main:'Sound E22',                            secondary:'—',                               third:'—' },
  'Sonorica':         { zone:'S Z8',  main:'Sound E22',                            secondary:'Wind E23',                        third:'—' },
  'Stabilis':         { zone:'S Z8',  main:'Stability E21',                        secondary:'—',                               third:'—' },
  'Stabilitone':      { zone:'S Z8',  main:'Stability E21',                        secondary:'Sound E22',                       third:'—' },
  'Windymagsta':      { zone:'S Z8',  main:'Wind E23',                             secondary:'Magnetic E6',                     third:'Static E24' },
  'Windmere':         { zone:'S Z8',  main:'Wind E23',                             secondary:'—',                               third:'—' },

  // ── Southeast (SE) Z9 ──────────────────────────────────────
  'Chemistatia':      { zone:'SE Z9', main:'Chemical E20',                         secondary:'Static E24',                      third:'—' },
  'Electriqia':       { zone:'SE Z9', main:'Electrical E10',                       secondary:'Quiescent E1',                    third:'Chemical E20' },
  'Radiastrix':       { zone:'SE Z9', main:'Radiant / Electromagnetic E9',         secondary:'Static E24',                      third:'—' },
  'Statica':          { zone:'SE Z9', main:'Static E24',                           secondary:'Magnetic E6',                     third:'—' },
  'Stativia':         { zone:'SE Z9', main:'Static E24',                           secondary:'—',                               third:'—' },
  'Staticonia':       { zone:'SE Z9', main:'Static E24',                           secondary:'Disconnect E11',                  third:'—' },
  'Windastra':        { zone:'SE Z9', main:'Wind E23',                             secondary:'Static E24',                      third:'—' },
};
