/* ═══════════════════════════════════════════════════════════════
   cards/miscellaneous/energy_types.js
   ─────────────────────────────────────────────────────────────
   All 24 energy types. Edit descriptions here as needed.
   Do NOT rename the variable — loader.js reads _NCG.energyTypes.
   ═══════════════════════════════════════════════════════════════ */

window._NCG.energyTypes = {
  'E1':  { name: 'Quiescent',                        type: 'Absorb',  desc: 'Lack of Magnetic Energy — Ability to cause an EMP effect, destroying the functions of electrical objects' },
  'E2':  { name: 'Thermal',                           type: 'Release', desc: 'Thermal Energy — Ability to create heat' },
  'E3':  { name: 'Calmness',                          type: 'Absorb',  desc: 'Lack of Wind Energy — Ability to decrease moisture in the air' },
  'E4':  { name: 'Elastic Potential',                 type: 'Release', desc: 'Elastic Potential Energy — Ability to store an object\'s energy through stretching' },
  'E5':  { name: 'Darkness',                          type: 'Absorb',  desc: 'Lack of Radiant / Electromagnetic Energy — Ability to absorb all light, causing absolute darkness in an area' },
  'E6':  { name: 'Magnetic',                          type: 'Release', desc: 'Magnetic Energy — Ability to attract or repel metallic objects' },
  'E7':  { name: 'Tidal',                             type: 'Release', desc: 'Tidal Energy — Ability to push an object in a specified direction (different from kinetic)' },
  'E8':  { name: 'Vacuum',                            type: 'Absorb',  desc: 'Lack of Sound Energy — Ability to negate all sound' },
  'E9':  { name: 'Radiant / Electromagnetic',         type: 'Release', desc: 'Radiant / Electromagnetic Energy — Ability to create light / manipulate objects\' movement' },
  'E10': { name: 'Electrical',                        type: 'Release', desc: 'Electrical Energy — Ability to generate electricity' },
  'E11': { name: 'Disconnect',                        type: 'Absorb',  desc: 'Lack of Electrical Energy — Ability to nullify all electronics' },
  'E12': { name: 'Durability',                        type: 'Absorb',  desc: 'Lack of Elastic Potential Energy — Ability to increase the hardness of any object' },
  'E13': { name: 'Stillness',                         type: 'Absorb',  desc: 'Lack of Tidal Energy — Ability to stop things from gaining speed' },
  'E14': { name: 'Nuclear',                           type: 'Release', desc: 'Nuclear Energy — Ability to increase an energy\'s output through an intense release of energy' },
  'E15': { name: 'Mechanical (Potential) / Kinetic',  type: 'Release', desc: 'Mechanical (Potential) Energy — Ability to store energy in an object. Kinetic Energy — Ability to increase an object\'s stored energy through movement' },
  'E16': { name: 'Gravitational',                     type: 'Release', desc: 'Gravitational Energy — Ability to manipulate an object\'s gravity' },
  'E17': { name: 'Frigid',                            type: 'Absorb',  desc: 'Lack of Thermal Energy — Ability to freeze any object by absorbing heat' },
  'E18': { name: 'Dormant',                           type: 'Absorb',  desc: 'Lack of Nuclear Energy — Ability to nullify energy effects altogether' },
  'E19': { name: 'Inactive',                          type: 'Absorb',  desc: 'Lack of Chemical Energy — Ability to exhaust any person or any object around the area' },
  'E20': { name: 'Chemical',                          type: 'Release', desc: 'Chemical Energy — Ability to increase an object or user\'s ability to work' },
  'E21': { name: 'Stability',                         type: 'Absorb',  desc: 'Lack of Gravitational Energy — Ability to absorb all gravity, rendering any incoming form of impacts useless' },
  'E22': { name: 'Sound',                             type: 'Release', desc: 'Sound Energy — Able to amplify the volume of sound and vibrations' },
  'E23': { name: 'Wind',                              type: 'Release', desc: 'Wind Energy — Ability to manipulate movements of the air' },
  'E24': { name: 'Static',                            type: 'Absorb',  desc: 'Lack of Mechanical (Potential) Energy — Ability to "teleport" to another object\'s location. Lack of Kinetic Energy — Ability to stop all motion' },
};
