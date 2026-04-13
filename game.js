/* =============================================
   GAME STATE
   ============================================= */
const STATE = {
  currentScreen: 'screen-main',
  dreamTickets: 0,
  inBattle: false,
  selectedCharacter: -1,
  selectedDeck: -1,
  dreamReadyDeckIdx: -1,
  options: {
    volMaster: 80,
    volMusic:  70,
    volSfx:    90,
    fullscreen: false,
    resolution: ''
  }
};

/* =============================================
   SCREEN NAVIGATION
   ============================================= */
function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  STATE.currentScreen = screenId;
  // Record when the character-select screen opens so char-box clicks that
  // arrive within 350 ms (phantom touch propagation from the Play button)
  // are ignored by buildB2Grid's listener.
  if (screenId === 'screen-battle') STATE.screenBattleOpenedAt = Date.now();
  updateFloatingMenu();
}

function updateFloatingMenu() {
  const inGame   = STATE.inBattle;
  const onMain   = STATE.currentScreen === 'screen-main';

  document.getElementById('fm-home').classList.toggle('hidden', onMain);
  document.getElementById('fm-pause').classList.toggle('hidden', !inGame);
  document.getElementById('fm-undo').classList.toggle('hidden', !inGame);
  document.getElementById('dt-count').textContent = STATE.dreamTickets;
}

/* =============================================
   OPTIONS (B1-1)
   ============================================= */
function openOptions() {
  document.getElementById('options-overlay').classList.add('open');
}
function closeOptions() {
  document.getElementById('options-overlay').classList.remove('open');
  saveOptions();
}

function updateSlider(input, valId) {
  const v = input.value;
  document.getElementById(valId).textContent = v;
  input.style.setProperty('--val', v + '%');
  const key = input.id === 'vol-master' ? 'volMaster'
            : input.id === 'vol-music'  ? 'volMusic'
            : 'volSfx';
  STATE.options[key] = parseInt(v);
  // Hook: apply audio volume here when audio system is added
}

function toggleFullscreen(cb) {
  STATE.options.fullscreen = cb.checked;
  if (cb.checked) {
    document.documentElement.requestFullscreen?.().catch(() => {
      cb.checked = false;
      STATE.options.fullscreen = false;
    });
  } else {
    document.exitFullscreen?.();
  }
}

function changeResolution(val) {
  STATE.options.resolution = val;
  // Hook: apply resolution change here when windowed mode is supported
}

/* =============================================
   HOME BUTTON (B1-2)
   ============================================= */
document.getElementById('fm-home').addEventListener('click', () => {
  if (STATE.currentScreen === 'screen-main') return;
  document.getElementById('confirm-overlay').classList.add('open');
});

function confirmHome() {
  document.getElementById('confirm-overlay').classList.remove('open');
  goTo('screen-main');
}
function cancelHome() {
  document.getElementById('confirm-overlay').classList.remove('open');
  // No action — game continues
}

/* =============================================
   QUIT GAME
   ============================================= */
function quitGame() {
  const msg = document.getElementById('quit-msg');
  msg.classList.add('show');
  setTimeout(() => window.close(), 1200);
  // Fallback: browsers may block window.close()
  // Future: replace with app-level exit when packaged
}

/* =============================================
   PERSIST OPTIONS (localStorage)
   ============================================= */
function saveOptions() {
  localStorage.setItem('nullcorps_options', JSON.stringify(STATE.options));
}
function loadOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem('nullcorps_options'));
    if (!saved) return;
    Object.assign(STATE.options, saved);
    // Apply to UI
    setSlider('vol-master', 'val-master', saved.volMaster);
    setSlider('vol-music',  'val-music',  saved.volMusic);
    setSlider('vol-sfx',    'val-sfx',    saved.volSfx);
    document.getElementById('toggle-fullscreen').checked = saved.fullscreen;
    document.getElementById('res-select').value = saved.resolution || '';
  } catch(e) {}
}
function setSlider(inputId, valId, value) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.value = value;
  el.style.setProperty('--val', value + '%');
  document.getElementById(valId).textContent = value;
}

/* =============================================
   BACKGROUND CANVAS — Particle Drift
   ============================================= */
const pc = document.getElementById('particle-canvas');
const px = pc.getContext('2d');
let particles = [];

function resizeCanvas() {
  pc.width  = window.innerWidth;
  pc.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createParticle() {
  return {
    x: Math.random() * pc.width,
    y: Math.random() * pc.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.4 + 0.1),
    size: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.4 + 0.1,
    life: 1.0,
    decay: Math.random() * 0.002 + 0.001,
    color: Math.random() < 0.6 ? '200,168,75' : '0,201,200'
  };
}

const PARTICLE_COUNT = window.innerWidth < 600 ? 20 : 40;
for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());

function animateParticles() {
  if (STATE.currentScreen !== 'screen-main') {
    px.clearRect(0, 0, pc.width, pc.height);
    requestAnimationFrame(animateParticles);
    return;
  }
  px.clearRect(0, 0, pc.width, pc.height);
  particles.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    if (p.life <= 0 || p.y < -10) particles[i] = createParticle();
    px.beginPath();
    px.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    px.fillStyle = `rgba(${p.color},${p.alpha * p.life})`;
    px.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* =============================================
   CHARACTERS DATA (B2)
   Edit this array to add/remove characters.
   - name:    display name on hover
   - img:     path to image (e.g. 'assets/chars/sparrow.png')
              leave as '' to show placeholder
   ============================================= */

function buildB2Grid() {
  const grid = document.getElementById('b2-grid');
  grid.innerHTML = '';
  CHARACTERS.forEach((char, i) => {
    const box = document.createElement('div');
    box.className = 'char-box';
    box.title = char.name;

    if (char.img) {
      const img = document.createElement('img');
      img.src = char.img;
      img.alt = char.name;
      img.draggable = false;
      box.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'char-box-placeholder';
      ph.textContent = '?';
      box.appendChild(ph);
    }

    const label = document.createElement('div');
    label.className = 'char-box-name';
    label.textContent = char.name;
    box.appendChild(label);

    box.addEventListener('click', () => {
      // Guard against click-through from the Play button on the main menu.
      // The same touch/click event can propagate into the newly-visible
      // screen-battle and immediately fire a char-box click. Reject any
      // click that arrives within 350 ms of the screen becoming active.
      if (Date.now() - (STATE.screenBattleOpenedAt || 0) < 350) return;
      startBattle(i);
    });
    grid.appendChild(box);
  });
}

function startBattle(charIndex) {
  STATE.selectedCharacter = charIndex;
  openDreamReady(charIndex);
}

/* =============================================
   B4-1: DREAM READY SCREEN
   ============================================= */

function openDreamReady(charIndex) {
  COLLECTION = loadCollection();
  const char = CHARACTERS[charIndex];

  // --- Portraits ---
  const charImg  = document.getElementById('dr-char-img');
  const dazedImg = document.getElementById('dr-dazed-img');
  const charLbl  = document.getElementById('dr-char-label');
  const dazedLbl = document.getElementById('dr-dazed-label');

  // Use the character's card image if available (set via img property in CHARACTERS array)
  // or fall back to the card art of the matching card in CARDS
  const charCard = CARDS.find(c => c.id === char.cardId);
  const charImgSrc = char.img || (charCard && charCard.img) || '';

  if (charImgSrc) {
    charImg.style.backgroundImage = `url('${charImgSrc}')`;
    charImg.textContent = '';
  } else {
    charImg.style.backgroundImage = '';
    charImg.textContent = '👤';
  }

  // Dazed: use char.dazedImg if set
  const dazedImgSrc = char.dazedImg || '';
  if (dazedImgSrc) {
    dazedImg.style.backgroundImage = `url('${dazedImgSrc}')`;
    dazedImg.textContent = '';
  } else {
    dazedImg.style.backgroundImage = '';
    dazedImg.textContent = '👾';
  }

  charLbl.textContent  = char.name || 'Character';
  dazedLbl.textContent = (char.dazedName || char.name + ' (Dazed)');

  // --- Deck list ---
  drRefreshDeckList();

  goTo('screen-dream-ready');
}

/* B4-1: Enemy deck preview — called when player clicks either portrait on Dream Ready.
   Uses the same buildCharacterDeck logic as battle start so the preview is accurate.
   Clicking the normal portrait previews the CH deck; dazed portrait previews the DA deck. */
function drShowEnemyDeckPreview(side) {
  const charIndex = STATE.selectedCharacter ?? 0;
  const char = CHARACTERS[charIndex] || {};

  const previewCardId = side === 'dazed' ? (char.dazedCardId || null) : (char.cardId || null);
  const previewIds    = previewCardId ? buildCharacterDeck(previewCardId) : [];
  const evCards       = CARDS.filter(c => c.type === 'EV' && (!c.charTag || c.charTag === previewCardId));
  const preview       = [...previewIds.map(id => CARDS.find(c => c.id === id)).filter(Boolean),
                         ...shuffleCopy(evCards).slice(0, 3)];

  const overlay = document.getElementById('dr-enemy-preview');
  const grid    = document.getElementById('dr-preview-grid');
  const title   = document.getElementById('dr-preview-title');

  title.textContent = side === 'dazed'
    ? (char.dazedName || char.name + ' (Dazed)') + ' · Enemy Deck Preview'
    : char.name + ' · Enemy Deck Preview';

  grid.innerHTML = '';
  if (preview.length === 0) {
    grid.innerHTML = '<div style="color:var(--text-dim);font-size:11px;grid-column:1/-1;text-align:center;">No cards in pool yet.</div>';
  } else {
    preview.forEach(card => {
      const el = document.createElement('div');
      el.style.cssText = 'aspect-ratio:2250/3150;background:var(--bg-panel);border:1px solid rgba(200,168,75,0.2);border-radius:4px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--text-dim);text-align:center;padding:2px;cursor:default;';
      if (card.img) {
        const img = document.createElement('img');
        img.src = card.img;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        el.appendChild(img);
      } else {
        el.textContent = card.name || '?';
      }
      el.title = (card.name || card.id) + ' [' + (card.type || '') + '] EG:' + (card.eg ?? 1);
      // Hover enlarge using existing showEnlargedCard
      el.addEventListener('mouseenter', e => showEnlargedCard(card, null, e));
      el.addEventListener('mouseleave', hideEnlargedCard);
      grid.appendChild(el);
    });
  }
  overlay.style.display = 'flex';
}

function drRefreshDeckList() {
  COLLECTION = loadCollection();
  const decks = COLLECTION.decks || [];
  const noDeck  = document.getElementById('dr-no-deck');
  const picker  = document.getElementById('dr-deck-picker');
  const errBox  = document.getElementById('dr-error');
  errBox.style.display = 'none';

  if (decks.length === 0) {
    noDeck.style.display = 'flex';
    picker.style.display = 'none';
    document.getElementById('dr-jump-btn').disabled = true;
    document.getElementById('dr-deck-count').textContent = '0 / 50 cards';
    STATE.dreamReadyDeckIdx = -1;
    return;
  }

  noDeck.style.display = 'none';
  picker.style.display = 'flex';

  const list = document.getElementById('dr-deck-list');
  list.innerHTML = '';

  // Auto-select the first valid deck if nothing selected or index out of range
  if (STATE.dreamReadyDeckIdx < 0 || STATE.dreamReadyDeckIdx >= decks.length) {
    STATE.dreamReadyDeckIdx = 0;
  }

  decks.forEach((deck, idx) => {
    const cardCount = deck.cards.length;
    const isComplete = cardCount >= 50;
    const hasMain = !!deck.mainChar;
    const slot = document.createElement('div');
    slot.className = 'dr-deck-slot' + (idx === STATE.dreamReadyDeckIdx ? ' selected' : '');

    slot.innerHTML = `
      <div class="dr-deck-slot-radio"></div>
      <div class="dr-deck-slot-info">
        <div class="dr-deck-slot-name">${deck.name || 'Deck ' + (idx+1)}</div>
        <div class="dr-deck-slot-meta">${cardCount} cards · Main: ${hasMain ? (CARDS.find(c=>c.id===deck.mainChar)||{name:deck.mainChar}).name : 'Not set'}</div>
        ${!isComplete ? '<div class="dr-deck-slot-warn">⚠ Less than 50 cards</div>' : ''}
        ${!hasMain ? '<div class="dr-deck-slot-warn">⚠ No main character set</div>' : ''}
      </div>`;

    slot.addEventListener('click', () => {
      STATE.dreamReadyDeckIdx = idx;
      drRefreshDeckList();
    });
    list.appendChild(slot);
  });

  // Update count display for selected deck
  const sel = decks[STATE.dreamReadyDeckIdx];
  document.getElementById('dr-deck-count').textContent = `${sel.cards.length} / 50 cards`;

  // Enable JUMP only if selected deck has 50 cards
  const jumpBtn = document.getElementById('dr-jump-btn');
  const ready = sel && sel.cards.length >= 50;
  jumpBtn.disabled = !ready;
}

function drQuickEdit() {
  const decks = COLLECTION.decks || [];
  if (decks.length === 0 || STATE.dreamReadyDeckIdx < 0) return;
  const deck = decks[STATE.dreamReadyDeckIdx];

  document.getElementById('dr-qe-title').textContent = deck.name || 'Edit Deck';
  document.getElementById('dr-qe-count').textContent = deck.cards.length;

  const mainBox = document.getElementById('dr-qe-main-box');
  if (deck.mainChar) {
    const c = CARDS.find(c => c.id === deck.mainChar);
    mainBox.textContent = c ? c.name : deck.mainChar;
    mainBox.style.color = 'var(--accent-gold)';
  } else {
    mainBox.textContent = '+ Set Main Character';
    mainBox.style.color = '';
  }

  const warn = document.getElementById('dr-qe-warn');
  warn.style.display = deck.cards.length < 50 ? 'inline' : 'none';

  document.getElementById('dr-quickedit-overlay').style.display = 'flex';
}

function drPickMainChar() {
  // Reuse the card picker with mode 'main' (same as deck builder)
  const decks = COLLECTION.decks || [];
  if (decks.length === 0) return;

  // Temporarily switch active deck to the dream-ready selected one
  const prevIdx = ACTIVE_DECK_IDX;
  ACTIVE_DECK_IDX = STATE.dreamReadyDeckIdx;
  PICKER_MODE = 'main';
  PICKER_CALLBACK = (cardId) => {
    const d = COLLECTION.decks[STATE.dreamReadyDeckIdx];
    d.mainChar = cardId;
    saveCollection(COLLECTION);
    const c = CARDS.find(c => c.id === cardId);
    const mainBox = document.getElementById('dr-qe-main-box');
    mainBox.textContent = c ? c.name : cardId;
    mainBox.style.color = 'var(--accent-gold)';
    document.getElementById('dr-quickedit-overlay').style.display = 'none';
    drRefreshDeckList();
    ACTIVE_DECK_IDX = prevIdx;
  };
  openCardPicker();
}

function drCloseQuickEdit() {
  document.getElementById('dr-quickedit-overlay').style.display = 'none';
}

function drQESave() {
  // No card changes in quick edit — just main char. Already saved in drPickMainChar.
  drCloseQuickEdit();
  drRefreshDeckList();
}

function drJump() {
  const decks = COLLECTION.decks || [];
  const sel = decks[STATE.dreamReadyDeckIdx];
  const errBox = document.getElementById('dr-error');

  if (!sel || sel.cards.length < 50) {
    errBox.textContent = 'This deck cannot be used as it has less than 50 cards. Please add more.';
    errBox.style.display = 'block';
    return;
  }

  // Auto-assign main character if none set (per B3-B rules)
  if (!sel.mainChar) {
    const charCards = sel.cards.filter(id => {
      const c = CARDS.find(c => c.id === id);
      return c && ['CH','DZ','DA'].includes(c.type);
    });
    if (charCards.length > 0) {
      sel.mainChar = charCards[Math.floor(Math.random() * charCards.length)];
    } else {
      // No character cards — remove last card, add random character card
      const charPool = CARDS.filter(c => ['CH','DZ','DA'].includes(c.type) && COLLECTION.owned[c.id]);
      if (charPool.length > 0) {
        sel.cards.pop();
        sel.mainChar = charPool[Math.floor(Math.random() * charPool.length)].id;
        sel.cards.push(sel.mainChar);
      }
    }
    saveCollection(COLLECTION);
  }

  errBox.style.display = 'none';
  STATE.selectedDeck = STATE.dreamReadyDeckIdx;
  STATE.inBattle = true;
  updateFloatingMenu();
  goTo('screen-game');
  startGameIntro();
}

/* =============================================
   B4-2: GAME STATE & INITIALIZATION
   ============================================= */

/* =============================================
   BUILD CHARACTER-THEMED ENEMY DECK
   Called for both the normal CH phase and the
   Second Chance DA phase.

   charCardId  — the CH or DA card id to theme around.
   Returns a shuffled array of up to 50 card ids.

   ── Tag system used by this function ──────────
   charTag   (on CHS/CHSS/DAS/DASS/EV/DZ/LO)
             Points to the CH or DA card this card
             belongs to. e.g. charTag: '001-MCS-CH1'

   parentTag (on DZS/DZSS only)
             Points to the specific DZ card these
             Dozer skills belong to.
             e.g. parentTag: '007-MCS-DZ1'
             DZS/DZSS must NOT use charTag — use
             parentTag instead so the deck builder
             knows which Dozer they belong to.

   ── Slot breakdown (50 cards total) ──────────
   Up to 15  Character skills & Dozer skills combined:
               • CHS / CHSS  where charTag  === charCardId
               • DAS / DASS  where charTag  === charCardId
               • DZS / DZSS  where parentTag === parent DZ id
                 (pulled automatically for every DZ card
                  that has charTag === charCardId)

   Remaining  Filled in priority order:
               1. DZ   cards  where charTag === charCardId
               2. LO   cards  where charTag === charCardId
                  (falls back to territory match if no charTag)
               3. DR   cards  — random, no tag needed
               4. Padding — any non-EV non-default non-skill card
   ============================================= */
function buildCharacterDeck(charCardId) {
  const CH_SKILL_TYPES = new Set(['CHS','CHSS','DAS','DASS']);
  const DZ_SKILL_TYPES = new Set(['DZS','DZSS']);

  // Resolve the character card so we can read its territory
  const charCard      = CARDS.find(c => c.id === charCardId);
  const charTerritory = charCard?.territory || null;

  // ── Step 1: find all Dozer cards belonging to this character ──────
  const charDozers = CARDS.filter(c => c.type === 'DZ' && c.charTag === charCardId);

  // ── Step 2: collect the 15-card skill pool ────────────────────────
  // 2a. Character's own skills/sub-skills (CHS, CHSS, DAS, DASS)
  const chSkillPool = CARDS.filter(c =>
    CH_SKILL_TYPES.has(c.type) && c.charTag === charCardId
  );

  // 2b. Dozer skills/sub-skills (DZS, DZSS) — linked via parentTag
  //     to any DZ card that belongs to this character
  const dozerIds    = new Set(charDozers.map(c => c.id));
  const dzSkillPool = CARDS.filter(c =>
    DZ_SKILL_TYPES.has(c.type) && dozerIds.has(c.parentTag)
  );

  const allSkills = shuffleCopy([...chSkillPool, ...dzSkillPool]).slice(0, 15);
  const remaining = 50 - allSkills.length;

  // ── Step 3: filler cards in priority order ────────────────────────

  // 3a. Dozers tagged to this character
  const dozers    = shuffleCopy(charDozers);

  // 3b. Location cards — prefer charTag match, fall back to territory
  const loByTag   = CARDS.filter(c => c.type === 'LO' && c.charTag === charCardId);
  const loByTerritory = charTerritory
    ? CARDS.filter(c => c.type === 'LO' && !c.charTag && c.territory === charTerritory)
    : [];
  const locations = shuffleCopy([...loByTag, ...loByTerritory]);

  // 3c. Dreamscape cards — untagged, any will do
  const dreams    = shuffleCopy(CARDS.filter(c => c.type === 'DR'));

  // 3d. Padding — anything non-EV, non-default, not already a skill
  const usedIds   = new Set([
    ...allSkills.map(c => c.id),
    ...dozers.map(c => c.id),
    ...locations.map(c => c.id),
    ...dreams.map(c => c.id),
  ]);
  const padding   = shuffleCopy(CARDS.filter(c =>
    !c.isDefault &&
    c.type !== 'EV' &&
    !CH_SKILL_TYPES.has(c.type) &&
    !DZ_SKILL_TYPES.has(c.type) &&
    !usedIds.has(c.id)
  ));

  // ── Step 4: assemble & shuffle ────────────────────────────────────
  const filler = [...dozers, ...locations, ...dreams, ...padding];
  const deck   = [...allSkills, ...filler.slice(0, remaining)];

  return shuffleCopy(deck).map(c => c.id);
}

// Master game state object — reset each new game
let GS = {}; // Game Session

function initGameState() {
  const char = CHARACTERS[STATE.selectedCharacter] || {};
  const deckData = (COLLECTION.decks || [])[STATE.selectedDeck] || { cards: [], mainChar: null };

  // Build player deck (shuffle a copy)
  const playerDeckIds = [...deckData.cards];
  shuffleArray(playerDeckIds);

  // Build enemy deck themed to this character's CH card
  const enemyDeckIds = buildCharacterDeck(char.cardId);

  // Pick 3 random event cards for event selection (tagged to this character or generic)
  const evCards = CARDS.filter(c => c.type === 'EV' && (!c.charTag || c.charTag === char.cardId));
  const eventChoices = shuffleCopy(evCards).slice(0, 3);

  GS = {
    turn: 0,          // increments each half-turn (odd=player, even=enemy based on whoFirst)
    turnNumber: 1,     // display number (full rounds)
    whoFirst: null,    // 'player' or 'enemy'
    phase: 'intro',   // intro → event-select → placement → battle

    // Energy
    playerEnergy: 10,
    playerExtraEnergy: 0,
    enemyEnergy: 10,
    enemyExtraEnergy: 0,

    // Decks (array of card IDs)
    playerDeck: playerDeckIds,
    enemyDeck: enemyDeckIds,
    playerDiscard: [],
    enemyDiscard: [],
    playerBanished: [],
    enemyBanished: [],

    // Hands
    playerHand: [],
    enemyHand: [],

    // Field: 4 rows × 5 cols. rows 0-1 = enemy, rows 2-3 = player
    // Each cell: null or { cardId, owner, row, col, hp, def, atk, shd, eg, buffs[], debuffs[], attackedThisTurn, movedThisTurn, statChanged }
    field: Array.from({length: 4}, () => Array(5).fill(null)),

    // Event card on field
    activeEvent: null,
    eventChoices: eventChoices,

    // Order of action log
    actionLog: [],
    cardPlayLog: [],       // card plays this turn (C1 combo tracking)
    lastEffectiveRank: 1,  // resolved combo rank of last played card
    lastComboCard: null,   // id of card that last triggered a combo

    // Main chars
    playerMainCard: deckData.mainChar,
    enemyMainCard: null, // set from enemy deck CH cards

    // Which character's dream we jumped into (index + id stored for Second Chance lookup)
    selectedCharIndex: STATE.selectedCharacter,
    selectedCharId: CHARACTERS[STATE.selectedCharacter]?.id || null,  // FIX Bug 3

    // Summaries for results
    totalDamageDealt: 0,
    gameOver: false,
    winner: null, // 'player' | 'enemy'
    secondChance: false,
    modifiedCards: {}, // cardId → { hp, atk, def, shd, buffs, debuffs } for cards returned from field
  };

  // Determine enemy main char — FIX Bug 11: pick from enemy deck, not all cards
  const enemyCharCards = enemyDeckIds
    .map(id => CARDS.find(c => c.id === id))
    .filter(c => c && ['CH','DZ','DA'].includes(c.type));
  if (enemyCharCards.length > 0) {
    GS.enemyMainCard = enemyCharCards[Math.floor(Math.random() * enemyCharCards.length)].id;
  } else {
    // Fallback: any CH/DZ/DA card if enemy deck has none
    const fallback = CARDS.filter(c => ['CH','DZ','DA'].includes(c.type));
    if (fallback.length > 0) GS.enemyMainCard = fallback[Math.floor(Math.random() * fallback.length)].id;
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function shuffleCopy(arr) { return shuffleArray([...arr]); }

/* =============================================
   B4-2: INTRO SEQUENCE
   ============================================= */
function startGameIntro() {
  initGameState();
  buildFieldGrid();

  const char = CHARACTERS[STATE.selectedCharacter] || {};

  // Set portrait images
  const enemyImgEl  = document.getElementById('gi-enemy-img');
  const playerImgEl = document.getElementById('gi-player-img');

  // Enemy: use the chosen character's dazed image (they are the dream's antagonist)
  const dazedSrc = char.dazedImg || '';
  enemyImgEl.style.backgroundImage = dazedSrc ? `url('${dazedSrc}')` : '';
  enemyImgEl.textContent = dazedSrc ? '' : '👾';

  // Player: use player main character card art
  const playerCard = CARDS.find(c => c.id === GS.playerMainCard);
  const playerSrc  = playerCard?.img || char.img || '';
  playerImgEl.style.backgroundImage = playerSrc ? `url('${playerSrc}')` : '';
  playerImgEl.textContent = playerSrc ? '' : '🧑';

  // Hide field; show intro layer
  document.getElementById('game-field-wrap').style.opacity = '0';
  document.getElementById('game-intro').style.display = 'flex';
  document.getElementById('gi-speech').style.display = 'none';
  document.getElementById('gi-cointoss').style.display = 'none';
  document.getElementById('gi-event-select').style.display = 'none';
  document.getElementById('gi-banner').style.display = 'none';

  // Reset portrait positions
  const ep = document.getElementById('gi-enemy-portrait');
  const pp = document.getElementById('gi-player-portrait');
  ep.classList.remove('landed');
  pp.classList.remove('landed');

  // Step 1: fly portraits in after short delay
  setTimeout(() => {
    ep.classList.add('landed');
    pp.classList.add('landed');
  }, 300);

  // Step 2: show dialogue after portraits land
  setTimeout(() => showEnemyDialogue(char, () => {
    // Step 3: coin toss
    runCoinToss(() => {
      // Step 4: draw opening hands
      drawOpeningHands();
      // Step 5: event card selection
      showEventSelection(() => {
        // Step 6: placement phase — player arranges opening hand onto field
        showPlacementPhase(() => {
          // Step 7: BATTLE START banner
          showBattleStartBanner(() => {
            startBattlePhase();
          });
        });
      });
    });
  }), 1300);
}

function showEnemyDialogue(char, onDone) {
  const lines = char.dialogue || ['…'];
  const speechEl = document.getElementById('gi-speech');
  const textEl   = document.getElementById('gi-speech-text');
  speechEl.style.display = 'block';

  let lineIdx = 0;
  function typeLine() {
    if (lineIdx >= lines.length) { setTimeout(onDone, 500); return; }
    const line = lines[lineIdx];
    textEl.textContent = '';
    let charIdx = 0;
    const timer = setInterval(() => {
      textEl.textContent += line[charIdx];
      charIdx++;
      if (charIdx >= line.length) {
        clearInterval(timer);
        lineIdx++;
        setTimeout(typeLine, 5000); // 5s pause between lines
      }
    }, 60); // ~60ms per character
  }
  typeLine();
}

function runCoinToss(onDone) {
  document.getElementById('gi-speech').style.display = 'none';
  const ctEl    = document.getElementById('gi-cointoss');
  const lblEl   = document.getElementById('gi-cointoss-label');
  const coinEl  = document.getElementById('gi-coin');
  ctEl.style.display = 'flex';

  // Determine who goes first: higher ATK main char goes first; ties = random
  const pCard = CARDS.find(c => c.id === GS.playerMainCard);
  const eCard = CARDS.find(c => c.id === GS.enemyMainCard);
  const pAtk  = pCard?.atk ?? 0;
  const eAtk  = eCard?.atk ?? 0;

  let result;
  if (pAtk > eAtk)       result = 'player';
  else if (eAtk > pAtk)  result = 'enemy';
  else                   result = Math.random() < 0.5 ? 'player' : 'enemy';
  GS.whoFirst = result;

  // Animate coin for 2s then reveal result
  setTimeout(() => {
    coinEl.style.animation = 'none';
    coinEl.textContent = result === 'player' ? '⭐' : '💀';
    lblEl.textContent  = result === 'player' ? 'You go first!' : 'Enemy goes first!';
    setTimeout(() => {
      ctEl.style.display = 'none';
      onDone();
    }, 1800);
  }, 2200);
}

function drawOpeningHands() {
  // Draw 5 cards each — no draw on very first turn (handled in B4-3)
  for (let i = 0; i < 5; i++) {
    drawCard('player', false);
    drawCard('enemy',  false);
  }
}

/* =============================================
   B4-3-B: DRAWING CARDS
   Draws 1 card for 'player' or 'enemy'.
   - Reshuffles discard into deck when deck hits 0 (B4-3-B spec).
   - Animates the card flying from the deck pile to the hand (player only).
   - Enemy draw is silent (hand hidden per spec).
   - animate=false skips the fly-in (used for opening hand draw).
   ============================================= */
function drawCard(who, animate = true) {
  const deckKey    = who === 'player' ? 'playerDeck'    : 'enemyDeck';
  const handKey    = who === 'player' ? 'playerHand'    : 'enemyHand';
  const discardKey = who === 'player' ? 'playerDiscard' : 'enemyDiscard';

  // Reshuffle discard into deck if deck is empty (B4-3-B)
  if (GS[deckKey].length === 0) {
    if (GS[discardKey].length === 0) return; // truly nothing left
    GS[deckKey] = shuffleCopy(GS[discardKey]);
    GS[discardKey] = [];
    updatePileCounts();
    if (who === 'player') {
      showToast('Deck reshuffled from discard pile!');
      // FEATURE: trigger when_shuffled for all player deck cards
      triggerIgvEvent('when_shuffled', who);
    }
  }

  const cardId = GS[deckKey].shift();
  GS[handKey].push(cardId);
  updatePileCounts();

  // FEATURE: trigger when_drawn igv effects
  const drawnCard = CARDS.find(c => c.id === cardId);
  // ── C3-1-A: mark lastAction on the drawn card's instance ──
  const drawnInst = getCardInstance(cardId, who) || { cardId };
  _trackAction(drawnInst, 'drawn');
  if (drawnCard) applyCardEffect(drawnCard, 'when_drawn', who);

  if (who === 'player') {
    if (animate) {
      animateCardDraw(() => renderPlayerHand());
    } else {
      renderPlayerHand();
    }
  }
  // Enemy draw: hand stays hidden, nothing to render
}

/* Animates a card flying from the deck pile down to the hand drawer.
   Calls onDone() when the animation finishes so hand re-renders at the right moment. */
function animateCardDraw(onDone) {
  const pileEl = document.getElementById('gf-deck-player');
  const drawerEl = document.getElementById('gf-hand-drawer');
  if (!pileEl || !drawerEl) { if (onDone) onDone(); return; }

  // Create a ghost card element that flies from pile to drawer
  const pileRect   = pileEl.getBoundingClientRect();
  const drawerRect = drawerEl.getBoundingClientRect();

  const ghost = document.createElement('div');
  ghost.style.cssText = `
    position: fixed;
    width: ${pileRect.width}px;
    height: ${pileRect.height}px;
    left: ${pileRect.left}px;
    top: ${pileRect.top}px;
    background: var(--bg-panel);
    border: 1px solid var(--accent-gold);
    border-radius: 3px;
    pointer-events: none;
    z-index: 999;
    opacity: 1;
    transition: left 0.35s cubic-bezier(.4,0,.2,1),
                top  0.35s cubic-bezier(.4,0,.2,1),
                opacity 0.15s ease 0.25s;
  `;
  document.body.appendChild(ghost);

  // Target: center-bottom of drawer tab
  const targetX = drawerRect.left + drawerRect.width / 2 - pileRect.width / 2;
  const targetY = drawerRect.top;

  // Kick off animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ghost.style.left    = targetX + 'px';
      ghost.style.top     = targetY + 'px';
      ghost.style.opacity = '0';
    });
  });

  setTimeout(() => {
    ghost.remove();
    if (onDone) onDone();
    // Flash the pile to confirm draw
    pileEl.style.transition = 'transform 0.12s ease';
    pileEl.style.transform  = 'scale(1.18)';
    setTimeout(() => { pileEl.style.transform = 'scale(1)'; }, 130);
  }, 400);
}

function showEventSelection(onDone) {
  if (GS.eventChoices.length === 0) { onDone(); return; }

  const esEl    = document.getElementById('gi-event-select');
  const cardsEl = document.getElementById('gi-event-cards');
  esEl.style.display = 'flex';
  cardsEl.innerHTML  = '';

  GS.eventChoices.forEach(card => {
    const opt = document.createElement('div');
    opt.className = 'gi-event-card-option';
    opt.innerHTML = `
      <div class="gi-event-card-icon">${eventTypeIcon(card.eventType)}</div>
      <div style="font-weight:700;color:var(--text-main);font-size:10px;">${card.name}</div>
      <div style="font-size:9px;color:var(--text-dim);">${card.eventType || 'Event'}</div>`;
    opt.addEventListener('click', () => {
      GS.activeEvent = card;
      esEl.style.display = 'none';
      renderEventCard();
      onDone();
    });
    cardsEl.appendChild(opt);
  });
}

function eventTypeIcon(type) {
  const icons = { Lucid:'✨', Nightmare:'💀', Liminal:'🌀', Recurring:'🔁', Daydream:'💭', Fever:'🔥' };
  return icons[type] || '🃏';
}

/* =============================================
   B4-2: PLACEMENT PHASE
   Shows the field early so the player can drag cards
   from their opening hand onto their side before battle.
   Enemy AI silently pre-places its cards too.
   Player clicks BEGIN BATTLE when ready.
   ============================================= */
function showPlacementPhase(onDone) {
  GS.phase = 'placement';
  _placementDone = onDone;

  // Reveal the field at reduced opacity so player can place cards
  const fieldWrap = document.getElementById('game-field-wrap');
  fieldWrap.style.opacity = '1';
  updateFieldPortraits();
  updateEnergyBars();
  updatePileCounts();
  renderPlayerHand();
  initMainCharHp();

  // Wire field cells for drag-drop (player rows only — already done in buildFieldGrid,
  // but ensure the hand drawer is openable)
  wireFieldCellClicks();

  // Enemy AI silently pre-places affordable CH/DZ/DA cards
  const toPlay = [...GS.enemyHand].filter(id => {
    const c = CARDS.find(c => c.id === id);
    return c && ['CH','DZ','DA'].includes(c.type) && (c.eg ?? 1) <= GS.enemyEnergy;
  });
  toPlay.forEach(cardId => {
    for (let r = 1; r >= 0; r--) {
      let placed = false;
      for (let col = 0; col < 5 && !placed; col++) {
        if (!GS.field[r][col]) {
          const card = CARDS.find(c => c.id === cardId);
          if (!card) break;
          GS.field[r][col] = {
            cardId, owner: 'enemy', row: r, col,
            atk: card.atk ?? 0, def: card.def ?? 0,
            hp: card.hp ?? 0, shd: card.shd ?? 0,
            eg: card.eg ?? 1,
            maxHp: card.hp ?? 0, maxShd: card.shd ?? 0,
            currentHP: card.hp ?? 0, currentATK: card.atk ?? 0,
            currentDEF: card.def ?? 0, currentSHD: card.shd ?? 0,
            fieldRow: r, fieldCol: col,
            attackedThisTurn: false, movedThisTurn: false,
            buffs: [], debuffs: [], appliedBuffs: [], appliedDebuffs: [],
            statChanged: false, lastAction: 'played',
            canAttack: true, canMove: true, canBeAttacked: true,
            canBeBuffed: true, canBeDebuffed: true,
            faceDown: true,  // FEATURE: hidden until first enemy turn ends
          };
          const idx = GS.enemyHand.indexOf(cardId);
          if (idx > -1) GS.enemyHand.splice(idx, 1);
          renderFieldCell(r, col);
          placed = true;
        }
      }
    }
  });

  // Show placement overlay
  const plEl = document.getElementById('gi-placement');
  plEl.style.display = 'flex';
  plEl.classList.add('active');
}

let _placementDone = null;

function endPlacementPhase() {
  const plEl = document.getElementById('gi-placement');
  plEl.style.display = 'none';
  plEl.classList.remove('active');

  // Hide field again so BATTLE START banner shows cleanly over it
  document.getElementById('game-field-wrap').style.opacity = '0';

  if (typeof _placementDone === 'function') {
    const cb = _placementDone;
    _placementDone = null;
    cb();
  }
}

function showBattleStartBanner(onDone) {
  const banner = document.getElementById('gi-banner');
  banner.style.display = 'block';
  setTimeout(() => {
    banner.style.display = 'none';
    onDone();
  }, 2000);
}

function startBattlePhase() {
  // Hide intro, show field
  document.getElementById('game-intro').style.display = 'none';
  const fieldWrap = document.getElementById('game-field-wrap');
  fieldWrap.style.opacity = '1';

  // Set portrait art on field HUD
  updateFieldPortraits();
  updateEnergyBars();
  updatePileCounts();
  renderPlayerHand();

  // B4-4: Initialise main character HP tracking
  initMainCharHp();

  GS.phase = 'battle';
  GS.turn  = 1;

  // B4-3-E: wire enemy portrait for attack clicks
  const enemyPortrait = document.getElementById('gf-enemy-portrait');
  if (enemyPortrait) {
    enemyPortrait.onclick = (e) => onPortraitClickAttack(e);
  }

  // B4-3-E: wire all field cells for move/attack target clicks
  wireFieldCellClicks();

  // Show first turn banner
  const isPlayerFirst = GS.whoFirst === 'player';
  showTurnBanner(isPlayerFirst ? "Player's Turn" : "Enemy's Turn", 1, () => {
    if (!isPlayerFirst) {
      // Enemy goes first — run enemy turn then hand to player
      document.getElementById('gf-nextturn-btn').disabled = true;
      runEnemyTurn();
    } else {
      // Player goes first — enemy's placement-phase cards stay face-down until enemy's first turn
      // (revealEnemyCards is called at the end of runEnemyTurn)
      document.getElementById('gf-nextturn-btn').disabled = false;
    }
  });
}

/* =============================================
   B4-2: FIELD GRID BUILD
   ============================================= */
function buildFieldGrid() {
  const grid = document.getElementById('gf-grid');
  grid.innerHTML = '';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      cell.className = 'gf-cell ' + (row < 2 ? 'enemy-zone' : 'player-zone');
      cell.id = `gf-cell-${row}-${col}`;
      // Shadow for drag-drop
      const shadow = document.createElement('div');
      shadow.className = 'gf-cell-shadow';
      shadow.id = `gf-shadow-${row}-${col}`;
      cell.appendChild(shadow);
      // Drop zone for player rows
      if (row >= 2) {
        cell.addEventListener('dragover', e => { e.preventDefault(); showCellShadow(row, col); });
        cell.addEventListener('dragleave', () => hideCellShadow(row, col));
        cell.addEventListener('drop', e => { e.preventDefault(); dropCardOnCell(row, col); });
      }
      grid.appendChild(cell);
    }
  }
}

function showCellShadow(row, col) {
  const shadow = document.getElementById(`gf-shadow-${row}-${col}`);
  if (shadow) shadow.style.display = 'block';
}
function hideCellShadow(row, col) {
  const shadow = document.getElementById(`gf-shadow-${row}-${col}`);
  if (shadow) shadow.style.display = 'none';
}

/* =============================================
   B4-2: HUD UPDATES
   ============================================= */
function updateFieldPortraits() {
  const char = CHARACTERS[STATE.selectedCharacter] || {};
  // Enemy portrait = dazed / character depending on secondChance
  const enemySrc = GS.secondChance ? (char.dazedImg || '') : (char.img || '');
  const epBox = document.getElementById('gf-enemy-portrait');
  epBox.style.backgroundImage = enemySrc ? `url('${enemySrc}')` : '';
  epBox.textContent = enemySrc ? '' : '👾';

  const playerCard = CARDS.find(c => c.id === GS.playerMainCard);
  const ppSrc = playerCard?.img || char.img || '';
  const ppBox = document.getElementById('gf-player-portrait');
  ppBox.style.backgroundImage = ppSrc ? `url('${ppSrc}')` : '';
  ppBox.textContent = ppSrc ? '' : '🧑';
}

function updateEnergyBars() {
  ['player','enemy'].forEach(who => {
    const energy = who === 'player' ? GS.playerEnergy : GS.enemyEnergy;
    const extra  = who === 'player' ? GS.playerExtraEnergy : GS.enemyExtraEnergy;
    for (let i = 0; i < 10; i++) {
      const pip = document.getElementById(`gf-${who}-e${i}`);
      if (pip) pip.classList.toggle('active', i < energy);
    }
    const extraEl = document.getElementById(`gf-${who}-extra`);
    if (extraEl) extraEl.textContent = extra;
  });
}

function updatePileCounts() {
  document.getElementById('gf-deck-player-count').textContent    = GS.playerDeck?.length    ?? 0;
  document.getElementById('gf-deck-enemy-count').textContent     = GS.enemyDeck?.length     ?? 0;
  document.getElementById('gf-discard-player-count').textContent = GS.playerDiscard?.length ?? 0;
  document.getElementById('gf-discard-enemy-count').textContent  = GS.enemyDiscard?.length  ?? 0;
}

function renderEventCard() {
  const slot = document.getElementById('gf-event-card');
  if (!GS.activeEvent) { slot.innerHTML = '<div class="gf-event-empty">Event</div>'; return; }
  slot.innerHTML = `
    <div style="font-size:18px;">${eventTypeIcon(GS.activeEvent.eventType)}</div>
    <div style="font-size:8px;color:var(--text-dim);text-align:center;padding:2px;">${GS.activeEvent.name}</div>`;
}

/* =============================================
   B4-2: HAND RENDERING
   ============================================= */
let DRAGGING_CARD_ID = null;
let DRAWER_OPEN = false;

function toggleDrawer() {
  DRAWER_OPEN = !DRAWER_OPEN;
  document.getElementById('gf-hand-drawer').classList.toggle('open', DRAWER_OPEN);
  // FIX Bug 9: update the tab text without destroying the existing #gf-hand-count span
  const tab = document.getElementById('gf-drawer-tab');
  const arrow = DRAWER_OPEN ? '▼' : '▲';
  // Find or reuse the existing count span — never recreate it so the id stays stable
  let countSpan = document.getElementById('gf-hand-count');
  if (!countSpan) {
    countSpan = document.createElement('span');
    countSpan.id = 'gf-hand-count';
  }
  countSpan.textContent = GS.playerHand?.length ?? 0;
  tab.textContent = `${arrow} Hand (`;
  tab.appendChild(countSpan);
  tab.appendChild(document.createTextNode(')'));
}

function renderPlayerHand() {
  const container = document.getElementById('gf-drawer-cards');
  const countEl   = document.getElementById('gf-hand-count');
  if (!GS.playerHand) return;
  if (countEl) countEl.textContent = GS.playerHand.length;
  container.innerHTML = '';

  GS.playerHand.forEach((entry, idx) => {
    // Hand may hold plain ID strings (drawn cards) or inst objects (returned/revived cards)
    const cardId = (typeof entry === 'object' && entry !== null) ? entry.cardId : entry;
    const card = CARDS.find(c => c.id === cardId);
    if (!card) return;

    // A card is "modified" if it came back from the field with changed stats
    const isModified = GS.modifiedCards && GS.modifiedCards[cardId];

    const div = document.createElement('div');
    div.className = 'gf-hand-card' + (isModified ? ' modified-card' : '');
    div.dataset.cardId = cardId;
    if (card.img && !isModified) {
      div.style.backgroundImage = `url('${card.img}')`;
    } else if (isModified) {
      // Rectangular stat view for modified cards
      const mc = GS.modifiedCards[cardId];
      div.innerHTML = `
        <div style="width:100%;font-size:7px;color:var(--text-main);text-align:center;padding:2px;">
          ${card.name}<br>
          <span style="color:#fff;">ATK ${mc.atk ?? card.atk ?? 0}</span> /
          <span style="color:#a8d8ff;">DEF ${mc.def ?? card.def ?? 0}</span><br>
          HP ${mc.hp ?? card.hp ?? 0} / SHD ${mc.shd ?? card.shd ?? 0}
        </div>`;
    } else {
      div.textContent = card.name;
    }

    // B4-3-G: Click-to-use for non-field cards (DR, LO, EV, skill cards)
    // Field cards (CH, DZ, DA) stay drag-only; all others get a click handler
    const onFieldTypes = ['CH','DZ','DA'];
    if (!onFieldTypes.includes(card.type)) {
      div.classList.add('use-prompt');
      div.title = `Click to use ${card.name}`;
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        useNonFieldCard(cardId, idx);
      });
    }

    // Drag to place on field
    div.draggable = true;
    div.addEventListener('dragstart', () => {
      DRAGGING_CARD_ID = cardId;
      DRAGGING_HAND_IDX = idx;
      DRAWER_OPEN = true;
      document.getElementById('gf-hand-drawer').classList.add('open');
    });
    div.addEventListener('dragend', () => { clearAllShadows(); });

    // Hold to view enlarged UI
    div.addEventListener('mouseenter', e => showEnlargedCard(card, GS.modifiedCards?.[cardId], e));
    div.addEventListener('mouseleave', () => hideEnlargedCard());

    container.appendChild(div);
  });
}

let DRAGGING_HAND_IDX = -1;

function dropCardOnCell(row, col) {
  hideCellShadow(row, col);
  if (DRAGGING_CARD_ID === null || DRAGGING_HAND_IDX < 0) return;
  if (GS.field[row][col] !== null) { showToast('That cell is occupied.'); return; }

  const cardId = DRAGGING_CARD_ID;
  const card   = CARDS.find(c => c.id === cardId);
  if (!card) return;

  // Check energy cost
  const cost = card.eg ?? 1;
  if (GS.playerEnergy + GS.playerExtraEnergy < cost) {
    showToast('Not enough Energy!');
    DRAGGING_CARD_ID = null; DRAGGING_HAND_IDX = -1; return;
  }

  // Only stat cards go on field (CH, DZ, DA); others use the non-field play system
  const onFieldTypes = ['CH','DZ','DA'];
  if (!onFieldTypes.includes(card.type)) {
    // Route to non-field play (B4-3-G) — use the hand index we stored
    useNonFieldCard(cardId, DRAGGING_HAND_IDX);
    DRAGGING_CARD_ID = null; DRAGGING_HAND_IDX = -1;
    return;
  }

  // Place card
  const mc = GS.modifiedCards?.[cardId];
  GS.field[row][col] = {
    cardId, owner: 'player', row, col,
    atk: mc?.atk ?? card.atk ?? 0,
    def: mc?.def ?? card.def ?? 0,
    hp:  mc?.hp  ?? card.hp  ?? 0,
    shd: mc?.shd ?? card.shd ?? 0,
    eg:  cost,
    maxHp:  card.hp  ?? 0,
    maxShd: card.shd ?? 0,
    attackedThisTurn: false,
    movedThisTurn: false,
    buffs: [], debuffs: [],
  };

  // Deduct energy
  let remaining = cost;
  if (GS.playerExtraEnergy > 0) {
    const useExtra = Math.min(GS.playerExtraEnergy, remaining);
    GS.playerExtraEnergy -= useExtra;
    remaining -= useExtra;
  }
  GS.playerEnergy = Math.max(0, GS.playerEnergy - remaining);

  // Remove from hand
  GS.playerHand.splice(DRAGGING_HAND_IDX, 1);
  if (GS.modifiedCards) delete GS.modifiedCards[cardId];

  // Log action
  GS.actionLog.push({ type: 'play', who: 'player', cardId, row, col });
  GS.cardPlayLog.push({ cardId, turn: GS.turn });
  logAction(`Played "${card.name}" to row ${row - 1}, col ${col + 1}.`, 'play');

  // ── C3-1-A: mark lastAction on the placed card instance ──
  const placedInst = GS.field[row]?.[col];
  if (placedInst) _trackAction(placedInst, 'played');

  // Trigger when_played effect hook (B4-3-G / C2 placeholder)
  applyCardEffect(card, 'when_played', 'player');

  // Re-render
  renderFieldCell(row, col);
  renderPlayerHand();
  updateEnergyBars();

  DRAGGING_CARD_ID = null;
  DRAGGING_HAND_IDX = -1;
}

/* =============================================
   B4-3-G: NON-FIELD CARD PLAY SYSTEM

   Cards that are not CH/DZ/DA do not go on the Field.
   When played, they:
   1. Cost their EG energy (same rule — error if insufficient).
   2. Trigger their card effect (placeholder hook: applyCardEffect).
   3. Immediately move to the player's discard pile.
   4. Are logged in the action log and counted in the order of action.

   Card types handled here:
   - CHS, CHSS  — Character skills (require matching CH on field)
   - DZS, DZSS  — Dozer skills (require matching DZ on field)
   - DAS, DASS  — Dazed skills  (require matching DA on field)
   - DR          — Dreamscape   (playable any time)
   - LO          — Location     (playable any time)
   - EV          — Event        (handled separately via B4-2-B; blocked here)
   ============================================= */


function useNonFieldCard(cardId, handIdx) {
  if (!isPlayerTurn() || GS_PAUSED) return;

  const card = CARDS.find(c => c.id === cardId);
  if (!card) return;

  const cost = card.eg ?? 1;

  // Energy check
  const totalEnergy = GS.playerEnergy + GS.playerExtraEnergy;
  if (totalEnergy < cost) {
    showToast(`Not enough Energy! Need ${cost}, have ${totalEnergy}.`);
    return;
  }

  // Skill cards: check that the parent card type is on the player's field
  const parentType = SKILL_PARENT_MAP[card.type];
  if (parentType) {
    const parentOnField = _findParentOnField(card, parentType);
    if (!parentOnField) {
      const typeLabel = { CH:'Character', DZ:'Dozer', DA:'Dazed' }[parentType] ?? parentType;
      showToast(`Requires a ${typeLabel} card on the Field to play this skill.`);
      return;
    }
  }

  // EV cards: blocked from manual play here (they're picked at game start — B4-2-B)
  if (card.type === 'EV') {
    showToast('Event cards are chosen at the start of the battle, not played from hand.');
    return;
  }

  // Deduct energy (extra first, then main)
  let remaining = cost;
  if (GS.playerExtraEnergy > 0) {
    const useExtra = Math.min(GS.playerExtraEnergy, remaining);
    GS.playerExtraEnergy -= useExtra;
    remaining -= useExtra;
  }
  GS.playerEnergy = Math.max(0, GS.playerEnergy - remaining);

  // Remove from hand
  GS.playerHand.splice(handIdx, 1);
  if (GS.modifiedCards) delete GS.modifiedCards[cardId];

  // Log to action log (B4-3-F) and order of action
  const typeLabel = _cardTypeLabel(card.type);
  logAction(`Used ${typeLabel} card: "${card.name}" (cost ${cost} EG).`, 'play');
  GS.actionLog.push({ type: 'play', who: 'player', cardId });
  GS.cardPlayLog.push({ cardId, turn: GS.turn });

  // Trigger card effect hook (B4 card effects — placeholder for C2 system)
  applyCardEffect(card, 'when_played', 'player');

  // Discard the card
  discardFromHand(cardId, 'player');

  // Re-render
  renderPlayerHand();
  updateEnergyBars();

  showToast(`${card.name} used!`);
}

/* Check if any player field card matches the required parent type.
   For skill cards, the match is by card type (CH/DZ/DA).
   Optionally could match by character ID from card's unique number — extensible later. */
function _findParentOnField(skillCard, parentType) {
  for (let r = 2; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = GS.field[r][c];
      if (!cell || cell.owner !== 'player') continue;
      const fieldCard = CARDS.find(cd => cd.id === cell.cardId);
      if (fieldCard && fieldCard.type === parentType) return cell;
    }
  }
  return null;
}

/* Friendly label for card types */
function _cardTypeLabel(type) {
  const labels = {
    CH:'Character', DZ:'Dozer', DA:'Dazed',
    CHS:'Character Skill', CHSS:'Character Sub-Skill',
    DZS:'Dozer Skill',     DZSS:'Dozer Sub-Skill',
    DAS:'Dazed Skill',     DASS:'Dazed Sub-Skill',
    DR:'Dreamscape', LO:'Location', EV:'Event',
  };
  return labels[type] ?? type;
}

/* =============================================
   C1: CROSSWORD COMBO SYSTEM
   ─────────────────────────────────────────────
   CONCEPTS (from spec):
   Special letters [X]  — letters that CAN join another card's word.
   Merged letters  <X>  — letters already pre-joined in the card name.

   Base combo rank from mergedLetters count:
     Single = 1  (0 merged letters)
     Pair   = 2  (1 merged letter)
     Triple = 3  (2 merged letters)
     Multi  = 4  (3+ merged letters)

   H-Word / V-Word orientation per word — combos only fire when the
   shared special letter appears in OPPOSITE orientations across cards.

   Combo math (capped at 4=Multi):
     currRank + prevRank - 1
     e.g. Pair(2)+Pair(2)=Multi(4), Single(1)+Single(1)=Pair(2)

   CURRENT card's rank is upgraded. Previous card is NOT changed.
   Combos only fire when cards are actively PLAYED this turn.
   ============================================= */

function getBaseComboRank(card) {
  const merged = (card.mergedLetters || []).length;
  if (merged === 0) return 1;
  if (merged === 1) return 2;
  if (merged === 2) return 3;
  return 4;
}

function rankLabel(n) {
  return ['','single','pair','triple','multi'][Math.min(n,4)] || 'multi';
}

/* canCombo(prevCard, currCard)
   Returns true if the two cards share a special letter that appears
   in OPPOSITE orientations (H in one card, V in the other).

   Card word data format (set by you in CARDS array):
     card.words = [
       { text:'APPLE', special:['A','E'], merged:['E'], orientation:'H' },
       { text:'TREE',  special:['T'],     merged:['E'], orientation:'V' },
     ]
*/
function canCombo(prevCard, currCard) {
  function specialOrientations(words) {
    const map = {};
    (words || []).forEach(w => {
      const o = (w.orientation || 'H').toUpperCase();
      (w.special || []).forEach(l => {
        const k = l.toUpperCase();
        if (!map[k]) map[k] = new Set();
        map[k].add(o);
      });
    });
    return map;
  }
  const pMap = specialOrientations(prevCard.words);
  const cMap = specialOrientations(currCard.words);
  for (const letter of Object.keys(pMap)) {
    if (!cMap[letter]) continue;
    if (
      (pMap[letter].has('H') && cMap[letter].has('V')) ||
      (pMap[letter].has('V') && cMap[letter].has('H'))
    ) return true;
  }
  return false;
}

/* resolveComboRank(currCard)
   Checks the previous card in cardPlayLog. If combo conditions met,
   upgrades current card's effective rank.
   Returns { effectiveRank, comboFired, prevCard }
*/
function resolveComboRank(currCard) {
  const log = GS.cardPlayLog || [];
  if (log.length < 2) {
    return { effectiveRank: getBaseComboRank(currCard), comboFired: false, prevCard: null };
  }
  const prevEntry = log[log.length - 2];
  const prevCard  = CARDS.find(c => c.id === prevEntry.cardId);
  if (!prevCard) {
    return { effectiveRank: getBaseComboRank(currCard), comboFired: false, prevCard: null };
  }
  const currBase = getBaseComboRank(currCard);
  const prevBase = getBaseComboRank(prevCard);
  if (!canCombo(prevCard, currCard)) {
    return { effectiveRank: currBase, comboFired: false, prevCard };
  }
  const upgraded = Math.min(4, currBase + prevBase - 1);
  return { effectiveRank: upgraded, comboFired: true, prevCard };
}

/* =============================================
   CARD EFFECT DISPATCHER
   applyCardEffect(card, igv, who)
   igv: 'when_played' | 'start_of_turn' | 'end_of_turn' |
        'on_attack' | 'on_defend' | 'on_death' | 'on_draw'
   who: 'player' | 'enemy'

   For 'when_played': resolves C1 combo rank first, then
   passes resolved rank to evaluateEffects (C2 engine).
   ============================================= */
function applyCardEffect(card, igv, who) {
  if (!card || !card.effects || card.effects.length === 0) return;

  // ── C3-1-A: log action into cardPlayOrder ──────────────────────────
  // NOTE: _trackAction() is called at the source of each action (draw,
  // play, attack, move, pick, banish, revive, return). applyCardEffect
  // is triggered AFTER those sites, so we do NOT push again here to
  // avoid double-counting in GS.cardPlayOrder.
  // ───────────────────────────────────────────────────────────────────

  let effectiveRank = getBaseComboRank(card);
  let comboFired    = false;
  let prevCard      = null;

  if (igv === 'when_played' && who === 'player') {
    const result  = resolveComboRank(card);
    effectiveRank = result.effectiveRank;
    comboFired    = result.comboFired;
    prevCard      = result.prevCard;

    if (comboFired) {
      const label = rankLabel(effectiveRank).toUpperCase();
      logAction(`COMBO! "${prevCard.name}" + "${card.name}" -> ${label}`, 'system');
      showToast(`Combo! ${label}!`);
    }
  }

  GS.lastEffectiveRank = effectiveRank;
  GS.lastComboCard     = card.id;

  evaluateEffects(card, igv, who, effectiveRank);
}

/* =============================================
   C2: CARD EFFECTS SYSTEM
   ─────────────────────────────────────────────
   Full implementation of Sections C2, C2-A, C2-1
   through C2-4 (one_time, lingering, buff, debuff).

   Each card stores:
     card.effects = [ "1)cet:one_time>>condition:pair>>draw:2>>igv:when_played", ... ]
     card.appliedBuffs  = []   (runtime, per-instance)
     card.appliedDebuffs= []   (runtime, per-instance)

   C2-A SYNTAX LEGEND
     :   separator (variable:value)
     =   set numeric
     -+  subtract/add
     < > less/greater
     >> "then" chain
     ;  "and"
     /  "or"
     ~  "but"
     !  "not"
     >< "between" (two comma-separated numbers)
     *  repeat (draw:2*3 = draw 2, three times)
     %  percent chance  (draw:2%50 = 50% chance)
     n) numbered execution order
     @  variable reference  (ATK:+50%@baseATK)
   ============================================= */

/* ── LINGERING EFFECT REGISTRY ─────────────────
   Stores ongoing lingering effects so they fire
   every turn until removed.
   Entry: { cardId, igv, effectStr, who, turnsLeft, permanent }
*/
const LINGERING_REGISTRY = [];

function registerLingering(cardId, igv, effectStr, who, turnsLeft) {
  // Avoid duplicate
  const exists = LINGERING_REGISTRY.find(e =>
    e.cardId === cardId && e.effectStr === effectStr && e.igv === igv);
  if (!exists) {
    LINGERING_REGISTRY.push({ cardId, igv, effectStr, who,
      turnsLeft: turnsLeft ?? Infinity, permanent: turnsLeft == null });
  }
}

function tickLingeringRegistry(igv, who) {
  for (let i = LINGERING_REGISTRY.length - 1; i >= 0; i--) {
    const entry = LINGERING_REGISTRY[i];
    if (entry.igv !== igv) continue;
    // Resolve card instance from field or hand
    const inst = getCardInstance(entry.cardId, entry.who);
    if (!inst) { LINGERING_REGISTRY.splice(i, 1); continue; }
    const card = CARDS.find(c => c.id === inst.cardId || c.id === entry.cardId);
    if (!card) continue;
    executeEffectAction(entry.effectStr, card, inst, entry.who,
                        getBaseComboRank(card));
    if (!entry.permanent && isFinite(entry.turnsLeft)) {
      entry.turnsLeft--;
      if (entry.turnsLeft <= 0) LINGERING_REGISTRY.splice(i, 1);
    }
  }
}

/* ── BUFF / DEBUFF DEFINITIONS ──────────────────
   Global registry: BUFF_DEFS / DEBUFF_DEFS
   Each entry: { id, effectCode, stacks, permanent, undispellable, iconColor }
   Created by card designers; applied/stored per card instance.
*/
const BUFF_DEFS   = {};
const DEBUFF_DEFS = {};

function defineBuffDebuff(id, code, opts = {}) {
  const entry = { id, code,
    label        : opts.label         ?? id.replace(/_/g, ' '),
    img          : opts.img           ?? '',
    stacks       : opts.stacks        ?? 1,
    permanent    : opts.permanent     ?? false,
    undispellable: opts.undispellable ?? false,
    iconColor    : opts.iconColor     ?? (opts.isDebuff ? '#e03c5a' : '#00c9c8'),
    isDebuff     : opts.isDebuff      ?? false
  };
  if (opts.isDebuff) DEBUFF_DEFS[id] = entry;
  else               BUFF_DEFS[id]   = entry;
}

/* ── AUTO-REGISTER BUFFS / DEBUFFS FROM data.js ─
   Reads BUFFS[] and DEBUFFS[] defined in data.js
   and registers them via defineBuffDebuff().
   Called once at init after data.js is loaded.
*/
function registerBuffsFromData() {
  (window.BUFFS   || []).forEach(b => defineBuffDebuff(b.id, b.code || '', { ...b, isDebuff: false }));
  (window.DEBUFFS || []).forEach(d => defineBuffDebuff(d.id, d.code || '', { ...d, isDebuff: true  }));
}

/* ── INSTANCE HELPER ────────────────────────────
   Returns { cardId, row, col, stats } for a card
   currently on the field by logical card id.
*/
function getCardInstance(cardId, who) {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++) {
      const cell = GS.field[r][c];
      if (cell && (cell.cardId === cardId || cell.uniqueCode === cardId))
        return cell;
    }
  return null;
}

/* ── C2-A TOKENISER ─────────────────────────────
   parseEffectToken(str)
   Splits a single atom like "HP:-5" into
   { key:'HP', op:'-', val:'5', ref:null, percent:null, repeat:null }
*/
function parseEffectToken(str) {
  str = str.trim();
  // @ref extraction
  let ref = null;
  const atIdx = str.indexOf('@');
  if (atIdx !== -1) {
    ref = str.slice(atIdx + 1);
    str = str.slice(0, atIdx);
  }
  // % chance extraction
  let percent = null;
  const pctMatch = str.match(/%(\d+)$/);
  if (pctMatch) { percent = parseInt(pctMatch[1], 10); str = str.slice(0, -pctMatch[0].length); }
  // * repeat extraction
  let repeat = null;
  const repMatch = str.match(/\*(\d+)$/);
  if (repMatch) { repeat = parseInt(repMatch[1], 10); str = str.slice(0, -repMatch[0].length); }
  // key:val split
  const colonIdx = str.indexOf(':');
  if (colonIdx === -1) return { key: str, op: null, val: null, ref, percent, repeat };
  const key = str.slice(0, colonIdx);
  let rest  = str.slice(colonIdx + 1);
  // operator
  let op = null;
  if (rest.startsWith('=-')) { op = '=-'; rest = rest.slice(2); }
  else if (rest.startsWith('=+')) { op = '=+'; rest = rest.slice(2); }
  else if (rest.startsWith('='))  { op = '=';  rest = rest.slice(1); }
  else if (rest.startsWith('-'))  { op = '-';  rest = rest.slice(1); }
  else if (rest.startsWith('+'))  { op = '+';  rest = rest.slice(1); }
  return { key, op, val: rest, ref, percent, repeat };
}

/* ── C2-1: CONDITION EVALUATOR ──────────────────
   evaluateCondition(condStr, card, inst, who, effectiveRank)
   condStr examples:
     "pair"   "HP<5"  "buff:increase_atk"  "debuff:poisoned"
     "single;HP>3"  "card_type:character"
*/
function evaluateCondition(condStr, card, inst, who, effectiveRank) {
  condStr = condStr.trim();

  // Multiple conditions joined by ; (AND) or / (OR) or ~ (BUT)
  // BUT (~): first part must be true AND second must be false
  if (condStr.includes('~')) {
    const parts = condStr.split('~');
    return evaluateCondition(parts[0], card, inst, who, effectiveRank) &&
          !evaluateCondition(parts[1], card, inst, who, effectiveRank);
  }
  if (condStr.includes('/')) {
    return condStr.split('/').some(p => evaluateCondition(p.trim(), card, inst, who, effectiveRank));
  }
  if (condStr.includes(';')) {
    return condStr.split(';').every(p => evaluateCondition(p.trim(), card, inst, who, effectiveRank));
  }

  // Negation
  if (condStr.startsWith('!')) {
    return !evaluateCondition(condStr.slice(1), card, inst, who, effectiveRank);
  }

  const lower = condStr.toLowerCase();

  // ── Combo rank conditions ──
  if (lower === 'single') return effectiveRank === 1;
  if (lower === 'pair')   return effectiveRank === 2;
  if (lower === 'triple') return effectiveRank === 3;
  if (lower === 'multi')  return effectiveRank >= 4;

  // ── Buff / debuff conditions ──
  if (lower.startsWith('buff:') || lower.startsWith('applied:buff:') || lower.startsWith('stored:buff:')) {
    const id = lower.split(':').pop();
    const src = (inst?.appliedBuffs || card.appliedBuffs || []);
    return src.some(b => b.id === id);
  }
  if (lower.startsWith('debuff:') || lower.startsWith('applied:debuff:') || lower.startsWith('stored:debuff:')) {
    const id = lower.split(':').pop();
    const src = (inst?.appliedDebuffs || card.appliedDebuffs || []);
    return src.some(d => d.id === id);
  }

  // ── Stat comparisons (HP<5, DEF>=10, ATK>< 3,8) ──
  const statMatch = condStr.match(/^(HP|DEF|ATK|SHD|EG|cost)([<>=!]+)([\d.,]+)$/i);
  if (statMatch) {
    const statKey = statMatch[1].toUpperCase();
    const op      = statMatch[2];
    const vals    = statMatch[3].split(',').map(Number);
    const current = resolveStatValue(statKey, card, inst, who);
    if (op === '<')  return current < vals[0];
    if (op === '>')  return current > vals[0];
    if (op === '<=') return current <= vals[0];
    if (op === '>=') return current >= vals[0];
    if (op === '='||op === '==') return current === vals[0];
    if (op === '!=') return current !== vals[0];
    if (op === '><') return current > vals[0] && current < vals[1];
    if (op === '><=' || op === '=><') return current >= vals[0] && current <= vals[1];
  }

  // ── Card type checks ──
  if (lower.startsWith('card_type:')) {
    const wanted = lower.split(':')[1];
    return (card.type || '').toLowerCase() === wanted;
  }
  if (lower.startsWith('event_type:')) {
    const wanted = lower.split(':')[1];
    return (card.eventType || '').toLowerCase() === wanted;
  }

  // ── Zone / territory / energy ──
  if (lower.startsWith('zone_type:'))       return (card.zone       || '').toLowerCase() === lower.split(':')[1];
  if (lower.startsWith('territory_type:'))  return (card.territory  || '').toLowerCase() === lower.split(':')[1];
  if (lower.startsWith('mainenergy_type:')) return (card.mainEnergy || '').toLowerCase() === lower.split(':')[1];

  // ── Set / era ──
  if (lower.startsWith('set_type:')) return (card.set || '').toLowerCase() === lower.split(':')[1];
  if (lower.startsWith('era_type:')) return (card.era || '').toLowerCase() === lower.split(':')[1];

  // ── Word / letter checks ──
  if (lower.startsWith('hasletter:')) {
    const rest  = lower.slice('hasletter:'.length);
    const parts = rest.split(',');
    const letters = parts[0].split(';');
    const name  = (card.name || '').toUpperCase();
    return letters.every(l => name.includes(l.toUpperCase()));
  }
  if (lower.startsWith('hasword:')) {
    const rest  = lower.slice('hasword:'.length);
    const parts = rest.split(',');
    const words = parts[0].split(';');
    const name  = (card.name || '').toUpperCase();
    return words.every(w => name.includes(w.toUpperCase()));
  }
  if (lower.startsWith('word_count:')) {
    const n = parseInt(lower.split(':')[1], 10);
    return ((card.name || '').trim().split(/\s+/).length) === n;
  }
  if (lower.startsWith('letter_count:')) {
    const n = parseInt(lower.split(':')[1], 10);
    return ((card.name || '').replace(/\s/g,'').length) === n;
  }

  // ── CanDraw / CanCardDestroy etc. ──
  if (lower.startsWith('candraw:')) {
    const side = lower.includes('isplayer') ? 'player' : 'enemy';
    return GS[`canDraw_${side}`] !== false;
  }
  if (lower === 'candestroy' || lower === 'cancardestroy:true') return (inst?.canCardDestroy !== false);
  if (lower.startsWith('canbanish')) {
    if (lower.includes('isplayer') || lower.includes('isenemy')) {
      const side = lower.includes('isenemy') ? 'enemy' : 'player';
      const wantTrue = !lower.includes(',false');
      return wantTrue ? (GS[`canBanish_${side}`] !== false) : (GS[`canBanish_${side}`] === false);
    }
    const wantTrue = !lower.includes(':false');
    return wantTrue ? (inst?.canCardBanish !== false) : (inst?.canCardBanish === false);
  }

  // ── IsMainChar / IsSideChar ──
  // Checks whether this card's data.js definition marks it as a Main or Side character.
  // Reads directly from the CARDS[] entry via card.isMainChar / card.isSideChar.
  if (lower === 'ismainchar' || lower === 'ismainchar:true')
    return (card.isMainChar === true);
  if (lower === 'ismainchar:false')
    return (card.isMainChar !== true);
  if (lower === 'issidechar' || lower === 'issidechar:true')
    return (card.isSideChar === true);
  if (lower === 'issidechar:false')
    return (card.isSideChar !== true);

  // ── HaveCharacter ──
  if (lower.startsWith('havecharacter')) {
    const wantTrue = !lower.includes(':false');
    const parentId = card.parentCardId || card.id;
    return haveCharacterOnField(parentId, who) === wantTrue;
  }

  // ── HaveBuff / HaveDebuff ──
  if (lower.startsWith('havebuff')) {
    const arr = inst?.appliedBuffs || [];
    if (lower.includes(':false')) return arr.length === 0;
    const id = lower.includes('applied:buff:') ? lower.split('applied:buff:')[1]
              : lower.includes('stored:buff:')  ? lower.split('stored:buff:')[1]
              : null;
    return id ? arr.some(b => b.id === id) : arr.length > 0;
  }
  if (lower.startsWith('havedebuff')) {
    const arr = inst?.appliedDebuffs || [];
    if (lower.includes(':false')) return arr.length === 0;
    const id = lower.includes('applied:debuff:') ? lower.split('applied:debuff:')[1]
              : lower.includes('stored:debuff:')  ? lower.split('stored:debuff:')[1]
              : null;
    return id ? arr.some(d => d.id === id) : arr.length > 0;
  }

  // ── HaveSkill ──
  if (lower.startsWith('haveskill')) {
    const has = (card.effects || []).length > 0;
    return lower.includes(':false') ? !has : has;
  }

  // ── CanBeBuffed / CanBeDebuffed ──
  if (lower.startsWith('canbebuffed'))   return inst?.canBeBuffed   !== false;
  if (lower.startsWith('canbedebuffed')) return inst?.canBeDebuffed !== false;

  // ── CanTakeDamage / CanHeal ──
  if (lower.startsWith('cantakedamage')) return inst?.canTakeDamage !== false;
  if (lower.startsWith('canheal')) {
    if (lower.includes('isplayer') || lower.includes('isenemy')) {
      const side = lower.includes('isenemy') ? 'enemy' : 'player';
      const wantTrue = !lower.includes(',false');
      return wantTrue ? (GS[`canHeal_${side}`] !== false) : (GS[`canHeal_${side}`] === false);
    }
    const wantTrue = !lower.includes(':false');
    return wantTrue ? (inst?.canCardHeal !== false) : (inst?.canCardHeal === false);
  }

  // ── allenergy_type:X ──
  if (lower.startsWith('allenergy_type:')) {
    const want = lower.split(':')[1];
    return [card.mainEnergy, card.secEnergy, card.thirdEnergy]
      .filter(Boolean).map(e => e.toLowerCase()).includes(want);
  }

  // ── secondaryenergy_type / thirdenergy_type ──
  if (lower.startsWith('secondaryenergy_type:')) return (card.secEnergy   || '').toLowerCase() === lower.split(':')[1];
  if (lower.startsWith('thirdenergy_type:'))     return (card.thirdEnergy || '').toLowerCase() === lower.split(':')[1];

  // ── CurrentEvent / CurrentEventCard ──
  if (lower.startsWith('currentevent:'))     return (GS.currentEvent     || '').toLowerCase() === lower.split(':')[1];
  if (lower.startsWith('currenteventcard:')) return (GS.currentEventCard || '').toLowerCase() === lower.split(':').slice(1).join(':');

  // ── FieldRow:front/back ──
  if (lower.startsWith('fieldrow:')) {
    if (!inst) return false;
    const want = lower.split(':')[1];
    const r    = inst.fieldRow ?? -1;
    if (want === 'front') return who === 'player' ? r === 2 : r === 1;
    if (want === 'back')  return who === 'player' ? r === 3 : r === 0;
    return false;
  }

  // ── FieldColumn:n ──
  if (lower.startsWith('fieldcolumn:')) {
    const n = parseInt(lower.split(':')[1], 10);
    return (inst?.fieldCol ?? -1) === (n - 1); // spec is 1-indexed
  }

  // ── special_letter / merged_letter ──
  if (lower.startsWith('special_letter:')) {
    const want = lower.split(':')[1].toUpperCase();
    return getSpecialLetters(card).includes(want);
  }
  if (lower.startsWith('merged_letter:')) {
    const want = lower.split(':')[1].toUpperCase();
    return getMergedLetters(card).includes(want);
  }

  // ── C3-1-F: card_name / card_title ──
  // condition:card_name:Sparrow  → true if card name contains "Sparrow" (case-insensitive)
  // condition:card_title:The Dream Catcher  → true if card title contains that text
  if (lower.startsWith('card_name:')) {
    const want = condStr.slice('card_name:'.length).toLowerCase();
    return (card.name || '').toLowerCase().includes(want);
  }
  if (lower.startsWith('card_title:')) {
    const want = condStr.slice('card_title:'.length).toLowerCase();
    return (card.title || '').toLowerCase().includes(want);
  }

  // ── C3-1-A: unique_card_code ──
  // condition:unique_card_code:001-HS-CH1  → exact match on the card's static ID
  if (lower.startsWith('unique_card_code:')) {
    const want = condStr.slice('unique_card_code:'.length);
    return (card.id || '') === want;
  }

  // ── C3-1-G: CanCardDiscard / CanCardShuffle / CanRevive ──
  // condition:cancardiscard:false  → true when this card cannot be discarded
  if (lower.startsWith('cancardiscard')) {
    const wantTrue = !lower.includes(':false');
    return wantTrue ? (inst?.canCardDiscard !== false) : (inst?.canCardDiscard === false);
  }
  if (lower.startsWith('cancardshuffle')) {
    const wantTrue = !lower.includes(':false');
    return wantTrue ? (inst?.canCardShuffle !== false) : (inst?.canCardShuffle === false);
  }
  if (lower.startsWith('canrevive')) {
    if (lower.includes('isplayer') || lower.includes('isenemy')) {
      const side = lower.includes('isenemy') ? 'enemy' : 'player';
      const wantTrue = !lower.includes(',false');
      return wantTrue ? (GS[`canRevive_${side}`] !== false) : (GS[`canRevive_${side}`] === false);
    }
    const wantTrue = !lower.includes(':false');
    return wantTrue ? (inst?.canCardRevive !== false) : (inst?.canCardRevive === false);
  }

  // ── C3-1-A: lastaction:actionvar ──
  // condition:lastaction:attacked  → true if the last recorded action on this inst was 'attacked'
  // condition:lastaction:moved     → true if the last action was 'moved', etc.
  if (lower.startsWith('lastaction:')) {
    const want = lower.split(':')[1];
    return (inst?.lastAction || '') === want;
  }

  // ── C3-1-A: nextaction:actionvar ──
  // condition:nextaction:played  → true when the next action queued is 'played'
  // GS.nextAction is set by the engine before triggering effect checks.
  if (lower.startsWith('nextaction:')) {
    const want = lower.split(':')[1];
    return (GS.nextAction || '') === want;
  }

  // ── C3-1-A: prev_card:actionvar,applyall|applyturn,n ──
  // condition:prev_card:played,applyall,1  → true if the card played directly before this one matches
  // condition:prev_card:played,applyturn,2 → skip 1 card back and check the one before that
  // GS.cardPlayOrder is an array of { cardId, action } recording every card played this game.
  if (lower.startsWith('prev_card:')) {
    const parts   = lower.slice('prev_card:'.length).split(',');
    const action  = parts[0] || 'played';
    const mode    = parts[1] || 'applyall';   // 'applyall' | 'applyturn'
    const n       = parseInt(parts[2], 10) || 1;
    const history = GS.cardPlayOrder || [];
    // Find the current card's position in play order (last occurrence)
    const myIdx   = history.map((e,i) => e.cardId === card.id ? i : -1).filter(i => i >= 0).pop();
    if (myIdx === undefined || myIdx < 1) return false;

    if (mode === 'applyall') {
      // Check up to n cards before the current card that match the action
      let checked = 0;
      for (let i = myIdx - 1; i >= 0 && checked < n; i--) {
        if (history[i].action === action) { checked++; if (checked === n) return true; }
      }
      return false;
    } else {
      // applyturn: skip n entries back (regardless of action type) then check that action
      const targetIdx = myIdx - n;
      if (targetIdx < 0) return false;
      return history[targetIdx].action === action;
    }
  }

  // ── vowel / non-vowel (used as conditions on letters) ──
  if (lower.startsWith('vowel:')) {
    const letter = lower.split(':')[1].toUpperCase();
    return isVowel(letter);
  }
  if (lower.startsWith('non-vowel:')) {
    const letter = lower.split(':')[1].toUpperCase();
    return isNonVowel(letter);
  }

  // ── check_code:@ref:target,searchText:true/false ──
  if (lower.startsWith('check_code:')) {
    // e.g. check_code:@ref:IsPlayer,igv:end_of_turn:true
    const rest     = condStr.slice('check_code:'.length);
    const refMatch = rest.match(/@ref:([^,]+),(.+)/);
    if (!refMatch) return false;
    const refStr   = refMatch[1];
    const searchText = refMatch[2].replace(/:true$/, '').replace(/:false$/,'');
    const wantTrue   = !refMatch[2].endsWith(':false');
    const targets    = resolveTargets(refStr, card, inst, who);
    const found = targets.some(t =>
      (t.card.effects || []).some(line => line.includes(searchText)));
    return wantTrue ? found : !found;
  }

  // ── InDeck / InHand / OnField / InDiscardPile (location conditions) ──
  if (lower === 'indeck') {
    const deck = who === 'player' ? GS.playerDeck : GS.enemyDeck;
    return (deck||[]).some(d => d.cardId === card.id);
  }
  if (lower === 'inhand') {
    const hand = who === 'player' ? GS.playerHand : GS.enemyHand;
    return (hand||[]).some(h => h.cardId === card.id);
  }
  if (lower === 'onfield') {
    return getCardInstance(card.id, who) !== null;
  }
  if (lower === 'indiscardpile') {
    const pile = who === 'player' ? GS.playerDiscard : GS.enemyDiscard;
    return (pile||[]).some(d => d.cardId === card.id);
  }

  // Unknown condition — log it and return true (non-blocking)
  logAction(`[C2] Unknown condition "${condStr}" — defaulting true`, 'system');
  return true;
}

/* ── STAT VALUE RESOLVER ────────────────────────
   Returns numeric value of a stat for a card instance.
*/
function resolveStatValue(stat, card, inst, who) {
  if (!inst) return card[stat.toLowerCase()] ?? 0;
  return inst[`current${stat}`] ?? inst[stat.toLowerCase()] ?? card[stat.toLowerCase()] ?? 0;
}

/* ── C2-2: EFFECT ACTION EXECUTOR ───────────────
   executeEffectAction(actionStr, card, inst, who, effectiveRank)
   Handles the "what happens" part of an effect line,
   e.g. "draw:2" / "HP:-5" / "HP:+50%@baseATK" etc.
*/
function executeEffectAction(actionStr, card, inst, who, effectiveRank) {
  const tok = parseEffectToken(actionStr);
  const key = (tok.key || '').toLowerCase();

  // Percent chance gate
  if (tok.percent !== null && Math.random() * 100 > tok.percent) return;

  // Repeat wrapper
  const times = tok.repeat ?? 1;
  for (let t = 0; t < times; t++) {
    _doAction(tok, key, card, inst, who, effectiveRank);
  }
}

function _doAction(tok, key, card, inst, who, effectiveRank) {
  // ── draw:n ──
  if (key === 'draw') {
    const n = parseInt(tok.val, 10) || 1;
    if (who === 'player') {
      for (let i = 0; i < n; i++) drawCard('player');
    }
    logAction(`[C2] ${who} draws ${n} card(s).`, 'system');
    return;
  }

  // ── discard:n ──
  if (key === 'discard') {
    logAction(`[C2] ${who} discards ${tok.val} card(s). (UI TBD)`, 'system');
    return;
  }

  // ── HP / DEF / ATK / SHD / EG stat modifications ──
  const statKeys = ['hp','def','atk','shd','eg'];
  if (statKeys.includes(key)) {
    applyStatChange(key.toUpperCase(), tok, card, inst, who, effectiveRank);
    return;
  }

  // ── Max:stat modifications ──
  if (key.startsWith('max:')) {
    const stat = key.split(':')[1].toUpperCase();
    applyStatChange('Max:' + stat, tok, card, inst, who, effectiveRank);
    return;
  }

  // ── applied:buff:id ──
  if (key === 'applied:buff' || (key.startsWith('applied:buff'))) {
    const buffId = tok.val || key.split(':')[2];
    applyBuffDebuff(buffId, false, card, inst, who);
    return;
  }

  // ── applied:debuff:id ──
  if (key === 'applied:debuff' || key.startsWith('applied:debuff')) {
    const debuffId = tok.val || key.split(':')[2];
    applyBuffDebuff(debuffId, true, card, inst, who);
    return;
  }

  // ── remove:buff / remove:debuff ──
  if (key === 'remove:buff') {
    if (inst) inst.appliedBuffs = (inst.appliedBuffs || []).filter(b => b.id !== tok.val);
    return;
  }
  if (key === 'remove:debuff') {
    if (inst) inst.appliedDebuffs = (inst.appliedDebuffs || []).filter(d => d.id !== tok.val);
    return;
  }

  // ── EG (energy) adjustments for player ──
  if (key === 'eg') {
    const delta = applyOp(tok.op, GS.playerEnergy, resolveRefVal(tok, card, inst, who, effectiveRank));
    GS.playerEnergy = Math.max(0, Math.min(GS.playerMaxEnergy, delta));
    updateEnergyBar();
    logAction(`[C2] Energy -> ${GS.playerEnergy}`, 'system');
    return;
  }

  // ── CardPlayable / CardMovable etc. ──
  if (key === 'cardplayable') {
    if (inst) inst.playable = (tok.val !== 'false');
    return;
  }
  if (key === 'cardmovable') {
    if (inst) inst.movable = (tok.val !== 'false');
    return;
  }
  if (key === 'cardattackable') {
    if (inst) inst.attackable = (tok.val !== 'false');
    return;
  }

  // ── CardEngageAttack ──
  if (key === 'cardengageattack') {
    if (inst) inst.canEngageAttack = (tok.val !== 'false');
    return;
  }

  // ── CanTakeDamage / CanCardHeal / CanHeal(side) / CanBeBuffed / CanBeDebuffed ──
  if (key === 'cantakedamage')  { if (inst) inst.canTakeDamage  = (tok.val !== 'false'); return; }
  if (key === 'cancardheal')    { if (inst) inst.canCardHeal    = (tok.val !== 'false'); return; }
  if (key.startsWith('canheal')) {
    const side = key.includes('isenemy') ? 'enemy' : 'player';
    GS[`canHeal_${side}`] = (tok.val !== 'false');
    return;
  }
  if (key === 'canbebuffed')    { if (inst) inst.canBeBuffed    = (tok.val !== 'false'); return; }
  if (key === 'canbedebuffed')  { if (inst) inst.canBeDebuffed  = (tok.val !== 'false'); return; }

  // ── CanDraw / CanDiscard / CanShuffle / CanDestroy ──
  if (key.startsWith('candraw')) {
    const side = key.includes('isenemy') ? 'enemy' : 'player';
    GS[`canDraw_${side}`] = (tok.val !== 'false');
    return;
  }
  if (key.startsWith('candiscard')) {
    const side = key.includes('isenemy') ? 'enemy' : 'player';
    GS[`canDiscard_${side}`] = (tok.val !== 'false');
    return;
  }
  if (key.startsWith('canshuffle')) {
    const side = key.includes('isenemy') ? 'enemy' : 'player';
    GS[`canShuffle_${side}`] = (tok.val !== 'false');
    return;
  }
  if (key.startsWith('candestroy')) {
    const side = key.includes('isenemy') ? 'enemy' : 'player';
    GS[`canDestroy_${side}`] = (tok.val !== 'false');
    return;
  }

  // ── C3-1-G: CanCardDiscard — prevent a specific card from being discarded ──
  // cancardiscard:false  → this card cannot be discarded
  // cancardiscard:true   → restores discardability (default)
  if (key === 'cancardiscard') {
    if (inst) inst.canCardDiscard = (tok.val !== 'false');
    return;
  }

  // ── C3-1-G: CanCardShuffle — prevent a specific card from being shuffled ──
  // cancardshuffle:false  → this card will always stay in its deck position
  // cancardshuffle:true   → restores normal shuffle behaviour (default)
  if (key === 'cancardshuffle') {
    if (inst) inst.canCardShuffle = (tok.val !== 'false');
    return;
  }

  // ── C3-1-G: CanBanish(side) / CanCardBanish ──
  if (key.startsWith('canbanish') && (key.includes('isplayer') || key.includes('isenemy'))) {
    const side = key.includes('isenemy') ? 'enemy' : 'player';
    GS[`canBanish_${side}`] = (tok.val !== 'false');
    return;
  }
  if (key === 'cancardbanish') {
    if (inst) inst.canCardBanish = (tok.val !== 'false');
    return;
  }

  // ── C3-1-G: CanRevive(side) / CanCardRevive ──
  if (key.startsWith('canrevive') && (key.includes('isplayer') || key.includes('isenemy'))) {
    const side = key.includes('isenemy') ? 'enemy' : 'player';
    GS[`canRevive_${side}`] = (tok.val !== 'false');
    return;
  }
  if (key === 'cancardrevive') {
    if (inst) inst.canCardRevive = (tok.val !== 'false');
    return;
  }

  // ── return_card:true ──
  if (key === 'return_card') {
    if (tok.val === 'true') {
      const targets = tok.ref ? resolveTargets(tok.ref, card, inst, who) : [];
      const target  = targets[0] || (inst ? { card, inst } : null);
      if (target) returnCardToHand(target.inst, who);
    }
    return;
  }

  // ── destroy:target ──
  if (key === 'destroy') {
    const targets = tok.ref
      ? resolveTargets(tok.ref, card, inst, who)
      : (inst ? [{ card, inst }] : []);
    targets.forEach(t => destroyCard(t.card, t.inst, who));
    return;
  }

  // ── banished:target ──
  if (key === 'banished') {
    const targets = tok.ref
      ? resolveTargets(tok.ref, card, inst, who)
      : (inst ? [{ card, inst }] : []);
    targets.forEach(t => banishCard(t.inst, who));
    return;
  }

  // ── revived:discarded or revived:banished ──
  if (key.startsWith('revived')) {
    const fromZone = tok.val || 'discarded'; // 'discarded' | 'banished'
    const targets = tok.ref ? resolveTargets(tok.ref, card, inst, who) : [];
    targets.forEach(t => reviveCard(t.inst, fromZone, who));
    return;
  }

  // ── pick:targetvar,count,choice ──
  if (key === 'pick') {
    const parts      = (tok.val || '').split(',');
    const targetStr  = parts[0];
    const count      = parts[1] === 'all' ? 999 : (parseInt(parts[1], 10) || 1);
    const choiceAmt  = parts[2] === 'all' ? 999 : (parseInt(parts[2], 10) || count);
    const pool       = resolveTargets(targetStr, card, inst, who);
    const presented  = choiceAmt >= pool.length ? pool : pool.slice(0, choiceAmt);
    showPickUI(presented, count, false, selected => {
      selected.forEach(s => {
        // Remove from source location, add to hand
        returnCardToHand(s.inst, who);
        GS.lastPickedInst = s.inst; _trackAction(s.inst, 'picked');
      });
    });
    return;
  }

  // ── copy:targetvar,count,choice ──
  if (key === 'copy') {
    const parts     = (tok.val || '').split(',');
    const targetStr = parts[0];
    const count     = parts[1] === 'all' ? 999 : (parseInt(parts[1], 10) || 1);
    const choiceAmt = parts[2] === 'all' ? 999 : (parseInt(parts[2], 10) || count);
    const pool      = resolveTargets(targetStr, card, inst, who);
    const presented = choiceAmt >= pool.length ? pool : pool.slice(0, choiceAmt);
    showPickUI(presented, count, false, selected => {
      selected.forEach(s => {
        // Create a shallow copy of the instance
        const copy = Object.assign({}, s.inst, {
          uniqueInGameCode: `${who[0]}_${s.card.id}_copy${Date.now()}`
        });
        const hand = who === 'player' ? (GS.playerHand ||= []) : (GS.enemyHand ||= []);
        hand.push(copy);
        GS.lastPickedInst = copy; _trackAction(copy, 'picked');
        logAction(`[C3] Copied "${s.card.name}" to ${who}'s hand.`, 'system');
        renderPlayerHand && renderPlayerHand();
      });
    });
    return;
  }

  // ── switch_card_no[n]=LastCard:picked ──
  if (key.startsWith('switch_card_no')) {
    const idxMatch = key.match(/\[(\d+)\]/);
    if (idxMatch) {
      const idx = parseInt(idxMatch[1], 10);
      if (tok.val && tok.val.toLowerCase().startsWith('lastcard')) {
        SWITCH_CARD_STORE[idx] = GS.lastPickedInst?.uniqueInGameCode || null;
      } else {
        SWITCH_CARD_STORE[idx] = tok.val;
      }
    }
    return;
  }

  // ── switch_cards:code1><code2  or  switch_card_no[1]><switch_card_no[2] ──
  if (key === 'switch_cards') {
    const raw = tok.val || '';
    const sep = raw.includes('><') ? '><' : ',';
    const [aRaw, bRaw] = raw.split(sep).map(s => s.trim());
    // Resolve stored codes if referencing switch_card_no[n]
    const resolve = s => {
      const m = s.match(/switch_card_no\[(\d+)\]/i);
      return m ? (SWITCH_CARD_STORE[parseInt(m[1],10)] || s) : s;
    };
    doSwitchCards(resolve(aRaw), resolve(bRaw));
    return;
  }

  // ── merge_card_no[n]=LastCard:picked ──
  if (key.startsWith('merge_card_no')) {
    const idxMatch = key.match(/\[(\d+)\]/);
    if (idxMatch) {
      const idx = parseInt(idxMatch[1], 10);
      if (tok.val && tok.val.toLowerCase().startsWith('lastcard')) {
        SWITCH_CARD_STORE[`merge_${idx}`] = GS.lastPickedInst?.uniqueInGameCode || null;
      } else {
        SWITCH_CARD_STORE[`merge_${idx}`] = tok.val;
      }
    }
    return;
  }

  // ── merge_cards:code1><code2,stats ──
  if (key === 'merge_cards') {
    const raw   = tok.val || '';
    const commaIdx = raw.lastIndexOf(',');
    const pairStr  = commaIdx !== -1 ? raw.slice(0, commaIdx)  : raw;
    const statsStr = commaIdx !== -1 ? raw.slice(commaIdx + 1) : 'all';
    const sep = pairStr.includes('><') ? '><' : ',';
    const [aRaw, bRaw] = pairStr.split(sep).map(s => s.trim());
    const resolve = s => {
      const m = s.match(/merge_card_no\[(\d+)\]/i);
      return m ? (SWITCH_CARD_STORE[`merge_${parseInt(m[1],10)}`] || s) : s;
    };
    doMergeCards(resolve(aRaw), resolve(bRaw), statsStr);
    return;
  }

  // ── random_no:><min,max  →  stores to GS.lastRandomNo ──
  if (key === 'random_no') {
    const parts = (tok.val || '').split(',').map(Number);
    GS.lastRandomNo = randomNo(parts[0] || 0, parts[1] || 0);
    logAction(`[C3] random_no result: ${GS.lastRandomNo}`, 'system');
    return;
  }

  // ── shuffle:player / shuffle:enemy ──
  if (key === 'shuffle') {
    const side = (tok.val || who).toLowerCase().includes('enemy') ? 'enemy' : 'player';
    if (GS[`canShuffle_${side}`] !== false) {
      shuffleDeck(side === 'player' ? (GS.playerDeck||[]) : (GS.enemyDeck||[]));
      logAction(`[C3] ${side} deck shuffled.`, 'system');
    }
    return;
  }

  // ── loop:n handled at runWithLoop level; ignore if it leaks here ──
  if (key === 'loop' || key === 'repeat') return;

  // Unknown — just log
  logAction(`[C2] Unhandled action "${tok.key}:${tok.val}" on "${card.name}"`, 'system');
}

/* ── STAT CHANGE HELPER ─────────────────────────
   Resolves references like @baseATK / @Max:HP and
   applies the operation to the card instance.
*/
function applyStatChange(statLabel, tok, card, inst, who, effectiveRank) {
  const key = statLabel.replace('Max:','').toLowerCase();
  const isMax = statLabel.startsWith('Max:');

  // ── HP:=Max:HP — restore current HP to its max value ──────────────────────
  // Syntax:  HP:=Max:HP   (tok.op === '=', tok.val === 'Max:HP', tok.ref === null)
  // Allows card effects to do a clean full-heal without a giant arbitrary number.
  if (!isMax && key === 'hp' && tok.op === '=' && String(tok.val).toLowerCase() === 'max:hp') {
    if (inst) {
      const maxHP = inst.maxHP ?? card.hp ?? 0;
      inst.currentHP = maxHP;
      logAction(`[C2] HP restored to max (${maxHP}) on "${card.name}"`, 'system');
      const healSide1 = who === 'player' ? GS.canHeal_player : GS.canHeal_enemy;
      if (inst.canCardHeal !== false && healSide1 !== false) applyCardEffect(card, 'when_healed', who);
      refreshFieldCardVisual(inst);
    }
    return;
  }
  // ──────────────────────────────────────────────────────────────────────────

  // Current value
  let current = isMax
    ? (inst?.[`max${key.toUpperCase()}`] ?? card[key] ?? 0)
    : (resolveStatValue(key.toUpperCase(), card, inst, who));

  // Resolve value (may be % of a ref)
  let delta = resolveRefVal(tok, card, inst, who, effectiveRank);

  // Apply op
  let next = applyOp(tok.op, current, delta);

  // Write back
  if (inst) {
    if (isMax) inst[`max${key.toUpperCase()}`] = Math.max(0, next);
    else       inst[`current${key.toUpperCase()}`] = Math.max(0, next);
  }

  logAction(`[C2] ${statLabel} ${tok.op || '='}${delta} -> ${Math.max(0, next)} on "${card.name}"`, 'system');

  // FEATURE: trigger when_healed if HP is being increased and the card can heal
  const healSide2 = who === 'player' ? GS.canHeal_player : GS.canHeal_enemy;
  if (key === 'hp' && !isMax && delta > 0 && tok.op && (tok.op === '+' || tok.op === '=+') && inst?.canCardHeal !== false && healSide2 !== false) {
    applyCardEffect(card, 'when_healed', who);
  }

  // Update field visuals
  refreshFieldCardVisual(inst);
}

function resolveRefVal(tok, card, inst, who, effectiveRank) {
  let raw = parseFloat(tok.val) || 0;

  if (!tok.ref) return raw;

  // Percentage of a referenced stat
  const refLower = tok.ref.toLowerCase();
  if (refLower.startsWith('baseatk'))   raw = (raw / 100) * (card.atk ?? 0);
  else if (refLower.startsWith('basehp'))  raw = (raw / 100) * (card.hp ?? 0);
  else if (refLower.startsWith('max:hp'))  raw = (raw / 100) * (inst?.maxHP ?? card.hp ?? 0);
  else if (refLower.startsWith('max:atk')) raw = (raw / 100) * (inst?.maxATK ?? card.atk ?? 0);
  else if (refLower.startsWith('max:def')) raw = (raw / 100) * (inst?.maxDEF ?? card.def ?? 0);
  // % detection — if val has '%' prefix
  if (tok.val && tok.val.endsWith('%')) raw = (parseFloat(tok.val) / 100);

  return raw;
}

function applyOp(op, current, delta) {
  if (!op || op === '=')  return delta;
  if (op === '+')  return current + delta;
  if (op === '-')  return current - delta;
  if (op === '=-') return -delta;
  if (op === '=+') return delta;
  return delta;
}

/* ── BUFF/DEBUFF APPLICATION ────────────────────
   Looks up definition and applies to card instance.
   Handles stacking and turn timers.
*/
function applyBuffDebuff(id, isDebuff, card, inst, who, turnsLeft) {
  const defs = isDebuff ? DEBUFF_DEFS : BUFF_DEFS;
  const def  = defs[id];
  if (!def) {
    logAction(`[C2] ${isDebuff ? 'Debuff' : 'Buff'} "${id}" not defined.`, 'system');
    return;
  }

  // Ensure arrays exist on instance
  if (!inst) return;
  if (!inst.appliedBuffs)   inst.appliedBuffs   = [];
  if (!inst.appliedDebuffs) inst.appliedDebuffs = [];

  const arr = isDebuff ? inst.appliedDebuffs : inst.appliedBuffs;
  const existing = arr.find(e => e.id === id);

  if (existing) {
    if (existing.stacks < def.stacks) {
      existing.stacks++;
      existing.turnsLeft = turnsLeft ?? existing.turnsLeft;
    }
  } else {
    arr.push({ id, stacks: 1, turnsLeft: turnsLeft ?? null,
               permanent: def.permanent, undispellable: def.undispellable,
               iconColor: def.iconColor });
    // Register lingering if the buff/debuff has an ongoing effect
    if (def.code) {
      registerLingering(card.id, 'end_of_turn', def.code, who, turnsLeft);
    }
  }
  logAction(`[C2] Applied ${isDebuff ? 'debuff' : 'buff'} "${id}" to "${card.name}".`, 'system');
  refreshFieldCardVisual(inst);
}

/* ── C2-3 / C2-4: MAIN evaluateEffects ─────────
   Replaces the stub. Parses numbered effect lines,
   checks cet type, conditions, and igv gating.
*/
function evaluateEffects(card, igv, who, effectiveRank) {
  if (!card.effects || card.effects.length === 0) return;

  const inst = getCardInstance(card.id, who);

  card.effects.forEach(rawLine => {
    rawLine = rawLine.trim();
    if (!rawLine) return;

    // Strip leading "n)" numbering
    const numberedMatch = rawLine.match(/^\d+\)\s*/);
    if (numberedMatch) rawLine = rawLine.slice(numberedMatch[0].length);

    // Split the full line on ">>" into segments
    const segments = rawLine.split('>>').map(s => s.trim());

    // ── Parse cet type ──────────────────────────
    let cetType = 'one_time'; // default
    let startIdx = 0;
    if (segments[0].startsWith('cet:')) {
      cetType  = segments[0].slice(4).toLowerCase();
      startIdx = 1;
    }

    // ── Parse igv requirement ──────────────────
    const igvSeg = segments.find(s => s.startsWith('igv:'));
    if (igvSeg) {
      const igvDef = igvSeg.slice(4);
      // igv may have turn count: end_of_turn:2,true
      const [igvBase] = igvDef.split(':');
      if (igvBase !== igv && igvDef !== igv) return; // wrong timing
    } else {
      // No igv means it should fire at when_played
      if (igv !== 'when_played' && cetType === 'one_time') return;
    }

    // ── Collect condition segments ─────────────
    const condSegs  = segments.filter(s => s.startsWith('condition:')).map(s => s.slice(10));
    const actionSegs = segments.filter(s =>
      !s.startsWith('cet:') && !s.startsWith('igv:') && !s.startsWith('condition:'));

    // ── Evaluate conditions ────────────────────
    const allCondsMet = condSegs.every(c => evaluateCondition(c, card, inst, who, effectiveRank));
    if (!allCondsMet) return;

    // ── Execute actions ────────────────────────
    actionSegs.forEach(seg => {
      // Handle / (OR) between actions — pick randomly or first possible
      const orParts = seg.split('/');
      const chosen  = orParts[Math.floor(Math.random() * orParts.length)];
      // Handle ; (AND) between actions
      chosen.split(';').forEach(part => {
        executeEffectAction(part.trim(), card, inst, who, effectiveRank);
      });
    });

    // ── Handle cet type post-execution ────────
    if (cetType === 'lingering') {
      // Register this effect to fire every matching igv turn
      const igvFull = igvSeg ? igvSeg.slice(4) : 'end_of_turn';
      const turnMatch = igvFull.match(/:(\d+)/);
      const appliesToAll = igvFull.includes(',true');
      const turns = appliesToAll ? (turnMatch ? parseInt(turnMatch[1], 10) : Infinity) : Infinity;
      const actionCode = actionSegs.join(';');
      registerLingering(card.id, igvBase || 'end_of_turn', actionCode, who, isFinite(turns) ? turns : null);
    }
    // one_time: no further registration needed — it fired once
  });
}

/* =============================================
   C3-1: CARD VARIABLE SYSTEM
   ─────────────────────────────────────────────
   Full implementation of all variable categories
   from Section C3-1 of the design document.

   HOW TO USE (for card designers):
   ─────────────────────────────────
   All functions below are called internally by
   the C2 effect engine. You never call them
   directly when writing card effects — just use
   the variable names as shown in the doc.

   Card data shape you set per card in CARDS[]:
   {
     id, name, title, type,           // identity
     set, era,                         // B3-2/3
     zone, territory,                  // B3-4
     mainEnergy, secEnergy, thirdEnergy,
     words: [{ text, special:[], merged:[], orientation:'H'|'V' }],
     atk, def, hp, shd, eg,           // base stats
     cost,                             // energy cost to play
     effects: [],                      // C2 effect lines
     storedBuffs:   [],                // e.g. ['increase_atk']
     storedDebuffs: [],                // e.g. ['poison']
     isDefault: false,                 // B3-C default card
     eventType: '',                    // for Event cards
   }

   Runtime instance (GS.field[r][c]) shape:
   {
     cardId,
     currentHP, currentDEF, currentATK, currentSHD, currentEG,
     maxHP, maxDEF, maxATK, maxSHD,
     minHP,                            // C3-1-B Min:
     damage,                           // total damage taken
     appliedBuffs:   [],               // { id, stacks, turnsLeft, ... }
     appliedDebuffs: [],
     playable, movable, attackable, canEngageAttack,
     canCardDestroy, canCardBanish, canCardRevive,
     canTakeDamage, canCardHeal,
     canBeBuffed, canBeDebuffed,
     lastAction,                       // 'played'|'moved'|'attacked'|...
     fieldRow, fieldCol,
     uniqueInGameCode,                 // e.g. "p_001-HS-CH1_1"
   }
   ============================================= */

/* ── C3-1-A: UNIQUE IN-GAME CODE SYSTEM ─────────
   Assigns every card in both decks a unique code
   at the start of a game session. Call this during
   game initialisation (B4-2 start).
   Format: p_<cardCode>_<seq>  /  e_<cardCode>_<seq>
*/
let _uigcSeq = 0; // global sequence counter, reset each game

function assignUniqueInGameCodes(playerDeck, enemyDeck) {
  _uigcSeq = 0;
  const tag = (side, card) => {
    _uigcSeq++;
    return `${side}_${card.id}_${_uigcSeq}`;
  };
  playerDeck.forEach(inst => { inst.uniqueInGameCode = tag('p', CARDS.find(c=>c.id===inst.cardId)||{id:inst.cardId}); });
  enemyDeck.forEach(inst  => { inst.uniqueInGameCode = tag('e', CARDS.find(c=>c.id===inst.cardId)||{id:inst.cardId}); });
}

/* ── C3-1-A: TARGET RESOLVER ────────────────────
   resolveTargets(targetStr, contextCard, contextInst, who)
   Returns an array of { card, inst } objects.

   targetStr examples:
     "IsEnemy:OnField"
     "IsPlayer:InHand"
     "random:IsEnemy:OnField"
     "TargetedCard"
     "TargetedCard:attacked"
     "LastCard:picked"
     "LastCard:played"
     "LastCard:drawn"
     "LastCard:moved"
     "LastCard:attacked"
     "next_card:played,applyall,1"
     "IsPlayer:AnyCard:OnField;InHand"
     "AnyCard:OnField"              (both sides)
*/
function resolveTargets(targetStr, contextCard, contextInst, who) {
  if (!targetStr) return [];
  const ts = targetStr.trim();

  // random: pick one random from the resolved set
  if (ts.startsWith('random:')) {
    const inner = ts.slice(7);
    const pool  = resolveTargets(inner, contextCard, contextInst, who);
    if (pool.length === 0) return [];
    return [pool[Math.floor(Math.random() * pool.length)]];
  }

  // ── TargetedCard[:actionvar] ────────────────────────────────────────
  // Returns the card currently targeted by the player/enemy.
  // Optional actionvar suffix (e.g. TargetedCard:attacked) filters to
  // only return the card if its last action matches.
  //   TargetedCard              → any targeted card
  //   TargetedCard:attacked     → only if its lastAction was 'attacked'
  //   TargetedCard:moved        → only if its lastAction was 'moved'
  if (ts.startsWith('TargetedCard')) {
    if (!GS.targetedInst) return [];
    const actionFilter = ts.includes(':') ? ts.split(':')[1].toLowerCase() : null;
    if (actionFilter && GS.targetedInst.lastAction !== actionFilter) return [];
    const card = CARDS.find(c => c.id === GS.targetedInst.cardId);
    return card ? [{ card, inst: GS.targetedInst }] : [];
  }

  // ── LastCard[:actionvar] ────────────────────────────────────────────
  // Returns the last card interacted with, optionally filtered by action.
  // The doc specifies LastCard stores the unique in-game code of the last
  // card that was picked, played, drawn, moved, attacked, etc.
  //   LastCard:picked    → last card chosen via pick/stay UI
  //   LastCard:played    → last card placed on the field or used from hand
  //   LastCard:drawn     → last card drawn from the deck
  //   LastCard:moved     → last card that moved on the field
  //   LastCard:attacked  → last card that attacked
  //   LastCard:banished  → last card banished
  //   LastCard:revived   → last card revived
  //
  // GS.lastActionInsts is a map of actionvar → inst, updated at each event.
  if (ts.startsWith('LastCard')) {
    const actionVar = ts.includes(':') ? ts.split(':')[1].toLowerCase() : 'picked';
    const instMap   = GS.lastActionInsts || {};
    const inst      = instMap[actionVar] || GS.lastPickedInst || null;
    if (!inst) return [];
    const card = CARDS.find(c => c.id === inst.cardId);
    return card ? [{ card, inst }] : [];
  }

  // ── next_card[:actionvar,applyall|applyturn,n] ──────────────────────
  // Returns cards played AFTER the current card in GS.cardPlayOrder.
  // This is used as a @ref target so conditions can check future cards.
  //   next_card:played,applyall,1   → the very next card played
  //   next_card:played,applyall,2   → both the next 2 cards played
  //   next_card:played,applyturn,2  → skip 1 forward, return the 2nd card
  //
  // Since card effects fire when the card is played (not in the future),
  // "next_card" used as a @ref is prospective — it queues a deferred check.
  // For now, the resolver returns the card immediately after the current
  // one in cardPlayOrder (if already logged), which covers combos and
  // same-turn follow-up cards.
  if (ts.startsWith('next_card')) {
    const parts   = ts.slice('next_card'.length).replace(/^:/, '').split(',');
    const action  = parts[0] || 'played';
    const mode    = parts[1] || 'applyall';
    const n       = parseInt(parts[2], 10) || 1;
    const history = GS.cardPlayOrder || [];

    // Find where the current (context) card sits in play order
    const myIdx = contextCard
      ? history.map((e, i) => e.cardId === contextCard.id ? i : -1).filter(i => i >= 0).pop()
      : -1;

    if (myIdx === undefined || myIdx === -1) return [];

    const results = [];
    if (mode === 'applyall') {
      // Collect up to n cards AFTER myIdx that match action
      let found = 0;
      for (let i = myIdx + 1; i < history.length && found < n; i++) {
        if (history[i].action === action) {
          found++;
          const inst = _findInstByCardId(history[i].cardId, who);
          const card = CARDS.find(c => c.id === history[i].cardId);
          if (card && inst) results.push({ card, inst });
        }
      }
    } else {
      // applyturn: skip n positions forward then return that card
      const targetIdx = myIdx + n;
      if (targetIdx < history.length && history[targetIdx].action === action) {
        const inst = _findInstByCardId(history[targetIdx].cardId, who);
        const card = CARDS.find(c => c.id === history[targetIdx].cardId);
        if (card && inst) results.push({ card, inst });
      }
    }
    return results;
  }

  // ── AnyCard (no side prefix) ────────────────────────────────────────
  // Searches BOTH player and enemy cards across the specified locations.
  // Doc: "AnyCard:glinkedvar will check any cards from all places"
  //   AnyCard:OnField         → all cards on the entire field
  //   AnyCard:InHand          → all cards in both hands
  //   AnyCard:OnField;InHand  → field + hand for both sides
  if (ts.startsWith('AnyCard:')) {
    const locs = ts.slice('AnyCard:'.length).split(';');
    const results = [];
    ['player', 'enemy'].forEach(side => {
      locs.forEach(loc => {
        _collectSideTargets(side, loc.trim(), contextCard, contextInst)
          .forEach(t => results.push(t));
      });
    });
    return results;
  }

  // IsPlayer / IsEnemy group targets
  const isEnemy  = ts.startsWith('IsEnemy');
  const isPlayer = ts.startsWith('IsPlayer');
  if (!isEnemy && !isPlayer) return [];

  const side = isEnemy ? 'enemy' : 'player';
  const rest = ts.replace(/^Is(Enemy|Player):?/, '');

  return _collectSideTargets(side, rest, contextCard, contextInst);
}

/* Collect all cards for a side matching a location/action filter */
function _collectSideTargets(side, filterStr, contextCard, contextInst) {
  const results = [];

  // AnyCard — search multiple locations separated by ;
  if (filterStr.startsWith('AnyCard:')) {
    const locs = filterStr.slice(8).split(';');
    locs.forEach(loc => {
      _collectSideTargets(side, loc.trim(), contextCard, contextInst)
         .forEach(t => results.push(t));
    });
    return results;
  }

  // Location keywords
  const loc    = filterStr.split(':')[0].toLowerCase();
  const action = filterStr.includes(':') ? filterStr.split(':').slice(1).join(':').toLowerCase() : null;

  const rows = side === 'player' ? [2, 3] : [0, 1];

  if (loc === 'onfield') {
    for (let r of rows)
      for (let c = 0; c < 5; c++) {
        const inst = GS.field[r][c];
        if (!inst) continue;
        if (action && inst.lastAction !== action.replace('lastaction:','')) continue;
        const card = CARDS.find(cd => cd.id === inst.cardId);
        if (!card) continue;
        // Filter by IsMainChar / IsSideChar if the target string specifies it
        if (filterStr.toLowerCase().includes('ismainchar') && card.isMainChar !== true) continue;
        if (filterStr.toLowerCase().includes('issidechar') && card.isSideChar !== true) continue;
        results.push({ card, inst });
      }
  } else if (loc === 'inhand') {
    const hand = side === 'player' ? (GS.playerHand || []) : (GS.enemyHand || []);
    hand.forEach(inst => {
      const card = CARDS.find(cd => cd.id === inst.cardId);
      if (card) results.push({ card, inst });
    });
  } else if (loc === 'indeck') {
    const deck = side === 'player' ? (GS.playerDeck || []) : (GS.enemyDeck || []);
    deck.forEach(inst => {
      const card = CARDS.find(cd => cd.id === inst.cardId);
      if (card) results.push({ card, inst });
    });
  } else if (loc === 'indiscardpile') {
    const pile = side === 'player' ? (GS.playerDiscard || []) : (GS.enemyDiscard || []);
    pile.forEach(inst => {
      const card = CARDS.find(cd => cd.id === inst.cardId);
      if (card) results.push({ card, inst });
    });
  }

  // cardname: filter — narrow results to a specific card name
  // Usage: @IsPlayer:AnyCard:OnField;InHand;InDeck:cardname:Combo Wombo
  const nameFilter = filterStr.match(/cardname:([^:]+)/i);
  if (nameFilter) {
    const wanted = nameFilter[1].trim().toLowerCase();
    return results.filter(t => (t.card.name || '').toLowerCase() === wanted);
  }

  // cardtitle: filter — narrow results by card title (partial match)
  // Usage: @IsPlayer:OnField:cardtitle:The Dream Catcher
  // Usage: @IsEnemy:AnyCard:OnField;InHand:cardtitle:Warrior  (any title containing "Warrior")
  const titleFilter = filterStr.match(/cardtitle:([^:]+)/i);
  if (titleFilter) {
    const wanted = titleFilter[1].trim().toLowerCase();
    return results.filter(t => (t.card.title || '').toLowerCase() === wanted);
  }

  return results;
}

/* ── C3-1-A: ACTION TRACKER ─────────────────────
   _trackAction(inst, action)
   Updates GS.lastActionInsts[action] and inst.lastAction
   so LastCard:played / LastCard:attacked / etc. all work.
   Call this at every meaningful in-game action site.
*/
function _trackAction(inst, action) {
  if (!inst) return;
  inst.lastAction = action;
  (GS.lastActionInsts ||= {})[action] = inst;
  (GS.cardPlayOrder   ||= []).push({ cardId: inst.cardId, action });
}

/* ── C3-1-A: FIND INSTANCE BY CARD ID ──────────
   Searches field, hand, and deck for any instance
   whose cardId matches. Used by next_card resolver.
   Pass who=null to search both sides.
*/
function _findInstByCardId(cardId, who) {
  const sides = who ? [who] : ['player', 'enemy'];
  for (const side of sides) {
    // Field
    const rows = side === 'player' ? [2, 3] : [0, 1];
    for (const r of rows)
      for (let c = 0; c < 5; c++) {
        const inst = GS.field?.[r]?.[c];
        if (inst && inst.cardId === cardId) return inst;
      }
    // Hand
    const hand = side === 'player' ? GS.playerHand : GS.enemyHand;
    if (Array.isArray(hand)) {
      const found = hand.find(h => (h.cardId || h) === cardId);
      if (found) return typeof found === 'object' ? found : { cardId };
    }
    // Discard
    const discard = side === 'player' ? GS.playerDiscard : GS.enemyDiscard;
    if (Array.isArray(discard)) {
      const found = discard.find(d => (d.cardId || d) === cardId);
      if (found) return typeof found === 'object' ? found : { cardId };
    }
  }
  return null;
}

/* ── C3-1-A: RANDOM NUMBER ──────────────────────
   randomNo(min, max) — for random_no:><min,max
*/
function randomNo(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ── C3-1-A: LOOP / REPEAT ──────────────────────
   runWithLoop(effectLines, card, inst, who, rank)
   Handles "n) loop:x" at the end of numbered effects.
   If the last line is "loop:n", re-run all prior lines n times.
*/
function runWithLoop(effectLines, card, inst, who, rank) {
  // Check if final line is a loop directive
  const last = (effectLines[effectLines.length - 1] || '').trim();
  const loopMatch = last.match(/^(?:\d+\)\s*)?loop:(\d+)$/i);
  const loopTimes = loopMatch ? parseInt(loopMatch[1], 10) : 1;
  const lines     = loopMatch ? effectLines.slice(0, -1) : effectLines;

  for (let i = 0; i < loopTimes; i++) {
    lines.forEach(line => evaluateEffects({ effects: [line] }, 'when_played', who, rank));
  }
}

/* ── stay() ─────────────────────────────────────
   Used in switch/merge pick flows.
   Wraps a pick action so the chosen card is NOT
   moved to hand — its unique code is just stored
   in GS.lastPickedInst for later reference.
   Example card effect usage:
     1) stay(pick:IsPlayer:InHand,1,all)>>switch_card_no[1]=LastCard:picked
*/
function stay(inst) {
  if (!inst) return;
  GS.lastPickedInst = inst; _trackAction(inst, 'picked');
  logAction('[C3] stay: "' + inst.cardId + '" position held.', 'system');
}

/* ── C3-1-A: SWITCH CARDS ───────────────────────
   Temporary store for switch operations.
   switch_card_no[1] = uniqueInGameCode  etc.
*/
const SWITCH_CARD_STORE = {};

function doSwitchCards(codeA, codeB) {
  // Find both instances across all zones
  const findInst = code => {
    for (const zone of ['playerHand','enemyHand','playerDeck','enemyDeck',
                        'playerDiscard','enemyDiscard']) {
      const arr = GS[zone] || [];
      const i   = arr.findIndex(x => x.uniqueInGameCode === code);
      if (i !== -1) return { zone, arr, i };
    }
    // Check field
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 5; c++)
        if (GS.field[r][c]?.uniqueInGameCode === code)
          return { zone: 'field', r, c };
    return null;
  };

  const locA = findInst(codeA);
  const locB = findInst(codeB);
  if (!locA || !locB) {
    logAction('[C3] switch_cards: could not find one or both cards.', 'system');
    return;
  }

  // Simple swap for array locations
  if (locA.zone !== 'field' && locB.zone !== 'field') {
    const tmp = locA.arr[locA.i];
    locA.arr[locA.i] = locB.arr[locB.i];
    locB.arr[locB.i] = tmp;
    logAction(`[C3] Switched cards ${codeA} <> ${codeB}`, 'system');
  } else {
    logAction('[C3] switch_cards: field<>zone swap not yet supported.', 'system');
  }
}

/* ── C3-1-A: MERGE CARDS ────────────────────────
   doMergeCards(codeA, codeB, statsStr)
   Transfers stats from inst B into inst A.
   statsStr: "HP;DEF" | "all" | "Max:all"
*/
function doMergeCards(codeA, codeB, statsStr) {
  const findInst = code => {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 5; c++)
        if (GS.field[r][c]?.uniqueInGameCode === code) return GS.field[r][c];
    return null;
  };

  const instA = findInst(codeA);
  const instB = findInst(codeB);
  if (!instA || !instB) { logAction('[C3] merge_cards: card not on field.', 'system'); return; }

  const statList = statsStr === 'all'
    ? ['HP','DEF','ATK','SHD']
    : statsStr.split(';').map(s => s.trim().toUpperCase());

  statList.forEach(stat => {
    const prefixMatch = stat.match(/^(Max:|Min:|New:)?(.+)$/);
    const prefix  = prefixMatch[1] || '';
    const baseStat = prefixMatch[2];
    const keyA = `current${baseStat}`;
    const keyB = `current${baseStat}`;

    if (prefix === 'Max:') {
      instA[`max${baseStat}`] = (instA[`max${baseStat}`]||0) + (instB[`max${baseStat}`]||0);
    } else {
      instA[keyA] = (instA[keyA]||0) + (instB[keyB]||0);
    }
  });

  // Remove card B from field
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      if (GS.field[r][c]?.uniqueInGameCode === codeB)
        GS.field[r][c] = null;

  logAction(`[C3] Merged ${codeB} stats into ${codeA}.`, 'system');
  refreshFieldCardVisual(instA);
  renderAllFieldCells();
}

/* ── C3-1-A: PICK / COPY UI ─────────────────────
   showPickUI(targets, count, isStay, onSelect)
   Displays a horizontal scrollable card picker.
   isStay: if true, doesn't move card to hand — just stores code.
   onSelect: callback(selectedInsts[])
*/
function showPickUI(targets, count, isStay, onSelect) {
  // Build overlay
  let overlay = document.getElementById('pick-ui-overlay');
  if (overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = 'pick-ui-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.82);
    z-index:9000;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:16px;`;

  const title = document.createElement('div');
  title.textContent = `Choose ${count} card${count>1?'s':''}`;
  title.style.cssText = 'color:#c8a84b;font-size:18px;font-weight:700;letter-spacing:.1em;';
  overlay.appendChild(title);

  const track = document.createElement('div');
  track.style.cssText = `display:flex;gap:12px;overflow-x:auto;
    max-width:90vw;padding:8px 16px;scroll-snap-type:x mandatory;`;

  const selected = [];

  targets.forEach(({ card, inst }) => {
    const el = document.createElement('div');
    el.style.cssText = `
      flex:0 0 120px;height:168px;border:2px solid #c8a84b33;
      border-radius:8px;background:#0d1428;cursor:pointer;
      scroll-snap-align:start;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:6px;padding:8px;
      transition:border-color .15s,transform .15s;`;
    el.innerHTML = `
      <div style="font-size:11px;color:#c8a84b;font-weight:700;text-align:center;">${card.name}</div>
      <div style="font-size:10px;color:#7a8099;text-align:center;">${card.type||''}</div>
      <div style="display:flex;gap:6px;font-size:10px;color:#e8e4d8;">
        <span>ATK:${card.atk||0}</span><span>HP:${card.hp||0}</span>
      </div>`;
    el.addEventListener('click', () => {
      const idx = selected.findIndex(s => s.inst === inst);
      if (idx !== -1) {
        selected.splice(idx, 1);
        el.style.borderColor = '#c8a84b33';
        el.style.transform   = '';
      } else if (selected.length < count) {
        selected.push({ card, inst });
        el.style.borderColor = '#00c9c8';
        el.style.transform   = 'translateY(-4px)';
      }
    });
    track.appendChild(el);
  });

  // Search bar (shown when >3 cards)
  if (targets.length > 3) {
    const srch = document.createElement('input');
    srch.placeholder = 'Search cards...';
    srch.style.cssText = `
      background:#0d1428;border:1px solid #c8a84b55;border-radius:6px;
      color:#e8e4d8;padding:6px 12px;font-size:13px;width:260px;`;
    srch.addEventListener('input', () => {
      const q = srch.value.toLowerCase();
      Array.from(track.children).forEach((el, i) => {
        const name = (targets[i]?.card?.name || '').toLowerCase();
        el.style.display = name.includes(q) ? '' : 'none';
      });
    });
    overlay.appendChild(srch);
  }

  overlay.appendChild(track);

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.style.cssText = `
    padding:10px 32px;background:#c8a84b;color:#050810;
    border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;`;
  confirmBtn.addEventListener('click', () => {
    if (selected.length === 0) return;
    overlay.remove();
    if (onSelect) onSelect(selected);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    padding:10px 32px;background:transparent;color:#7a8099;
    border:1px solid #7a8099;border-radius:6px;font-size:14px;cursor:pointer;`;
  cancelBtn.addEventListener('click', () => overlay.remove());

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:12px;';
  btnRow.appendChild(confirmBtn);
  btnRow.appendChild(cancelBtn);
  overlay.appendChild(btnRow);

  document.body.appendChild(overlay);
}

/* ── C3-1-A: RETURN CARD ────────────────────────
   returnCardToHand(inst, who)
   Moves a field card back into its owner's hand.
*/
function returnCardToHand(inst, who) {
  if (!inst) return;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      if (GS.field[r][c] === inst) { GS.field[r][c] = null; break; }

  const hand = who === 'player' ? (GS.playerHand ||= []) : (GS.enemyHand ||= []);
  hand.push(inst);
  _trackAction(inst, 'returned');

  // FIX: modifiedCards write path — record live field stats so the player hand renderer
  // can display the modified-stat view and showEnlargedCard shows current values.
  // Only write for player (enemy hand is hidden) and only if stats differ from base card.
  if (who === 'player') {
    const baseCard = CARDS.find(c => c.id === inst.cardId);
    if (baseCard) {
      const statsChanged =
        inst.hp  !== (baseCard.hp  ?? 0) ||
        inst.atk !== (baseCard.atk ?? 0) ||
        inst.def !== (baseCard.def ?? 0) ||
        inst.shd !== (baseCard.shd ?? 0) ||
        (inst.buffs   && inst.buffs.length   > 0) ||
        (inst.debuffs && inst.debuffs.length > 0);
      if (statsChanged) {
        GS.modifiedCards = GS.modifiedCards || {};
        GS.modifiedCards[inst.cardId] = {
          hp:      inst.hp,
          atk:     inst.atk,
          def:     inst.def,
          shd:     inst.shd,
          buffs:   inst.buffs   ? [...inst.buffs]   : [],
          debuffs: inst.debuffs ? [...inst.debuffs] : [],
        };
      }
    }
  }

  logAction(`[C3] Card returned to ${who}'s hand.`, 'system');
  // FEATURE: trigger when_returned igv effects
  const retCard = CARDS.find(c => c.id === inst.cardId);
  if (retCard) applyCardEffect(retCard, 'when_returned', who);
  renderAllFieldCells();
  renderPlayerHand && renderPlayerHand();
}

/* ── C3-1-A: BANISH / REVIVE ────────────────────
   Banished cards go to GS.playerBanished / GS.enemyBanished.
*/
function banishCard(inst, who) {
  if (!inst || inst.canCardBanish === false) return;
  const banSide = who === 'player' ? GS.canBanish_player : GS.canBanish_enemy;
  if (banSide === false) return;
  // Remove from wherever it is
  ['playerHand','enemyHand','playerDeck','enemyDeck','playerDiscard','enemyDiscard'].forEach(zone => {
    const arr = GS[zone] || [];
    const i   = arr.indexOf(inst);
    if (i !== -1) arr.splice(i, 1);
  });
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      if (GS.field[r][c] === inst) GS.field[r][c] = null;

  const pile = who === 'player' ? (GS.playerBanished ||= []) : (GS.enemyBanished ||= []);
  pile.push(inst);
  _trackAction(inst, 'banished');
  logAction(`[C3] Card banished from ${who}.`, 'system');
  // FEATURE: trigger when_banished igv effects
  const bCard = CARDS.find(c => c.id === inst.cardId);
  if (bCard) applyCardEffect(bCard, 'when_banished', who);
}

function reviveCard(inst, fromZone, who) {
  if (!inst || inst.canCardRevive === false) return;
  const revSide = who === 'player' ? GS.canRevive_player : GS.canRevive_enemy;
  if (revSide === false) return;
  // Remove from banished or discard
  const src = fromZone === 'banished'
    ? (who === 'player' ? GS.playerBanished : GS.enemyBanished)
    : (who === 'player' ? GS.playerDiscard  : GS.enemyDiscard);
  const i = (src||[]).indexOf(inst);
  if (i !== -1) src.splice(i, 1);

  // Return to hand
  const hand = who === 'player' ? (GS.playerHand ||= []) : (GS.enemyHand ||= []);
  hand.push(inst);
  _trackAction(inst, 'revived');
  logAction(`[C3] Card revived to ${who}'s hand from ${fromZone}.`, 'system');
  // FEATURE: trigger when_revived igv effects
  const rvCard = CARDS.find(c => c.id === inst.cardId);
  if (rvCard) applyCardEffect(rvCard, `when_revived:${fromZone}`, who);
}

/* ── C3-1-B: STAT CHAIN RESOLVERS ───────────────
   Functions for Max:, Min:, New:, Lost:, Lowest:, Highest:
   All return a numeric value given a stat key and target set.
*/
function statMax(stat, card, inst) {
  return inst?.[`max${stat}`] ?? card?.[stat.toLowerCase()] ?? 0;
}
function statMin(stat, inst) {
  return inst?.[`min${stat}`] ?? 0;
}
function statNew(stat, inst) {
  // "New" = the current modified max
  return inst?.[`max${stat}`] ?? 0;
}
function statLost(stat, card, inst) {
  return statMax(stat, card, inst) - (inst?.[`current${stat}`] ?? 0);
}
function statLowest(stat, targets) {
  if (!targets || targets.length === 0) return 0;
  return Math.min(...targets.map(({ card, inst }) =>
    inst?.[`current${stat}`] ?? card?.[stat.toLowerCase()] ?? 0));
}
function statHighest(stat, targets) {
  if (!targets || targets.length === 0) return 0;
  return Math.max(...targets.map(({ card, inst }) =>
    inst?.[`current${stat}`] ?? card?.[stat.toLowerCase()] ?? 0));
}

/* ── C3-1-B: DAMAGE ─────────────────────────────
   Calculates and applies damage from attacker to defender.
   Respects SHD (shield absorbs first), DEF reduces raw damage,
   CanTakeDamage, Min:HP floor.
*/
function applyDamage(attackerInst, defenderCard, defenderInst, rawDmg) {
  if (!defenderInst) return 0;
  if (defenderInst.canTakeDamage === false) return 0;

  let dmg = Math.max(0, rawDmg - (defenderInst.currentDEF ?? defenderCard?.def ?? 0));

  // Shield absorbs first
  const shd = defenderInst.currentSHD || 0;
  if (shd > 0) {
    const absorbed = Math.min(shd, dmg);
    defenderInst.currentSHD = shd - absorbed;
    dmg -= absorbed;
  }

  // Apply to HP, respecting Min:HP
  const minHP = defenderInst.minHP ?? 0;
  const newHP = Math.max(minHP, (defenderInst.currentHP ?? 0) - dmg);
  defenderInst.currentHP = newHP;
  defenderInst.damage = (defenderInst.damage || 0) + dmg;

  // Trigger when_damaged effects
  if (dmg > 0 && defenderCard) {
    applyCardEffect(defenderCard, 'when_damaged', defenderInst.owner || 'player');
  }

  // Check destruction (HP at floor and floor is 0)
  if (newHP <= minHP && minHP === 0) {
    destroyCard(defenderCard, defenderInst, defenderInst.owner || 'player');
  }

  refreshFieldCardVisual(defenderInst);
  return dmg;
}

/* ── C3-1-B/G: DESTROY ──────────────────────────
   Destroys a card (HP→0), moves to discard pile.
   Triggers when_destroyed effects.
*/
function destroyCard(card, inst, who) {
  if (!inst || inst.canCardDestroy === false) return;

  // Trigger effect first
  if (card) applyCardEffect(card, 'when_destroyed', who);

  // Remove from field
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      if (GS.field[r][c] === inst) { GS.field[r][c] = null; break; }

  const discard = who === 'player' ? (GS.playerDiscard ||= []) : (GS.enemyDiscard ||= []);
  discard.push(inst);
  inst.lastAction = 'destroyed';
  logAction(`[C3] "${card?.name}" destroyed → discard.`, 'system');

  renderAllFieldCells();
}

/* ── C3-1-F: HAVE CHARACTER CHECK ───────────────
   Returns true if the given character card's ID is
   currently on the field for the specified side.
*/
function haveCharacterOnField(cardId, who) {
  const rows = who === 'player' ? [2,3] : [0,1];
  for (const r of rows)
    for (let c = 0; c < 5; c++)
      if (GS.field[r][c]?.cardId === cardId) return true;
  return false;
}

/* ── C3-1-F: TEXT VARIABLE HELPERS ─────────────
   Used by evaluateCondition for vowel / non-vowel,
   special_letter, merged_letter checks.
*/
const VOWELS = new Set(['A','E','I','O','U']);

function isVowel(letter) { return VOWELS.has(letter.toUpperCase()); }
function isNonVowel(letter) { return !VOWELS.has(letter.toUpperCase()); }

function getSpecialLetters(card) {
  return (card.words || []).flatMap(w => (w.special || []).map(l => l.toUpperCase()));
}
function getMergedLetters(card) {
  return (card.words || []).flatMap(w => (w.merged || []).map(l => l.toUpperCase()));
}

/* ── C3-1-G: GAME MECHANIC FLAGS ────────────────
   Runtime permission flags stored on GS.
   These are read by the effect engine before
   performing any action.
*/
function initGameMechanicFlags() {
  GS.canDraw_player  = true;
  GS.canDraw_enemy   = true;
  GS.canDiscard_player = true;
  GS.canDiscard_enemy  = true;
  GS.canShuffle_player = true;
  GS.canShuffle_enemy  = true;
  GS.canDestroy_player = true;
  GS.canDestroy_enemy  = true;
  GS.playerBanished  = GS.playerBanished || [];
  GS.enemyBanished   = GS.enemyBanished  || [];
  GS.currentEvent    = null;   // active Event card type string
  GS.currentEventCard= null;   // active Event card name string
  GS.targetedInst    = null;   // card currently targeted by player
  GS.lastPickedInst  = null;   // last card interacted via pick/stay
  // ── C3-1-A: action-tracking state ──────────────
  // cardPlayOrder — chronological log of every card action this game.
  // Each entry: { cardId: string, action: string }
  // 'action' matches the actionvar vocabulary: played, drawn, attacked,
  // moved, targeted, picked, banished, revived, merged, discarded.
  // Used by prev_card: and next_card: condition checks.
  GS.cardPlayOrder   = GS.cardPlayOrder || [];
  // nextAction — set by the engine immediately BEFORE firing card effects
  // so that condition:nextaction:X checks can inspect what is about to happen.
  GS.nextAction      = null;
  // lastActionInsts — maps actionvar string → the most recent inst that performed it.
  // Drives LastCard:played, LastCard:drawn, LastCard:attacked, etc.
  GS.lastActionInsts = GS.lastActionInsts || {};
}

/* ── C3-1-G: SHUFFLE DECK ───────────────────────
   Fisher-Yates shuffle, used when discard → deck.
*/
function shuffleDeck(deckArr) {
  // ── C3-1-G: CanCardShuffle guard ──────────────────────────────────────
  // Cards whose instance has canCardShuffle:false are pinned at their
  // current position; only the remaining slots are shuffled around them.
  // Because deck arrays store plain cardId strings (not full inst objects),
  // we check the game-state instance pool for any matching pinned cards.
  const pinnedPositions = {}; // index → cardId for pinned entries
  deckArr.forEach((id, i) => {
    const inst = getCardInstance(id, null); // null = search both sides
    if (inst && inst.canCardShuffle === false) pinnedPositions[i] = id;
  });

  // Collect movable (non-pinned) entries and shuffle only those
  const movable = deckArr.filter((_, i) => !(i in pinnedPositions));
  for (let i = movable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [movable[i], movable[j]] = [movable[j], movable[i]];
  }

  // Write shuffled movable entries back, preserving pinned positions
  let mi = 0;
  for (let i = 0; i < deckArr.length; i++) {
    if (!(i in pinnedPositions)) deckArr[i] = movable[mi++];
  }
}

/* ── C3-1-G: BUFF/DEBUFF TICK ───────────────────
   Called at end of each turn to decrement turn
   timers on applied buffs/debuffs and remove
   expired ones (unless permanent/undispellable).
*/
function tickBuffDebuffs(who) {
  const rows = who === 'player' ? [2,3] : [0,1];
  for (const r of rows)
    for (let c = 0; c < 5; c++) {
      const inst = GS.field[r][c];
      if (!inst) continue;
      ['appliedBuffs','appliedDebuffs'].forEach(key => {
        if (!inst[key]) return;
        inst[key] = inst[key].filter(entry => {
          if (entry.permanent || entry.undispellable) return true;
          if (entry.turnsLeft == null) return true; // infinite
          entry.turnsLeft--;
          return entry.turnsLeft > 0;
        });
      });
      refreshFieldCardVisual(inst);
    }
}

/* ── C3-1-H: IGV FULL LIST ───────────────────────
   All valid igv strings — used by evaluateEffects
   to match timing of effects.
   This is purely declarative (documentation + validation).
*/
const VALID_IGV = new Set([
  'when_played', 'when_discarded', 'when_drawn', 'when_destroyed',
  'when_damaged', 'when_buffed', 'when_debuffed', 'when_shuffled',
  'when_healed', 'when_returned', 'when_banished',
  'when_revived:banished', 'when_revived:discarded',
  'start_of_turn', 'end_of_turn',
]);

function isValidIgv(igvStr) {
  const base = igvStr.split(':')[0] + (igvStr.includes('revived') ? ':' + igvStr.split(':')[1] : '');
  return VALID_IGV.has(base) || VALID_IGV.has(igvStr);
}

/* ── C3-1-H: TRIGGER ALL IGV HOOKS ─────────────
   Central dispatcher — call this whenever an
   in-game event occurs to fire matching effects
   on all relevant cards.
   igv: one of the VALID_IGV strings
   who: 'player' | 'enemy'
   triggerInst (optional): the specific card inst
     that triggered the event (e.g. the card drawn)
*/
function triggerIgvEvent(igv, who, triggerInst) {
  // Fire lingering registry entries that match this igv
  tickLingeringRegistry(igv, who);

  // Fire effects on field cards
  triggerTurnEffects(igv, who);

  // Fire on the specific trigger card if provided
  if (triggerInst) {
    const card = CARDS.find(c => c.id === triggerInst.cardId);
    if (card) applyCardEffect(card, igv, who);
  }
}

/* ── C3-1: RENDER BUFF/DEBUFF ICONS ─────────────
   Injects buff/debuff icon rows into the enlarged
   card UI defined in Section B4-2-A.
   Call this when building the enlarged card popup.
*/
function renderBuffDebuffIcons(inst, container) {
  if (!container) return;

  ['appliedBuffs','appliedDebuffs'].forEach(key => {
    const arr = inst?.[key] || [];
    if (arr.length === 0) return;

    const row = document.createElement('div');
    row.style.cssText = `
      display:flex;gap:4px;overflow-x:auto;flex-wrap:nowrap;
      padding:2px 0;scrollbar-width:thin;`;

    arr.forEach(entry => {
      // Look up the definition for img / label / iconColor
      const isDebuff = key === 'appliedDebuffs';
      const def = (isDebuff ? DEBUFF_DEFS : BUFF_DEFS)[entry.id] || {};
      const iconImg   = entry.img   || def.img   || '';
      const iconColor = entry.iconColor || def.iconColor || (isDebuff ? '#e03c5a' : '#00c9c8');
      const iconLabel = def.label || entry.id.replace(/_/g,' ').toUpperCase();

      const icon = document.createElement('div');
      icon.style.cssText = `
        flex:0 0 28px;width:28px;height:28px;
        border-radius:4px;background:${iconImg ? 'transparent' : iconColor};
        position:relative;display:flex;align-items:center;
        justify-content:center;font-size:9px;color:#fff;
        font-weight:700;letter-spacing:.02em;cursor:default;
        overflow:hidden;`;
      icon.title = iconLabel;

      if (iconImg) {
        // Custom PNG icon
        const img = document.createElement('img');
        img.src = iconImg;
        img.alt = iconLabel;
        img.draggable = false;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:4px;';
        icon.appendChild(img);
      } else {
        // Coloured letter-tile fallback
        const lbl = document.createElement('span');
        lbl.textContent = entry.id.slice(0,2).toUpperCase();
        icon.appendChild(lbl);
      }

      // Stack number / turns-left badge
      if (entry.stacks > 1 || entry.turnsLeft != null) {
        const badge = document.createElement('div');
        badge.style.cssText = `
          position:absolute;bottom:1px;right:1px;
          font-size:7px;color:#fff;font-weight:700;
          background:rgba(0,0,0,0.6);border-radius:2px;padding:0 1px;`;
        badge.textContent = entry.turnsLeft != null ? entry.turnsLeft : `x${entry.stacks}`;
        icon.appendChild(badge);
      }

      row.appendChild(icon);
    });

    container.appendChild(row);
  });
}

/* ── C3: CARD DATA TEMPLATE ─────────────────────
   This is the FULL template for every card you
   add to the CARDS array. Copy this and fill in
   the fields. Fields marked (auto) are computed
   by the engine — leave them blank or omit.

   CARD TYPES (card.type):
     'CH'   Character Card
     'DZ'   Dozer Card
     'CHS'  Character Skill
     'CHSS' Character Sub-Skill
     'DZS'  Dozer Skill
     'DZSS' Dozer Sub-Skill
     'DA'   Dazed Card
     'DAS'  Dazed Skill
     'DASS' Dazed Sub-Skill
     'DR'   Dreamscape Card
     'LO'   Location Card
     'EV'   Event Card

   EVENT TYPES (card.eventType, EV cards only):
     'lucid' | 'nightmare' | 'liminal'
     'recurring' | 'daydream' | 'fever'

   SET TYPES (card.set):
     'OHS' | 'MCS' | 'HS' | 'GS'

   ─────────────────────────────────────────────
   {
     // ── IDENTITY ──────────────────────────────
     id: 'unique-slug',               // e.g. '001-HS-CH1'
     name: 'APPLE TREE',              // Card Name (used for crossword)
     title: 'The Blooming One',       // Card Title (flavour)
     type: 'CH',                      // see CARD TYPES above
     set:  'HS',                      // see SET TYPES above
     era:  '0ME',                     // e.g. '0ME' '200BME'

     // ── CROSSWORD WORD DATA ───────────────────
     words: [
       { text: 'APPLE', special: ['A','E'], merged: ['E'], orientation: 'H' },
       { text: 'TREE',  special: ['T'],     merged: ['E'], orientation: 'V' },
     ],
     // (auto) wordCount and letterCount are computed from name

     // ── LOCATION / ENERGY (CH, DA, LO cards) ─
     zone:        'North',            // zone type text
     territory:   'Serenelast',       // territory name
     mainEnergy:  'Calmness',
     secEnergy:   'Elastic Potential',
     thirdEnergy: '',

     // ── STATS (CH, DZ, DA cards) ─────────────
     atk:  50,
     def:  20,
     hp:  150,
     shd:   0,
     eg:    3,   // energy IN the stat bar (not cost)
     cost:  2,   // energy cost to PLAY the card

     // ── EVENT TYPE (EV cards only) ───────────
     eventType: '',

     // ── SKILL PARENT (CHS, CHSS etc.) ────────
     parentCardId: '001-HS-CH1',      // which CH/DA/DZ this belongs to

     // ── CARD EFFECTS (C2 syntax) ─────────────
     effects: [
       '1)cet:one_time>>condition:pair>>draw:2>>igv:when_played',
       '2)cet:lingering>>condition:multi>>draw:3>>igv:start_of_turn',
     ],

     // ── STORED BUFFS / DEBUFFS ────────────────
     storedBuffs:   ['increase_atk'],  // buff ids this card can apply
     storedDebuffs: ['poison'],        // debuff ids this card can apply

     // ── COLLECTION FLAGS ─────────────────────
     isDefault: false,                // true = given to all players
     uniqueCardCode: '001-HS-CH1',    // same as id by convention

     // ── CARD ART (set paths to assets/) ──────
     artFull: 'assets/cards/apple_tree_full.png',      // with borders
     artClean: 'assets/cards/apple_tree_clean.png',    // art only
   }
   ─────────────────────────────────────────────
   END OF CARD TEMPLATE
*/

/* ── C3: AUTO-COMPUTE WORD/LETTER COUNTS ────────
   Call this after defining CARDS to fill in
   wordCount and letterCount automatically.
*/
function computeCardTextStats() {
  (window.CARDS || []).forEach(card => {
    const clean = (card.name || '').trim();
    card.wordCount   = clean.split(/\s+/).filter(Boolean).length;
    card.letterCount = clean.replace(/\s/g, '').length;
  });
}

/* ── C3: HAVECHARACTER PLAYABILITY GUARD ────────
   Call once at start of player's turn to enforce
   that CHS/CHSS/DZS/DZSS/DAS/DASS cards are
   only playable if their parent card is on field.
*/
function enforceCharacterSkillPlayability(who) {
  const skillTypes = new Set(['CHS','CHSS','DZS','DZSS','DAS','DASS']);
  const hand = who === 'player' ? (GS.playerHand||[]) : (GS.enemyHand||[]);
  hand.forEach(inst => {
    const card = CARDS.find(c => c.id === inst.cardId);
    if (!card || !skillTypes.has(card.type)) return;
    inst.playable = card.parentCardId
      ? haveCharacterOnField(card.parentCardId, who)
      : false;
  });
}

function getCurrentComboRank() {
  return GS.lastEffectiveRank || 1;
}

/* triggerTurnEffects(igv, who)
   Fires start_of_turn / end_of_turn effects for all field cards. */
function triggerTurnEffects(igv, who) {
  const rowRange = who === 'player' ? [2,3] : [0,1];
  for (let r = rowRange[0]; r <= rowRange[1]; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = GS.field[r][c];
      if (!cell) continue;
      const card = CARDS.find(cd => cd.id === cell.cardId);
      if (card) applyCardEffect(card, igv, who);
    }
  }
}

function clearAllShadows() {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      hideCellShadow(r, c);
}

/* =============================================
   B4-2: FIELD CARD RENDERING
   ============================================= */
function renderFieldCell(row, col) {
  const cell    = document.getElementById(`gf-cell-${row}-${col}`);
  if (!cell) return;
  const data    = GS.field[row][col];
  const shadow  = document.getElementById(`gf-shadow-${row}-${col}`);

  // Remove any existing card
  cell.querySelectorAll('.gf-field-card').forEach(el => el.remove());

  if (!data) return;
  const card = CARDS.find(c => c.id === data.cardId);
  if (!card) return;

  const fc = document.createElement('div');

  // FEATURE: Enemy cards placed this turn are shown face-down (hidden) until their turn ends.
  // data.faceDown is set to true when the enemy places a card; cleared via revealEnemyCards().
  const isFaceDown = data.owner === 'enemy' && data.faceDown;

  fc.className = 'gf-field-card' + (data.owner === 'enemy' ? ' enemy-card' : '') + (isFaceDown ? ' face-down-card' : '');

  if (isFaceDown) {
    // Face-down: show card back, no stats, no image hint
    fc.innerHTML = `<div class="gf-fc-back-icon">?</div>`;
    // Enemy face-down cards can still be click-targeted (they just won't show info)
    fc.addEventListener('click', e => onCellClickTarget(e, row, col));
  } else {
    if (card.img) fc.style.backgroundImage = `url('${card.img}')`;

    fc.innerHTML = `
      <div class="gf-fc-atk">${data.atk}</div>
      <div class="gf-fc-def">${data.def}</div>
      <div class="gf-fc-bars">
        <div class="gf-fc-bar-track">
          <div class="gf-fc-bar-fill gf-fc-hp-fill" style="width:${data.maxHp ? (data.hp/data.maxHp*100) : 0}%"></div>
        </div>
        ${data.shd > 0 ? `<div class="gf-fc-bar-track"><div class="gf-fc-bar-fill gf-fc-shd-fill" style="width:${data.maxShd ? (data.shd/data.maxShd*100) : 0}%"></div></div>` : ''}
      </div>`;

    fc.addEventListener('mouseenter', e => showEnlargedCard(card, data, e));
    fc.addEventListener('mouseleave', () => hideEnlargedCard());

    // B4-3-E: wire player card click → attack/move mode
    if (data.owner === 'player') {
      fc.addEventListener('click', e => onPlayerCardClick(e, row, col));
    }

    // B4-3-E: wire enemy card cell click → confirm attack target
    if (data.owner === 'enemy') {
      fc.addEventListener('click', e => onCellClickTarget(e, row, col));
    }
  }

  cell.appendChild(fc);
}

/* Wire empty player cells for move-target clicks after field init */
function wireFieldCellClicks() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const cellEl = document.getElementById(`gf-cell-${r}-${c}`);
      if (cellEl) {
        // Remove old listener to avoid duplication (clone trick)
        const fresh = cellEl.cloneNode(false);
        // Re-append children
        while (cellEl.firstChild) fresh.appendChild(cellEl.firstChild);
        cellEl.parentNode.replaceChild(fresh, cellEl);
        fresh.id = `gf-cell-${r}-${c}`;
        // Player empty cells and enemy cells both need target click
        fresh.addEventListener('click', e => onCellClickTarget(e, r, c));
      }
    }
  }
}

function renderFullField() {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      renderFieldCell(r, c);
}

// Alias used throughout the C3 system
function renderAllFieldCells() { renderFullField(); }

// FIX Bug 16: clearActionLog uses the correct element id
function clearActionLog() {
  const list = document.getElementById('gf-action-log-list');
  if (list) list.innerHTML = '';
  if (GS) GS.actionLog = [];
}

/* =============================================
   B4-2: ENLARGED CARD UI
   ============================================= */
function showEnlargedCard(card, liveData, e) {
  const el = document.getElementById('gf-card-enlarged');
  const artEl  = document.getElementById('gf-ce-art');
  const statEl = document.getElementById('gf-ce-stats');

  artEl.style.backgroundImage = card.img ? `url('${card.img}')` : '';
  artEl.textContent = card.img ? '' : '🃏';

  const d = liveData || card;
  const rows = [];
  if (d.atk !== undefined) rows.push(['ATK', d.atk]);
  if (d.def !== undefined) rows.push(['DEF', d.def]);
  if (d.hp  !== undefined) rows.push(['HP',  d.hp ]);
  if (d.shd !== undefined) rows.push(['SHD', d.shd]);
  if (d.eg  !== undefined) rows.push(['EG',  d.eg ]);
  statEl.innerHTML = rows.map(([l,v]) =>
    `<div class="gf-ce-stat-row"><span class="gf-ce-stat-label">${l}</span><span class="gf-ce-stat-val">${v}</span></div>`
  ).join('') + `<div style="font-size:10px;color:var(--text-dim);margin-top:4px;">${card.description || ''}</div>`;

  // FIX: Wire buff/debuff icons (renderBuffDebuffIcons) into enlarged card UI
  // Remove any old icon rows first, then inject them below the description
  const existingIconRows = statEl.querySelectorAll('.ce-buff-row');
  existingIconRows.forEach(el => el.remove());
  if (liveData && (liveData.appliedBuffs?.length || liveData.appliedDebuffs?.length)) {
    const iconContainer = document.createElement('div');
    iconContainer.className = 'ce-buff-row';
    iconContainer.style.cssText = 'margin-top:6px;';
    renderBuffDebuffIcons(liveData, iconContainer);
    statEl.appendChild(iconContainer);
  }

  // Position near cursor but keep on screen
  const x = Math.min(e.clientX + 12, window.innerWidth  - 280);
  const y = Math.min(e.clientY + 12, window.innerHeight - 200);
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.style.display = 'flex';
}
function hideEnlargedCard() {
  document.getElementById('gf-card-enlarged').style.display = 'none';
}

/* =============================================
   B4-3-E: ATTACK & MOVE SYSTEM (Player)

   Interaction flow:
   1. Player clicks their field card → enters ATTACK mode (gold glow).
      All valid targets (enemy cards + portrait if front clear) highlight yellow.
      A live yellow arrow tracks mouse to nearest valid target.
      Click a valid target → confirm attack → lunge animation → damage resolve.
   2. Right-click (or click same card again) on selected card → enters MOVE mode (purple glow).
      Valid empty player cells highlight purple.
      Click a valid empty cell → confirm move → slide animation.
   3. Clicking empty space or pressing Escape cancels the current mode.

   Rules enforced per spec (B4-3-E):
   - A card can only attack ONCE per turn (attackedThisTurn flag).
   - A card can only MOVE ONCE per turn and only in ONE direction (movedThisTurn flag).
   - Front liners must be cleared before hitting the portrait.
   - Movement: up/left/right only (no hopping over occupied cells, one direction).
   - Player rows: 2 (front) and 3 (back). Enemy rows: 0 (back) and 1 (front).
   ============================================= */

/* --- State --- */
let _selectedCell  = null;   // { r, c } of the currently selected player card
let _interactMode  = null;   // 'attack' | 'move' | null
let _arrowLine     = null;   // SVG <line> element for live arrow
let _liveX         = 0;
let _liveY         = 0;

/* --- Helpers --- */

function cellCenter(r, c) {
  const el = document.getElementById(`gf-cell-${r}-${c}`);
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function portraitCenter(who) {
  const id = who === 'enemy' ? 'gf-enemy-portrait' : 'gf-player-portrait';
  const el = document.getElementById(id);
  if (!el) return { x: window.innerWidth / 2, y: who === 'enemy' ? 60 : window.innerHeight - 60 };
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function clearArrow() {
  const svg = document.getElementById('gf-arrow-svg');
  if (_arrowLine && svg.contains(_arrowLine)) svg.removeChild(_arrowLine);
  _arrowLine = null;
}

function drawArrow(x1, y1, x2, y2, color) {
  clearArrow();
  const svg = document.getElementById('gf-arrow-svg');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  const markerId = color === 'yellow' ? 'arrow-yellow' : 'arrow-pink';
  line.setAttribute('x1', x1); line.setAttribute('y1', y1);
  line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  line.setAttribute('stroke', color === 'yellow' ? '#f5c842' : '#b450ff');
  line.setAttribute('stroke-width', '2.5');
  line.setAttribute('stroke-dasharray', '6,3');
  line.setAttribute('marker-end', `url(#${markerId})`);
  line.setAttribute('opacity', '0.85');
  svg.appendChild(line);
  _arrowLine = line;
}

function clearAllHighlights() {
  document.querySelectorAll('.gf-cell').forEach(el => {
    el.classList.remove('attack-target-valid', 'move-target-valid', 'hover-target');
  });
  document.querySelectorAll('.gf-field-card').forEach(el => {
    el.classList.remove('selected-attacker', 'selected-mover');
  });
}

function cancelInteraction() {
  clearAllHighlights();
  clearArrow();
  _selectedCell = null;
  _interactMode = null;
  document.removeEventListener('mousemove', _onMouseMoveArrow);
}

/* Live arrow follows mouse */
function _onMouseMoveArrow(e) {
  if (!_selectedCell || !_interactMode) return;
  const src = cellCenter(_selectedCell.r, _selectedCell.c);
  _liveX = e.clientX; _liveY = e.clientY;
  const color = _interactMode === 'attack' ? 'yellow' : 'pink';
  drawArrow(src.x, src.y, _liveX, _liveY, color);
}

/* --- Check if enemy front row is clear (for portrait attacks) --- */
function enemyFrontClear() {
  // Enemy front row = row 1
  for (let c = 0; c < 5; c++) {
    if (GS.field[1][c]) return false;
  }
  return true;
}

/* --- Highlight valid attack targets --- */
function highlightAttackTargets() {
  // Enemy front liners (row 1) — always valid targets
  for (let c = 0; c < 5; c++) {
    if (GS.field[1][c]) {
      document.getElementById(`gf-cell-1-${c}`).classList.add('attack-target-valid');
    }
  }
  // Enemy back liners (row 0) — only if their front (row 1, same col) is empty
  for (let c = 0; c < 5; c++) {
    if (GS.field[0][c] && !GS.field[1][c]) {
      document.getElementById(`gf-cell-0-${c}`).classList.add('attack-target-valid');
    }
  }
  // Portrait — only if front row fully clear
  if (enemyFrontClear()) {
    const portraitEl = document.getElementById('gf-enemy-portrait');
    if (portraitEl) portraitEl.classList.add('attack-target-valid');
  }
}

/* --- Highlight valid move targets for card at (r,c) --- */
function highlightMoveTargets(r, c) {
  // Player rows: 2 (front), 3 (back). Cards can move up (r-1), left (c-1), right (c+1).
  // They CANNOT move down (that would be row 4+ which doesn't exist).
  // One direction only — but we highlight all valid first-step options.
  // Cannot jump over occupied cells.

  const dirs = [
    { dr: -1, dc: 0 },  // up (toward front)
    { dr: 0,  dc: -1 }, // left
    { dr: 0,  dc: 1  }, // right
    { dr: 1,  dc: 0  }, // down (toward back — only if row 2 moving to row 3)
  ];

  dirs.forEach(({ dr, dc }) => {
    const nr = r + dr, nc = c + dc;
    if (nr < 2 || nr > 3 || nc < 0 || nc > 4) return; // out of player zone
    if (!GS.field[nr][nc]) {
      document.getElementById(`gf-cell-${nr}-${nc}`).classList.add('move-target-valid');
    }
  });
}

/* --- Resolve attack from (r,c) onto target --- */
function resolveAttack(srcR, srcC, targetR, targetC, isPortrait) {
  const attacker = GS.field[srcR][srcC];
  if (!attacker) return;

  attacker.attackedThisTurn = true;
  _trackAction(attacker, 'attacked');
  const atkCard  = CARDS.find(c => c.id === attacker.cardId);
  const atkName  = atkCard?.name ?? attacker.cardId;

  if (isPortrait) {
    const rawDmg = Math.max(0, attacker.atk);
    GS.totalDamageDealt = (GS.totalDamageDealt || 0) + rawDmg;
    logAction(`${atkName} attacked the Enemy portrait for ${rawDmg} dmg!`, 'attack');
    doLungeAnimation(srcR, srcC, portraitCenter('enemy'));
    renderFieldCell(srcR, srcC);
    applyPortraitDamage('enemy', rawDmg); // handles flash, HP bar, checkWinCondition
  } else {
    const target   = GS.field[targetR][targetC];
    if (!target) return;
    const tgtCard  = CARDS.find(c => c.id === target.cardId);
    const tgtName  = tgtCard?.name ?? target.cardId;

    const rawDmg   = Math.max(0, attacker.atk - target.def);
    let remaining  = rawDmg;
    if (target.shd > 0) {
      const shdDmg = Math.min(target.shd, remaining);
      target.shd  -= shdDmg;
      remaining   -= shdDmg;
    }
    target.hp -= remaining;
    target.statChanged = true;
    GS.totalDamageDealt = (GS.totalDamageDealt || 0) + rawDmg;

    logAction(`${atkName} attacked ${tgtName} for ${rawDmg} dmg (SHD absorbs first).`);

    // Lunge animation then re-render
    doLungeAnimation(srcR, srcC, cellCenter(targetR, targetC));

    setTimeout(() => {
      renderFieldCell(targetR, targetC);
      renderFieldCell(srcR, srcC);
      if (target.hp <= 0) {
        destroyFieldCard(targetR, targetC, 'enemy');
      }
    }, 480);
  }
}

/* Animate attacker card lunging toward target point then snapping back */
function doLungeAnimation(r, c, targetPt) {
  const cellEl = document.getElementById(`gf-cell-${r}-${c}`);
  if (!cellEl) return;
  const fc = cellEl.querySelector('.gf-field-card');
  if (!fc) return;

  const srcPt  = cellCenter(r, c);
  const dx     = Math.max(-60, Math.min(60, (targetPt.x - srcPt.x) * 0.45));
  const dy     = Math.max(-60, Math.min(60, (targetPt.y - srcPt.y) * 0.45));

  fc.style.setProperty('--lunge-translate', `translate(${dx}px, ${dy}px)`);
  fc.classList.remove('anim-lunge');
  void fc.offsetWidth; // reflow
  fc.classList.add('anim-lunge');
  setTimeout(() => fc.classList.remove('anim-lunge'), 480);
}

/* Animate card sliding from old cell to new cell */
function doMoveAnimation(fromR, fromC, toR, toC, onDone) {
  const fromEl = document.getElementById(`gf-cell-${fromR}-${fromC}`);
  const toEl   = document.getElementById(`gf-cell-${toR}-${toC}`);
  if (!fromEl || !toEl) { if (onDone) onDone(); return; }

  const fromRect = fromEl.getBoundingClientRect();
  const toRect   = toEl.getBoundingClientRect();

  // Create a ghost that travels from → to
  const ghost = document.createElement('div');
  ghost.style.cssText = `
    position:fixed; pointer-events:none; z-index:500;
    left:${fromRect.left}px; top:${fromRect.top}px;
    width:${fromRect.width}px; height:${fromRect.height}px;
    border-radius:4px; background:var(--bg-mid);
    border:2px solid #b450ff;
    transition: left 0.28s cubic-bezier(.25,.8,.25,1),
                top  0.28s cubic-bezier(.25,.8,.25,1),
                opacity 0.1s ease 0.24s;
    opacity:1;
  `;
  document.body.appendChild(ghost);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    ghost.style.left    = toRect.left + 'px';
    ghost.style.top     = toRect.top  + 'px';
    ghost.style.opacity = '0';
  }));

  setTimeout(() => {
    ghost.remove();
    if (onDone) onDone();
  }, 330);
}

/* --- Main click handler wired onto each player field card --- */
function onPlayerCardClick(e, r, c) {
  e.stopPropagation();

  // Only interactive on player's turn and not paused
  if (!isPlayerTurn() || GS_PAUSED) return;

  const card = GS.field[r][c];
  if (!card || card.owner !== 'player') return;

  // Right-click or clicking the already-selected card cycles attack→move→cancel
  const isSame = _selectedCell && _selectedCell.r === r && _selectedCell.c === c;

  if (isSame) {
    if (_interactMode === 'attack') {
      // Switch to move mode
      clearAllHighlights();
      clearArrow();
      _interactMode = 'move';
      const fc = document.getElementById(`gf-cell-${r}-${c}`)?.querySelector('.gf-field-card');
      if (fc) fc.classList.add('selected-mover');
      if (!card.movedThisTurn) highlightMoveTargets(r, c);
      return;
    } else {
      // Cancel
      cancelInteraction();
      return;
    }
  }

  // New card selected — cancel any previous
  cancelInteraction();

  _selectedCell = { r, c };

  if (card.attackedThisTurn && card.movedThisTurn) {
    showToast(`${CARDS.find(cd=>cd.id===card.cardId)?.name ?? 'Card'} has already acted this turn.`);
    _selectedCell = null;
    return;
  }

  // Default: enter attack mode (even if already attacked, still allow move)
  if (!card.attackedThisTurn) {
    _interactMode = 'attack';
    const fc = document.getElementById(`gf-cell-${r}-${c}`)?.querySelector('.gf-field-card');
    if (fc) fc.classList.add('selected-attacker');
    highlightAttackTargets();
  } else {
    // Already attacked — go straight to move mode
    _interactMode = 'move';
    const fc = document.getElementById(`gf-cell-${r}-${c}`)?.querySelector('.gf-field-card');
    if (fc) fc.classList.add('selected-mover');
    if (!card.movedThisTurn) highlightMoveTargets(r, c);
  }

  document.addEventListener('mousemove', _onMouseMoveArrow);
}

/* --- Click on a target cell (enemy or empty player cell) --- */
function onCellClickTarget(e, r, c) {
  if (!_selectedCell || !_interactMode) return;
  e.stopPropagation();

  const cellEl = document.getElementById(`gf-cell-${r}-${c}`);

  if (_interactMode === 'attack') {
    const isValidTarget = cellEl && cellEl.classList.contains('attack-target-valid');
    if (!isValidTarget) { cancelInteraction(); return; }

    const src = cellCenter(_selectedCell.r, _selectedCell.c);
    const dst = cellCenter(r, c);
    drawArrow(src.x, src.y, dst.x, dst.y, 'yellow');

    const sR = _selectedCell.r, sC = _selectedCell.c;
    cancelInteraction();

    setTimeout(() => {
      resolveAttack(sR, sC, r, c, false);
      clearArrow();
    }, 120);

  } else if (_interactMode === 'move') {
    const isValidMove = cellEl && cellEl.classList.contains('move-target-valid');
    if (!isValidMove) { cancelInteraction(); return; }

    const attacker = GS.field[_selectedCell.r][_selectedCell.c];
    if (!attacker || attacker.movedThisTurn) {
      showToast('This card has already moved this turn.');
      cancelInteraction();
      return;
    }

    const fromR = _selectedCell.r, fromC = _selectedCell.c;
    const src   = cellCenter(fromR, fromC);
    const dst   = cellCenter(r, c);
    drawArrow(src.x, src.y, dst.x, dst.y, 'pink');

    cancelInteraction();

    doMoveAnimation(fromR, fromC, r, c, () => {
      // Commit move in game state
      const moving = GS.field[fromR][fromC];
      if (!moving) return;
      moving.movedThisTurn = true;
      _trackAction(moving, 'moved');
      moving.row = r; moving.col = c;
      GS.field[r][c]       = moving;
      GS.field[fromR][fromC] = null;

      const movCard = CARDS.find(cd => cd.id === moving.cardId);
      logAction(`${movCard?.name ?? moving.cardId} moved from (${fromR+1},${fromC+1}) to (${r+1},${c+1}).`);

      renderFieldCell(fromR, fromC);
      renderFieldCell(r, c);
      // Add arrival animation
      const fc = document.getElementById(`gf-cell-${r}-${c}`)?.querySelector('.gf-field-card');
      if (fc) { fc.classList.add('anim-arrive'); setTimeout(() => fc.classList.remove('anim-arrive'), 300); }
      clearArrow();
    });
  }
}

/* --- Click on enemy portrait (attack) --- */
function onPortraitClickAttack(e) {
  if (!_selectedCell || _interactMode !== 'attack') return;
  const portraitEl = document.getElementById('gf-enemy-portrait');
  if (!portraitEl || !portraitEl.classList.contains('attack-target-valid')) return;
  e.stopPropagation();

  const src = cellCenter(_selectedCell.r, _selectedCell.c);
  const dst = portraitCenter('enemy');
  drawArrow(src.x, src.y, dst.x, dst.y, 'yellow');

  const sR = _selectedCell.r, sC = _selectedCell.c;
  cancelInteraction();

  setTimeout(() => {
    resolveAttack(sR, sC, 0, 0, true); // isPortrait = true
    clearArrow();
  }, 120);
}

/* --- Cancel on background click --- */
document.addEventListener('click', (e) => {
  if (_selectedCell && !e.target.closest('.gf-field-card') && !e.target.closest('.gf-cell.attack-target-valid') && !e.target.closest('.gf-cell.move-target-valid')) {
    cancelInteraction();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cancelInteraction();
});

/* =============================================
   B4-3-A: TURN SYSTEM
   ============================================= */

// Pause state
let GS_PAUSED = false;
// Snapshot of GS at the start of player's current turn (for Undo All)
let GS_TURN_SNAPSHOT = null;

/* --- Turn Banner --- */
function showTurnBanner(label, turnNum, onDone) {
  const banner = document.getElementById('gf-turn-banner');
  document.getElementById('gf-turn-banner-label').textContent = label;
  document.getElementById('gf-turn-banner-num').textContent   = `Turn ${turnNum}`;
  banner.style.display = 'flex';
  banner.style.animation = 'none';
  banner.offsetHeight; // reflow
  banner.style.animation = 'bannerFade 2s ease forwards';
  setTimeout(() => { banner.style.display = 'none'; if (onDone) onDone(); }, 2000);
}

/* --- Action Log (B4-3-F) ---
   logAction(text, type) — call for every meaningful player/enemy action.
   type: 'play' | 'attack' | 'move' | 'draw' | 'discard' | 'system' | 'enemy'
   The log is grouped by turn and shown in the pause overlay.
   Color-coded per action type for quick scanning.
*/
function logAction(text, type) {
  const who = isPlayerTurn() ? 'Player' : 'Enemy';
  // Auto-detect type from text if not provided
  if (!type) {
    if (/drew|draw|reshuffle/i.test(text))      type = 'draw';
    else if (/attack|dmg|damage|portrait/i.test(text)) type = who === 'Player' ? 'attack' : 'enemy';
    else if (/moved|repositioned/i.test(text))  type = who === 'Player' ? 'move' : 'enemy';
    else if (/played|placed/i.test(text))       type = who === 'Player' ? 'play' : 'enemy';
    else if (/discarded|destroyed/i.test(text)) type = 'discard';
    else if (/---|\u21a9|begins|ended|Turn/i.test(text)) type = 'system';
    else type = who === 'Enemy' ? 'enemy' : 'play';
  }
  GS.actionLog.push({ turn: GS.turnNumber, who, text, type });
  refreshActionLogUI();
}

function isPlayerTurn() {
  if (!GS.whoFirst) return true;
  // FIX Bug 7: single clean condition, no contradicting OR clause
  return GS.whoFirst === 'player' ? GS.turn % 2 === 1 : GS.turn % 2 === 0;
}

function refreshActionLogUI() {
  const list = document.getElementById('gf-action-log-list');
  if (!list) return;
  list.innerHTML = '';
  let lastTurn = null;
  GS.actionLog.forEach(entry => {
    if (entry.turn !== lastTurn) {
      lastTurn = entry.turn;
      const turnHead = document.createElement('div');
      turnHead.className = 'gf-action-entry';
      turnHead.innerHTML = `<div class="ae-turn">— Turn ${entry.turn} —</div>`;
      list.appendChild(turnHead);
    }
    const div = document.createElement('div');
    div.className = 'gf-action-entry';
    const typeClass = entry.type ? `ae-${entry.type}` : '';
    div.innerHTML = `<div class="ae-text ${typeClass}">[${entry.who}] ${entry.text}</div>`;
    list.appendChild(div);
  });
  list.scrollTop = list.scrollHeight;
}

/* --- Pause / Resume (B1-2) --- */
function togglePause() {
  if (!GS || GS.phase !== 'battle') return;
  GS_PAUSED ? resumeGame() : pauseGame();
}

function pauseGame() {
  GS_PAUSED = true;
  document.getElementById('gf-pause-overlay').classList.add('open');
  document.getElementById('fm-pause').textContent = '▶';
  document.getElementById('gf-nextturn-btn').disabled = true;
  refreshActionLogUI();
}

function resumeGame() {
  GS_PAUSED = false;
  document.getElementById('gf-pause-overlay').classList.remove('open');
  document.getElementById('fm-pause').textContent = '⏸';
  // Re-enable Next Turn only if it's the player's turn
  if (GS.phase === 'battle' && !isEnemyActing()) {
    document.getElementById('gf-nextturn-btn').disabled = false;
  }
}

let _enemyActing = false;
function isEnemyActing() { return _enemyActing; }

/* --- Undo All Actions (B1-2) ---
   Restores the full GS to the snapshot taken at the start of the player's turn.
   This resets field, hand, energy and card play log for this turn.
*/
function undoAllActions() {
  if (!GS_TURN_SNAPSHOT || GS.phase !== 'battle') {
    showToast('Nothing to undo.');
    return;
  }
  if (GS_PAUSED) resumeGame();
  // Deep restore from snapshot
  GS.field        = JSON.parse(JSON.stringify(GS_TURN_SNAPSHOT.field));
  GS.playerHand   = [...GS_TURN_SNAPSHOT.playerHand];
  GS.playerDeck   = [...GS_TURN_SNAPSHOT.playerDeck];
  GS.playerDiscard= [...GS_TURN_SNAPSHOT.playerDiscard];
  GS.playerEnergy = GS_TURN_SNAPSHOT.playerEnergy;
  GS.playerExtraEnergy = GS_TURN_SNAPSHOT.playerExtraEnergy;
  GS.cardPlayLog  = [];
  // Remove log entries for this turn
  GS.actionLog = GS.actionLog.filter(e => e.turn < GS.turnNumber);
  logAction('↩ Undid all actions for this turn');
  // Re-render everything
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) renderFieldCell(r, c);
  renderPlayerHand();
  updatePileCounts();
  updateEnergyBars();
  document.getElementById('gf-nextturn-btn').disabled = false;
  showToast('All actions undone — back to start of your turn.');
}

/* --- Snapshot helper: call at the start of every player turn --- */
function takePlayerTurnSnapshot() {
  GS_TURN_SNAPSHOT = {
    field:        JSON.parse(JSON.stringify(GS.field)),
    playerHand:   [...GS.playerHand],
    playerDeck:   [...GS.playerDeck],
    playerDiscard:[...GS.playerDiscard],
    playerEnergy: GS.playerEnergy,
    playerExtraEnergy: GS.playerExtraEnergy,
  };
}

/* =============================================
   B4-3-B: LOGGED DRAW (used by turn system)
   Wraps drawCard() with action-log entries.
   Called by endEnemyTurn (player draw) and runEnemyTurn (enemy draw).
   ============================================= */
function drawCardLogged(who) {
  const deckKey    = who === 'player' ? 'playerDeck'    : 'enemyDeck';
  const discardKey = who === 'player' ? 'playerDiscard' : 'enemyDiscard';
  const handBefore = who === 'player' ? GS.playerHand.length : GS.enemyHand.length;

  // Pre-log reshuffle if about to happen
  if (GS[deckKey].length === 0 && GS[discardKey].length > 0) {
    logAction(`${who === 'player' ? 'Your' : "Enemy's"} deck reshuffled from discard.`);
  }

  drawCard(who, true); // animate=true for both; enemy animation is skipped inside drawCard

  const handAfter = who === 'player' ? GS.playerHand.length : GS.enemyHand.length;
  if (handAfter > handBefore) {
    logAction(who === 'player'
      ? `Drew a card. (${handAfter} in hand, ${GS.playerDeck.length} left in deck)`
      : `Enemy drew a card. (${GS.enemyDeck.length} left in enemy deck)`
    );
  }
}

/* =============================================
   B4-3-A: PLAYER TURN END
   ============================================= */
function endPlayerTurn() {
  if (GS.phase !== 'battle' || GS_PAUSED) return;
  document.getElementById('gf-nextturn-btn').disabled = true;

  logAction('Player ended their turn.');

  GS.turn++;
  GS.turnNumber = Math.ceil(GS.turn / 2);

  // Reset per-turn attack/move flags for all player cards
  for (let r = 2; r < 4; r++)
    for (let c = 0; c < 5; c++)
      if (GS.field[r][c]) {
        GS.field[r][c].attackedThisTurn = false;
        GS.field[r][c].movedThisTurn    = false;
      }

  // Fire end_of_turn effects (C1/C2/C3)
  triggerTurnEffects('end_of_turn', 'player');
  tickLingeringRegistry('end_of_turn', 'player');
  tickBuffDebuffs('player');   // C3-1-G: decrement buff/debuff timers

  // Clear card play log and combo state for next player turn
  GS.cardPlayLog       = [];
  GS.lastEffectiveRank = 1;
  GS.lastComboCard     = null;

  showTurnBanner("Enemy's Turn", GS.turnNumber, () => {
    if (!GS_PAUSED) runEnemyTurn();
  });
}

/* =============================================
   B4-3-A: ENEMY TURN END
   ============================================= */
function endEnemyTurn() {
  GS.turn++;
  GS.turnNumber = Math.ceil(GS.turn / 2);

  // Reset per-turn flags for all enemy cards
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 5; c++)
      if (GS.field[r][c]) {
        GS.field[r][c].attackedThisTurn = false;
        GS.field[r][c].movedThisTurn    = false;
      }

  // Draw a card for the player (B4-3-B: skip very first two turns)
  if (GS.turn > 2) drawCardLogged('player');

  showTurnBanner("Player's Turn", GS.turnNumber, () => {
    // Energy regen: +3, cap at 10 (B4-3-D)
    GS.playerEnergy = Math.min(10 + GS.playerExtraEnergy, GS.playerEnergy + 3);
    updateEnergyBars();
    // Take a snapshot so undo can restore to this point
    takePlayerTurnSnapshot();
    // Fire start_of_turn effects for player field cards (C1/C2/C3)
    triggerTurnEffects('start_of_turn', 'player');
    tickLingeringRegistry('start_of_turn', 'player');
    enforceCharacterSkillPlayability('player'); // C3-1-F: skill playability
    logAction(`--- Player Turn ${GS.turnNumber} begins. Energy: ${GS.playerEnergy} ---`);
    if (!GS_PAUSED) {
      document.getElementById('gf-nextturn-btn').disabled = false;
    }
  });
}

/* =============================================
   B4-3-H: ENEMY AI TURN
   ============================================= */
function runEnemyTurn() {
  _enemyActing = true;

  // Energy regen: +3, cap at 10 (B4-3-D)
  GS.enemyEnergy = Math.min(10 + GS.enemyExtraEnergy, GS.enemyEnergy + 3);
  updateEnergyBars();

  // Draw for enemy (skip first enemy turn — GS.turn is odd=1 first enemy turn)
  if (GS.turn > 1) drawCardLogged('enemy');

  logAction(`--- Enemy Turn ${GS.turnNumber} begins. Energy: ${GS.enemyEnergy} ---`);

  let delay = 400;

  // --- Step 1: Play affordable field cards (prioritise CH/DZ/DA, fill front row first) ---
  const toPlay = [...GS.enemyHand].filter(id => {
    const c = CARDS.find(c => c.id === id);
    return c && ['CH','DZ','DA'].includes(c.type) && (c.eg ?? 1) <= GS.enemyEnergy;
  });

  toPlay.forEach(cardId => {
    setTimeout(() => {
      if (GS_PAUSED) return; // skip if paused mid-turn (will resume from endEnemyTurn later)
      let placed = false;
      // Front row first (row 1), then back row (row 0)
      for (let r = 1; r >= 0 && !placed; r--) {
        for (let col = 0; col < 5 && !placed; col++) {
          if (!GS.field[r][col]) {
            const card = CARDS.find(c => c.id === cardId);
            if (!card) break;
            GS.field[r][col] = {
              cardId, owner: 'enemy', row: r, col,
              atk: card.atk ?? 0, def: card.def ?? 0,
              hp:  card.hp  ?? 0, shd: card.shd ?? 0,
              eg:  card.eg  ?? 1,
              maxHp:  card.hp  ?? 0,
              maxShd: card.shd ?? 0,
              attackedThisTurn: false,
              movedThisTurn:    false,
              buffs: [], debuffs: [],
              statChanged: false,
              faceDown: true,  // FEATURE: hidden until end of enemy turn
            };
            GS.enemyEnergy -= card.eg ?? 1;
            const idx = GS.enemyHand.indexOf(cardId);
            if (idx > -1) GS.enemyHand.splice(idx, 1);
            renderFieldCell(r, col);
            // Animate: slide card in from above
            const placedEl = document.getElementById(`gf-cell-${r}-${col}`)?.querySelector('.gf-field-card');
            if (placedEl) {
              placedEl.classList.add('anim-enemy-place');
              setTimeout(() => placedEl.classList.remove('anim-enemy-place'), 380);
            }
            updateEnergyBars();
            logAction(`Enemy played ${card.name ?? cardId} to row ${r + 1}, col ${col + 1}.`);
            placed = true;
          }
        }
      }
    }, delay);
    delay += 500;
  });

  // --- Step 2: Move backliners toward front (B4-3-H movement logic) ---
  setTimeout(() => {
    if (!GS_PAUSED) doEnemyMovements();
  }, delay + 200);
  delay += 600;

  // --- Step 3: Attack player frontliners (B4-3-H attack logic) ---
  setTimeout(() => {
    if (!GS_PAUSED) doEnemyAttacks();
  }, delay + 200);
  delay += 600;

  // --- Step 4: Reveal all face-down enemy cards placed this turn ---
  // FEATURE: Enemy cards that were placed face-down now flip to reveal their stats.
  setTimeout(() => {
    if (!GS_PAUSED) revealEnemyCards();
  }, delay + 100);
  delay += 500;

  // --- End enemy turn ---
  setTimeout(() => {
    _enemyActing = false;
    endEnemyTurn();
  }, delay + 300);
}

/* Enemy movement logic (B4-3-H): move backliners forward if possible */
function doEnemyMovements() {
  // Row 0 = enemy back, Row 1 = enemy front
  for (let col = 0; col < 5; col++) {
    const backliner = GS.field[0][col];
    if (!backliner || backliner.movedThisTurn) continue;
    // Check if front slot directly ahead (row 1, same col) is free
    if (!GS.field[1][col]) {
      // Ghost slide then move state
      doEnemyMoveAnimation(0, col, 1, col);
      GS.field[1][col] = { ...backliner, row: 1 };
      GS.field[0][col] = null;
      backliner.movedThisTurn = true;
      renderFieldCell(0, col);
      renderFieldCell(1, col);
      logAction(`Enemy moved ${CARDS.find(c=>c.id===backliner.cardId)?.name ?? backliner.cardId} forward.`);
    } else {
      // Try left then right
      for (const nc of [col - 1, col + 1]) {
        if (nc >= 0 && nc < 5 && !GS.field[0][nc] && !GS.field[1][nc]) {
          doEnemyMoveAnimation(0, col, 0, nc);
          GS.field[0][nc] = { ...backliner, row: 0, col: nc };
          GS.field[0][col] = null;
          backliner.movedThisTurn = true;
          renderFieldCell(0, col);
          renderFieldCell(0, nc);
          logAction(`Enemy repositioned ${CARDS.find(c=>c.id===backliner.cardId)?.name ?? backliner.cardId}.`);
          break;
        }
      }
    }
  }
}

/* Ghost slide for enemy card movement — mirrors doMoveAnimation but uses enemy colour */
function doEnemyMoveAnimation(fromR, fromC, toR, toC) {
  const fromEl = document.getElementById(`gf-cell-${fromR}-${fromC}`);
  const toEl   = document.getElementById(`gf-cell-${toR}-${toC}`);
  if (!fromEl || !toEl) return;

  const fromRect = fromEl.getBoundingClientRect();
  const toRect   = toEl.getBoundingClientRect();

  const ghost = document.createElement('div');
  ghost.className = 'enemy-move-ghost';
  ghost.style.cssText += `
    left:${fromRect.left}px; top:${fromRect.top}px;
    width:${fromRect.width}px; height:${fromRect.height}px;
  `;
  document.body.appendChild(ghost);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    ghost.style.left    = toRect.left + 'px';
    ghost.style.top     = toRect.top  + 'px';
    ghost.style.opacity = '0';
  }));

  setTimeout(() => ghost.remove(), 320);
}

/* Enemy attack logic (B4-3-H): target weakest player frontliner */
function doEnemyAttacks() {
  // Rows 0-1 = enemy cards; Rows 2-3 = player cards
  // Enemy front row = row 1, back row = row 0
  for (let r = 1; r >= 0; r--) {
    for (let c = 0; c < 5; c++) {
      const attacker = GS.field[r][c];
      if (!attacker || attacker.attackedThisTurn) continue;

      // Find weakest player frontliner (row 2 first)
      let target = null;
      let targetPos = null;
      let lowestHp = Infinity;

      for (let pr = 2; pr < 4; pr++) {
        for (let pc = 0; pc < 5; pc++) {
          const cell = GS.field[pr][pc];
          if (cell && cell.hp < lowestHp) {
            lowestHp = cell.hp;
            target = cell;
            targetPos = { r: pr, c: pc };
          }
        }
        if (target) break; // found a frontliner — don't check back row unless empty
      }

      if (!target && GS.playerMainCard) {
        // No field cards — attack player portrait via B4-4 HP tracking
        const dmg = Math.max(0, attacker.atk);
        GS.totalDamageDealt = (GS.totalDamageDealt || 0) + dmg;
        attacker.attackedThisTurn = true;
        doLungeAnimation(attacker.row, attacker.col, portraitCenter('player'));
        applyPortraitDamage('player', dmg); // handles log, flash, HP bar, checkWinCondition
        continue;
      }

      if (!target) continue;

      // Apply damage: shield first, then HP
      const rawDmg = Math.max(0, attacker.atk - target.def);
      let remaining = rawDmg;
      if (target.shd > 0) {
        const shdDmg = Math.min(target.shd, remaining);
        target.shd  -= shdDmg;
        remaining   -= shdDmg;
      }
      target.hp -= remaining;
      GS.totalDamageDealt = (GS.totalDamageDealt || 0) + rawDmg;
      target.statChanged = true;
      attacker.attackedThisTurn = true;

      const cardName = CARDS.find(c=>c.id===attacker.cardId)?.name ?? attacker.cardId;
      const targetName = CARDS.find(c=>c.id===target.cardId)?.name ?? target.cardId;
      logAction(`Enemy ${cardName} attacked ${targetName} for ${rawDmg} dmg.`);

      renderFieldCell(targetPos.r, targetPos.c);
      renderFieldCell(r, c);

      // Destroy if HP ≤ 0
      if (target.hp <= 0) {
        destroyFieldCard(targetPos.r, targetPos.c, 'player');
      }
    }
  }
}

/* FEATURE: Reveal all enemy face-down cards at the end of their turn.
   Each card flips from the face-down "?" state to its full rectangular stat view.
   A brief CSS flip animation ('anim-flip-reveal') plays on each card.
*/
function revealEnemyCards() {
  let anyRevealed = false;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const data = GS.field[r][c];
      if (data && data.faceDown) {
        data.faceDown = false;
        anyRevealed = true;
        renderFieldCell(r, c);
        // Add flip animation to the newly revealed card element
        const cellEl = document.getElementById(`gf-cell-${r}-${c}`);
        const fc = cellEl?.querySelector('.gf-field-card');
        if (fc) {
          fc.classList.add('anim-flip-reveal');
          setTimeout(() => fc.classList.remove('anim-flip-reveal'), 500);
        }
      }
    }
  }
  if (anyRevealed) {
    logAction('Enemy cards revealed!', 'enemy');
  }
}

/* =============================================
   Three entry points:
   1. destroyFieldCard(r, c, owner)
      — called when a field card's HP reaches 0.
      — animates the card flying to the discard pile, then removes it.
   2. discardFromHand(cardId, who)
      — called when a non-field card (DR, LO, EV, skill cards) is used.
      — removes from hand, animates to pile, adds to discard.
   3. discardCard(cardId, who, fromEl)
      — low-level helper used by both above.
      — fromEl is the DOM element to fly FROM (or null for centre-screen).

   All three update pile counts, log the action, and
   flash the discard pile icon on landing.
   ============================================= */

/* --- Low-level discard with animation --- */
function discardCard(cardId, who, fromEl) {
  // ── C3-1-G: CanCardDiscard guard ──────────────────────────────────────
  // If a card effect has set canCardDiscard:false on this card's instance,
  // we silently skip the discard and leave the card where it is.
  const discardInst = getCardInstance(cardId, who);
  if (discardInst && discardInst.canCardDiscard === false) {
    logAction(`[C3] "${CARDS.find(c=>c.id===cardId)?.name ?? cardId}" cannot be discarded (CanCardDiscard:false).`, 'system');
    return;
  }
  // ─────────────────────────────────────────────────────────────────────

  const discardKey = who === 'player' ? 'playerDiscard' : 'enemyDiscard';
  const pileId     = who === 'player' ? 'gf-discard-player' : 'gf-discard-enemy';

  GS[discardKey].push(cardId);
  updatePileCounts();

  const card     = CARDS.find(c => c.id === cardId);
  const cardName = card?.name ?? cardId;
  logAction(`${who === 'player' ? '' : 'Enemy '}${cardName} discarded.`);

  animateToDiscard(fromEl, pileId);
}

/* Flies a ghost card from fromEl (or screen center) to the discard pile icon. */
function animateToDiscard(fromEl, pileId) {
  const pileEl = document.getElementById(pileId);
  if (!pileEl) return;

  const destRect = pileEl.getBoundingClientRect();

  // Determine origin rect
  let srcRect;
  if (fromEl) {
    srcRect = fromEl.getBoundingClientRect();
  } else {
    const w = 48, h = 64;
    srcRect = {
      left: window.innerWidth  / 2 - w / 2,
      top:  window.innerHeight / 2 - h / 2,
      width: w, height: h
    };
  }

  // Create ghost
  const ghost = document.createElement('div');
  ghost.className = 'discard-ghost';
  ghost.style.left    = srcRect.left   + 'px';
  ghost.style.top     = srcRect.top    + 'px';
  ghost.style.width   = srcRect.width  + 'px';
  ghost.style.height  = srcRect.height + 'px';
  ghost.style.opacity = '1';
  document.body.appendChild(ghost);

  // Kick off fly to pile
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ghost.style.left      = (destRect.left + destRect.width  / 2 - srcRect.width  / 2) + 'px';
      ghost.style.top       = (destRect.top  + destRect.height / 2 - srcRect.height / 2) + 'px';
      ghost.style.opacity   = '0';
      ghost.style.transform = 'scale(0.35)';
    });
  });

  // Clean up ghost + flash pile
  setTimeout(() => {
    ghost.remove();
    pileEl.classList.add('discard-flash');
    setTimeout(() => pileEl.classList.remove('discard-flash'), 480);
  }, 420);
}

/* --- Destroy a field card (HP → 0) → send to discard --- */
function destroyFieldCard(r, c, owner) {
  const cell = GS.field[r][c];
  if (!cell) return;

  const card     = CARDS.find(cd => cd.id === cell.cardId);
  const cardName = card?.name ?? cell.cardId;

  // FIX Bug 8: get element by the correct ID format used by buildFieldGrid()
  const cellEl = document.getElementById(`gf-cell-${r}-${c}`);

  // Remove from field immediately (before animation ends)
  GS.field[r][c] = null;
  renderFieldCell(r, c);

  // Animate + add to discard
  discardCard(cell.cardId, owner, cellEl);

  logAction(`${cardName} was destroyed (HP 0) → ${owner} discard.`);
  checkWinCondition();
}

/* --- Discard a card played from hand (non-field cards: DR, LO, EV, skill cards) ---
   Called by card-play logic whenever a card's type means it doesn't go onto the field. */
function discardFromHand(cardId, who) {
  const handKey = who === 'player' ? 'playerHand' : 'enemyHand';

  // Find and remove from hand
  const idx = GS[handKey].indexOf(cardId);
  if (idx > -1) GS[handKey].splice(idx, 1);

  // Re-render hand so the card visually leaves
  if (who === 'player') renderPlayerHand();

  // Find the hand card DOM element to fly from (best-effort; may be null if drawer closed)
  const handCards = document.querySelectorAll('.gf-hand-card');
  let fromEl = null;
  handCards.forEach(el => {
    if (el.dataset && el.dataset.cardId === cardId) fromEl = el;
  });

  discardCard(cardId, who, fromEl);
}

/* =============================================
   B4-4: WIN / LOSE CONDITIONS

   Main character HP is tracked in GS.mainHp:
     GS.mainHp.player = { hp, shd, maxHp, maxShd }
     GS.mainHp.enemy  = { hp, shd, maxHp, maxShd }

   Initialised via initMainCharHp() at game start.
   Updated by applyPortraitDamage() on every portrait hit.
   checkWinCondition() is called after every attack.

   B4-4-A: Enemy main HP → 0  → player wins → Dream Saved screen
   B4-4-B: Player main HP → 0 → Second Chance (B4-4-C)
   ============================================= */

function initMainCharHp() {
  const pCard = CARDS.find(c => c.id === GS.playerMainCard);
  const eCard = CARDS.find(c => c.id === GS.enemyMainCard);
  GS.mainHp = {
    player: { hp: pCard?.hp ?? 20, shd: pCard?.shd ?? 0, maxHp: pCard?.hp ?? 20, maxShd: pCard?.shd ?? 0 },
    enemy:  { hp: eCard?.hp ?? 20, shd: eCard?.shd ?? 0, maxHp: eCard?.hp ?? 20, maxShd: eCard?.shd ?? 0 },
  };
  updatePortraitHpBars();
}

function applyPortraitDamage(who, rawDmg) {
  const m = GS.mainHp[who];
  if (!m) return;
  let remaining = rawDmg;
  if (m.shd > 0) { const s = Math.min(m.shd, remaining); m.shd -= s; remaining -= s; }
  m.hp = Math.max(0, m.hp - remaining);
  const portraitEl = document.getElementById(who === 'enemy' ? 'gf-enemy-portrait' : 'gf-player-portrait');
  if (portraitEl) { portraitEl.classList.remove('portrait-hit'); void portraitEl.offsetWidth; portraitEl.classList.add('portrait-hit'); }
  updatePortraitHpBars();
  logAction(`${who === 'enemy' ? 'Enemy' : 'Player'} portrait took ${rawDmg} dmg! HP: ${m.hp}/${m.maxHp}`, who === 'enemy' ? 'attack' : 'enemy');
  checkWinCondition();
}

function updatePortraitHpBars() {
  if (!GS.mainHp) return;
  ['player','enemy'].forEach(who => {
    const m = GS.mainHp[who];
    const hpEl  = document.getElementById(`gf-${who}-hp-bar`);
    const shdEl = document.getElementById(`gf-${who}-shd-bar`);
    const lblEl = document.getElementById(`gf-${who}-hp-label`);
    if (!hpEl || !m) return;
    hpEl.style.width  = (m.maxHp  > 0 ? (m.hp  / m.maxHp)  * 100 : 0) + '%';
    shdEl.style.width = (m.maxShd > 0 ? (m.shd / m.maxShd) * 100 : 0) + '%';
    shdEl.closest('.gf-main-hp-track').style.display = m.maxShd > 0 ? 'block' : 'none';
    if (lblEl) lblEl.textContent = `HP ${m.hp}/${m.maxHp}`;
  });
}

/* =============================================
   B4-4-A: WIN CONDITION
   Stubbed here — full logic lives in the B4-4-C
   block below which overrides this function via
   the patched checkWinCondition assignment.
   ============================================= */
function checkWinCondition() {
  // Overridden by the B4-4-C patch block below.
  // This stub is kept so the function exists at
  // parse time before the patch runs.
}

/* =============================================
   B4-5-A: DREAM SAVED — RESULT SCREEN LOGIC

   showResultScreen(mode)
     mode: 'dream_saved' | 'dazed_defeated' | 'game_over'

   Calculates DT rewards, animates counting numbers,
   then shows buttons. Also credits DT to the collection.
   ============================================= */
function showResultScreen(mode) {
  /* ── B4-5: DREAM SAVED / DAZED DEFEATED / GAME OVER ─────────────
     mode: 'dream_saved' | 'dazed_defeated' | 'game_over'

     B4-5-A Dream Saved    — base 500 DT + turn bonus + dmg bonus
     B4-5-B Dazed Defeated — base 1000 DT + halved bonuses
     B4-5-C Game Over      — base 150 DT, no bonuses shown
  ─────────────────────────────────────────────────────────────────*/

  // Lock game
  GS.gameOver = true;
  GS.phase    = 'result';
  STATE.inBattle = false;
  const nextBtn = document.getElementById('gf-nextturn-btn');
  if (nextBtn) nextBtn.disabled = true;

  // Determine base reward + title
  let baseReward = 0;
  let titleText  = '';
  let titleColor = '';
  let glowColor  = '';
  let glowColorCSS = '';  // for --result-border
  let subtitleText = '';
  let portraitSrc  = '';
  let portraitName = '';
  let showBonusRows = true;

  const char = CHARACTERS[STATE.selectedCharacter] || {};

  if (mode === 'dream_saved') {
    baseReward    = 500;
    titleText     = 'Dream Saved';
    titleColor    = 'var(--accent-gold)';
    glowColor     = 'radial-gradient(ellipse at 50% 30%, rgba(200,168,75,0.22) 0%, transparent 65%)';
    glowColorCSS  = 'rgba(200,168,75,0.25)';
    subtitleText  = char.name ? `${char.name}'s Dream` : 'Victory';
    portraitSrc   = char.img || '';
    portraitName  = char.name || 'Character';
    showBonusRows = true;
  } else if (mode === 'dazed_defeated') {
    baseReward    = 1000;
    titleText     = 'Dazed Defeated';
    titleColor    = '#b450ff';
    glowColor     = 'radial-gradient(ellipse at 50% 30%, rgba(180,80,255,0.22) 0%, transparent 65%)';
    glowColorCSS  = 'rgba(180,80,255,0.3)';
    subtitleText  = char.name ? `${char.name}'s Nightmare Ended` : 'Extraordinary Victory';
    // Dazed Defeated shows dazed portrait
    portraitSrc   = char.dazedImg || char.img || '';
    portraitName  = (char.dazedName || (char.name ? char.name + ' (Dazed)' : 'Dazed'));
    showBonusRows = true;
  } else {
    // game_over — B4-5-C: base 150 DT only, no bonuses
    baseReward    = 150;
    titleText     = 'Dream Failed';
    titleColor    = 'var(--accent-red)';
    glowColor     = 'radial-gradient(ellipse at 50% 30%, rgba(224,60,90,0.16) 0%, transparent 65%)';
    glowColorCSS  = 'rgba(224,60,90,0.25)';
    subtitleText  = char.name ? `${char.name} lost to the Dazed` : 'Defeat';
    portraitSrc   = '';  // no portrait for game over
    showBonusRows = false;
  }

  // ── Bonus calculations (B4-5-A spec) ─────────────────────────────
  const turns     = GS.turnNumber || 1;
  const dmgDealt  = GS.totalDamageDealt || 0;
  const half      = (mode === 'dazed_defeated') ? 0.5 : 1;

  // Turn bonus: 10% of base decreasing 0.01% per turn, min 0
  const turnBonusPct = Math.max(0, (10 - turns * 0.01) / 100);
  const turnBonus    = showBonusRows ? Math.round(baseReward * turnBonusPct * half) : 0;

  // Damage bonus: 0.05% × dmg, rounded up, min 1 DT if any damage dealt
  const dmgBonus = showBonusRows && dmgDealt > 0
    ? Math.max(1, Math.ceil(dmgDealt * 0.0005 * half))
    : 0;

  const total = baseReward + turnBonus + dmgBonus;

  // ── Credit DT ─────────────────────────────────────────────────────
  COLLECTION.dt = (COLLECTION.dt || 0) + total;
  saveCollection(COLLECTION);
  updateFloatingMenu();

  // ── Navigate ──────────────────────────────────────────────────────
  goTo('screen-result');

  // ── Grab elements ─────────────────────────────────────────────────
  const titleEl      = document.getElementById('result-title');
  const subtitleEl   = document.getElementById('result-subtitle');
  const rewardsEl    = document.getElementById('result-rewards');
  const btnsEl       = document.getElementById('result-btns');
  const glowEl       = document.getElementById('result-glow');
  const portraitWrap = document.getElementById('result-portrait-wrap');
  const portraitImg  = document.getElementById('result-portrait-img');
  const portraitPh   = document.getElementById('result-portrait-ph');
  const bonusRows    = document.getElementById('result-bonus-rows');
  const particlesCv  = document.getElementById('result-particles');

  // ── Apply mode-specific styles ────────────────────────────────────
  titleEl.style.color         = titleColor;
  titleEl.textContent         = titleText.toUpperCase();
  subtitleEl.textContent      = subtitleText;
  glowEl.style.background     = glowColor;
  rewardsEl.style.setProperty('--result-border', glowColorCSS);
  rewardsEl.style.borderColor = glowColorCSS;

  // Bonus rows visibility
  bonusRows.style.display = showBonusRows ? 'contents' : 'none';

  // ── Portrait setup ────────────────────────────────────────────────
  if (portraitSrc || (mode !== 'game_over')) {
    portraitWrap.style.display = 'block';
    // Colour portrait border to match mode
    portraitWrap.style.borderColor = glowColorCSS;
    portraitWrap.style.boxShadow   = `0 0 28px ${glowColorCSS}`;
    if (portraitSrc) {
      portraitImg.src = portraitSrc;
      portraitImg.style.display = 'block';
      portraitPh.style.display  = 'none';
    } else {
      portraitImg.style.display = 'none';
      portraitPh.textContent    = portraitName;
      portraitPh.style.display  = 'flex';
    }
  } else {
    portraitWrap.style.display = 'none';
  }

  // ── Reset all elements to hidden ──────────────────────────────────
  [titleEl, subtitleEl, rewardsEl, btnsEl].forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = '';
  });
  portraitWrap.style.opacity   = '0';
  portraitWrap.style.transform = 'scale(0.7)';
  particlesCv.style.opacity    = '0';

  // Reset counters
  ['result-base','result-turn-bonus','result-dmg-bonus','result-total']
    .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '0'; });

  // ── Entrance sequence ─────────────────────────────────────────────
  requestAnimationFrame(() => {
    glowEl.style.opacity = '1';

    // Portrait pops in
    setTimeout(() => {
      portraitWrap.style.opacity   = '1';
      portraitWrap.style.transform = 'scale(1)';
    }, 80);

    // Title slides down
    setTimeout(() => {
      titleEl.style.opacity   = '1';
      titleEl.style.transform = 'translateY(0)';
    }, 250);

    // Subtitle fades in
    setTimeout(() => { subtitleEl.style.opacity = '1'; }, 520);

    // Rewards panel + count-up
    setTimeout(() => {
      rewardsEl.style.opacity = '1';
      countUp('result-base',       0, baseReward, 800,   0);
      if (showBonusRows) {
        countUp('result-turn-bonus', 0, turnBonus,  700, 250);
        countUp('result-dmg-bonus',  0, dmgBonus,   700, 450);
      }
      countUp('result-total', 0, total, 950, showBonusRows ? 700 : 100);
    }, 750);

    // Buttons
    const btnDelay = showBonusRows ? 2000 : 1400;
    setTimeout(() => { btnsEl.style.opacity = '1'; }, btnDelay);

    // Particles (only for wins)
    if (mode !== 'game_over') {
      setTimeout(() => {
        particlesCv.style.opacity = '1';
        startResultParticles(particlesCv, mode);
      }, 400);
    }
  });

  logAction(`Game ended: ${titleText}. +${total} DT earned.`, 'system');
}

/* ── B4-5 Particle celebration effect ───────────────────────────────
   Runs on the result screen canvas for Dream Saved (gold)
   and Dazed Defeated (purple). Gentle drifting particles.
─────────────────────────────────────────────────────────────────── */
let _resultParticleRAF = null;
function startResultParticles(canvas, mode) {
  // Cancel any previous animation
  if (_resultParticleRAF) cancelAnimationFrame(_resultParticleRAF);

  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth  || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;

  const color = mode === 'dazed_defeated'
    ? ['180,80,255', '210,130,255', '140,60,220']
    : ['200,168,75', '230,200,110', '180,140,50'];

  const COUNT = 55;
  const particles = Array.from({ length: COUNT }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height,
    r:    1.5 + Math.random() * 3,
    dx:   (Math.random() - 0.5) * 0.5,
    dy:   -0.3 - Math.random() * 0.7,
    a:    Math.random(),
    da:   0.003 + Math.random() * 0.006,
    col:  color[Math.floor(Math.random() * color.length)],
    born: performance.now() + Math.random() * 3000,
  }));

  function draw(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      if (now < p.born) return;
      p.x += p.dx; p.y += p.dy;
      p.a += p.da;
      const alpha = 0.4 + 0.4 * Math.abs(Math.sin(p.a));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${alpha.toFixed(2)})`;
      ctx.fill();
      // Wrap vertically
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
    });
    _resultParticleRAF = requestAnimationFrame(draw);
  }
  _resultParticleRAF = requestAnimationFrame(draw);
}

function stopResultParticles() {
  if (_resultParticleRAF) { cancelAnimationFrame(_resultParticleRAF); _resultParticleRAF = null; }
  const cv = document.getElementById('result-particles');
  if (cv) { const ctx = cv.getContext('2d'); ctx.clearRect(0,0,cv.width,cv.height); }
}

/* Animated count-up for a numeric element */
function countUp(elId, from, to, duration, delay) {
  setTimeout(() => {
    const el = document.getElementById(elId);
    if (!el) return;
    if (to === 0) { el.textContent = '0'; return; }
    const start = performance.now();
    function step(now) {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);  // ease-out cubic
      el.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, delay);
}

/* ── Clean up battle state on exit ──────────────────────────────────
   Called by Main Menu button and Go to Summons.
   Resets all game-session state so the next game starts clean.
─────────────────────────────────────────────────────────────────── */
function endBattle() {
  stopResultParticles();

  GS.phase         = 'idle';
  GS.gameOver      = false;
  GS.secondChance  = false;
  GS.winner        = null;
  GS.turnNumber    = 1;
  GS.currentTurn   = 'player';
  GS.firstTurnDone = false;
  GS.totalDamageDealt = 0;
  GS.mainHp        = null;
  GS.activeEvent = null; // FIX Bug 17: was GS.activeEventCard (wrong key); GS.activeEvent is the real field
  GS.playerHand    = [];
  GS.playerDeck    = [];
  GS.playerDiscard = [];
  GS.enemyHand     = [];
  GS.enemyDeck     = [];
  GS.enemyDiscard  = [];
  GS.playerEnergy  = 10;
  GS.enemyEnergy   = 10;
  GS.playerExtraEnergy = 0;  // FIX Bug 15: correct key name used in-game
  GS.enemyExtraEnergy  = 0;  // FIX Bug 15: correct key name used in-game
  GS.actionLog         = [];
  GS.cardOrderLog      = [];
  GS.cardPlayLog       = [];
  GS.lastEffectiveRank = 1;
  GS.lastComboCard     = null;
  GS.modifiedCards     = {};

  // C3-1: initialise game mechanic flags and clear lingering registry
  initGameMechanicFlags();
  LINGERING_REGISTRY.length = 0;
  _uigcSeq = 0;

  STATE.inBattle        = false;
  STATE.selectedCharacter = null;

  // Re-enable next turn button for future battles
  const nextBtn = document.getElementById('gf-nextturn-btn');
  if (nextBtn) nextBtn.disabled = false;

  // Clear all field cells
  document.querySelectorAll('.gf-cell[data-card-id]').forEach(cell => {
    cell.innerHTML      = '';
    cell.dataset.cardId = '';
    cell.classList.remove('occupied');
  });

  // Clear action log
  clearActionLog();

  // Reset result screen opacity for next use
  ['result-title','result-subtitle','result-rewards','result-btns',
   'result-portrait-wrap'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.opacity = '0'; el.style.transform = ''; }
  });
  const glowEl = document.getElementById('result-glow');
  if (glowEl) glowEl.style.opacity = '0';

  updateFloatingMenu();
}

function goToSummonsFromResult() {
  endBattle();
  goTo('screen-gallery');
  openSummon();
}

/* =============================================
   B4-4-B/C: SECOND CHANCE
   Called when player main char HP hits 0.

   Phase 1 — triggerSecondChance():
     Show cinematic overlay, animate Dazed portrait in.

   Phase 2 — confirmSecondChance():
     Called when player clicks BEGIN SECOND CHANCE.
     Applies all rule changes from spec B4-4-C:
       • Turns reset to 1; player goes first.
       • Player Character card HP/SHD damage REMAINS.
       • Enemy field → all cards destroyed to discard pile.
       • Player deck/hand: strip CHS, CHSS, DZS, DZSS, DA, DAS, DASS, DR, EV, DZ cards.
       • Player Dozer cards on field → destroyed to discard.
       • Location cards (LO) remain playable.
       • Event card removed.
       • Both discard piles reshuffled into new decks (minus deleted cards).
       • Enemy portrait swaps to Dazed version.
       • Enemy main HP resets to Dazed card stats.
       • GS.secondChance = true.
   ============================================= */
function triggerSecondChance() {
  // Prevent double-trigger
  if (GS.secondChance) return;

  const overlay  = document.getElementById('sc-overlay');
  const vignette = document.getElementById('sc-vignette');
  const portrait = document.getElementById('sc-dazed-portrait');
  const title    = document.getElementById('sc-title');
  const subtitle = document.getElementById('sc-subtitle');
  const warning  = document.getElementById('sc-warning');
  const btn      = document.getElementById('sc-continue-btn');
  const img      = document.getElementById('sc-dazed-img');
  const ph       = document.getElementById('sc-dazed-ph');

  // FIX Bug 3/4: look up by index (stored reliably in GS), not by a .id field
  // that doesn't exist on character objects
  const scChar    = CHARACTERS[GS.selectedCharIndex] || {};
  const dazedSrc  = scChar.dazedImg || '';
  const dazedName = scChar.dazedName || (scChar.name ? scChar.name + ' (Dazed)' : 'DAZED');
  const dazedCardId = scChar.dazedCardId || null;
  const dazedCard   = dazedCardId ? CARDS.find(c => c.id === dazedCardId) : null;

  // Show dazed portrait image or fallback placeholder text
  if (dazedSrc) {
    img.src = dazedSrc;
    img.style.display = 'block';
    ph.style.display  = 'none';
  } else {
    img.style.display = 'none';
    ph.textContent    = dazedCard?.name || dazedName;
    ph.style.display  = 'flex';
  }

  // Show overlay, start fade
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    overlay.style.background = 'rgba(5,8,16,0.95)';
    vignette.style.opacity   = '1';
  });

  // Stagger elements in
  setTimeout(() => {
    portrait.style.opacity   = '1';
    portrait.style.transform = 'translateY(0) scale(1)';
  }, 200);
  setTimeout(() => { title.style.opacity    = '1'; title.style.transform = 'translateY(0)'; }, 600);
  setTimeout(() => { subtitle.style.opacity = '1'; }, 900);
  setTimeout(() => { warning.style.opacity  = '1'; }, 1100);
  setTimeout(() => {
    btn.style.opacity       = '1';
    btn.style.pointerEvents = 'all';
  }, 1600);
}

function confirmSecondChance() {
  // ── Hide the overlay ──────────────────────────────────────────────
  const overlay = document.getElementById('sc-overlay');
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.5s ease';
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.style.opacity = '';
    overlay.style.transition = '';
    ['sc-dazed-portrait','sc-title','sc-subtitle','sc-warning','sc-continue-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.opacity = '0';
    });
    document.getElementById('sc-dazed-portrait').style.transform = 'translateY(-60px) scale(0.7)';
    document.getElementById('sc-title').style.transform = 'translateY(20px)';
    document.getElementById('sc-vignette').style.opacity = '0';
    document.getElementById('sc-continue-btn').style.pointerEvents = 'none';
  }, 550);

  // ── Mark second chance active ─────────────────────────────────────
  GS.secondChance = true;
  GS.gameOver     = false;

  // ── Card types stripped from player (B4-4-C spec) ────────────────
  const STRIPPED_TYPES = new Set(['CHS','CHSS','DZS','DZSS','DA','DAS','DASS','DR','EV','DZ']);
  const ENEMY_STRIPPED = new Set(['DR']);

  function isStripped(cardId) {
    const card = CARDS.find(c => c.id === cardId);
    return card ? STRIPPED_TYPES.has(card.type) : false;
  }

  // ── 1. Destroy enemy field cards → enemy discard ──────────────────
  // FIX Bug 1: use GS.field directly with correct IDs gf-cell-R-C
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 5; col++) {
      const cellData = GS.field[row][col];
      if (cellData) {
        GS.enemyDiscard.push(cellData.cardId);
        GS.field[row][col] = null;
        renderFieldCell(row, col);
        // Brief red flash on the cell
        const cellEl = document.getElementById(`gf-cell-${row}-${col}`);
        if (cellEl) {
          cellEl.style.background = 'rgba(224,60,90,0.25)';
          setTimeout(() => { cellEl.style.background = ''; }, 600);
        }
      }
    }
  }

  // ── 2. Remove Event card from field ──────────────────────────────
  // FIX Bug 2: correct element id is 'gf-event-card', not 'gf-event-slot'
  GS.activeEvent = null;
  renderEventCard(); // re-renders the slot to show empty state
  const evCardEl = document.getElementById('gf-event-card');
  if (evCardEl) {
    evCardEl.style.background = 'rgba(224,60,90,0.1)';
    setTimeout(() => { evCardEl.style.background = ''; }, 600);
  }

  // ── 3. Destroy player's stripped card types from field ────────────
  // FIX Bug 12: use GS.field rows 2-3 with correct IDs gf-cell-R-C
  for (let row = 2; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const cellData = GS.field[row][col];
      if (cellData && isStripped(cellData.cardId)) {
        GS.playerDiscard.push(cellData.cardId);
        GS.field[row][col] = null;
        renderFieldCell(row, col);
        const cellEl = document.getElementById(`gf-cell-${row}-${col}`);
        if (cellEl) {
          cellEl.style.background = 'rgba(224,60,90,0.25)';
          setTimeout(() => { cellEl.style.background = ''; }, 600);
        }
      }
    }
  }

  // ── 4. Strip player hand ──────────────────────────────────────────
  GS.playerHand = (GS.playerHand || []).filter(id => !isStripped(id));

  // ── 5. Strip player deck ──────────────────────────────────────────
  GS.playerDeck = (GS.playerDeck || []).filter(id => !isStripped(id));

  // ── 6. Replace enemy deck entirely with a fresh dazed-themed deck ───
  // Clear whatever survived from the first phase — the dazed enemy
  // gets a completely new 50-card deck built around their DA card.
  const scCharForDeck = CHARACTERS[GS.selectedCharIndex] || {};
  const dazedCharCardId = scCharForDeck.dazedCardId || null;
  const freshEnemyDeck = dazedCharCardId
    ? buildCharacterDeck(dazedCharCardId)
    : shuffleCopy(CARDS.filter(c => !c.isDefault && c.type !== 'EV').map(c => c.id)).slice(0, 50);

  GS.enemyHand    = [];
  GS.enemyDeck    = freshEnemyDeck;
  GS.enemyDiscard = [];

  // ── 7. Reshuffle player discard into player deck ──────────────────
  const playerDiscardClean = (GS.playerDiscard || []).filter(id => !isStripped(id));
  GS.playerDeck    = shuffleCopy([...GS.playerDeck, ...playerDiscardClean]);
  GS.playerDiscard = [];

  // ── 8. Reset turn counter; player always goes first ───────────────
  GS.turn         = 1;
  GS.turnNumber   = 1;
  GS.whoFirst     = 'player';
  GS.cardPlayLog  = [];
  GS.lastEffectiveRank = 1;
  GS.lastComboCard     = null;
  GS.modifiedCards     = {}; // clear any return-to-hand stat overrides from first battle phase

  // ── 9. Reset energy for both sides ───────────────────────────────
  // FIX Bug 9 (energy): use correct key names playerExtraEnergy/enemyExtraEnergy
  GS.playerEnergy      = 10;
  GS.enemyEnergy       = 10;
  GS.playerExtraEnergy = 0;
  GS.enemyExtraEnergy  = 0;

  // ── 10. Swap enemy portrait to Dazed ─────────────────────────────
  // FIX Bug 4: use GS.selectedCharId (now set in initGameState) to find
  // the character entry, then read char.dazedImg / char.dazedCardId.
  // You must add dazedImg, dazedName, dazedCardId to each CHARACTERS entry
  // in data.js for this to show the correct portrait (see data.js comments).
  const scChar    = CHARACTERS[GS.selectedCharIndex] || {};
  const dazedSrc  = scChar.dazedImg || '';
  const dazedName = scChar.dazedName || (scChar.name ? scChar.name + ' (Dazed)' : 'DAZED');
  const dazedCardId = scChar.dazedCardId || null;
  const dazedCard   = dazedCardId ? CARDS.find(c => c.id === dazedCardId) : null;

  const enemyPortrait = document.getElementById('gf-enemy-portrait');
  if (enemyPortrait) {
    enemyPortrait.classList.remove('portrait-dead');
    enemyPortrait.style.backgroundImage = dazedSrc ? `url('${dazedSrc}')` : '';
    enemyPortrait.textContent = dazedSrc ? '' : '👾';
  }

  // ── 11. Reset enemy main HP to Dazed card stats ───────────────────
  if (GS.mainHp) {
    const dazedHp  = dazedCard?.hp  ?? 20;
    const dazedShd = dazedCard?.shd ?? 0;
    GS.mainHp.enemy = { hp: dazedHp, shd: dazedShd, maxHp: dazedHp, maxShd: dazedShd };
    if (dazedCard) GS.enemyMainCard = dazedCard.id;
  }

  // ── 12. Player portrait hp-bar stays as-is (damage persists) ──────
  // GS.mainHp.player is intentionally NOT reset.

  // ── 13. Update all UI ─────────────────────────────────────────────
  updatePortraitHpBars();
  renderPlayerHand();       // FIX Bug 5: was renderHand() which doesn't exist
  updatePileCounts();       // FIX Bug 5: was updateDeckCounts() which used wrong element IDs
  updateEnergyBars();       // now calls the correct first definition (Bug 6 fixed below)
  updateFieldPortraits();   // refresh field portrait art to show dazed version

  // FIX Bug 16: clear the correct element (gf-action-log-list) and reset GS.actionLog
  const logList = document.getElementById('gf-action-log-list');
  if (logList) logList.innerHTML = '';
  GS.actionLog = [];

  logAction('⚡ SECOND CHANCE — The Dazed has appeared!', 'system');
  logAction('Enemy deck replaced with Dazed\'s themed deck.', 'system');
  logAction('Player skill/sub-skill cards stripped. Player goes first.', 'system');

  // ── 15. Begin player's first Second Chance turn ───────────────────
  // FIX Bug 5: beginTurn('player') doesn't exist. Correct flow:
  // show the turn banner then let the player act (Next Turn button enabled).
  setTimeout(() => {
    showToast('⚡ Second Chance — Face the Dazed!');
    takePlayerTurnSnapshot();
    showTurnBanner("Player's Turn", GS.turnNumber, () => {
      GS.playerEnergy = Math.min(10 + GS.playerExtraEnergy, GS.playerEnergy + 3);
      updateEnergyBars();
      enforceCharacterSkillPlayability('player');
      document.getElementById('gf-nextturn-btn').disabled = false;
    });
  }, 700);
}

/* ── Second Chance win/lose check — extends checkWinCondition ── */
//  Patched into checkWinCondition via the existing secondChance branch:
//  If GS.secondChance is true and enemy HP hits 0 → dazed_defeated
//  If GS.secondChance is true and player HP hits 0 → game_over
//  (The existing checkWinCondition() already calls showResultScreen
//   correctly because it uses GS.secondChance to pick mode.)
//
//  For safety, also handle the player-loses-in-SC branch here:
const _origCheckWin = checkWinCondition;
checkWinCondition = function() {
  if (!GS.mainHp || GS.gameOver) return;

  if (GS.mainHp.enemy.hp <= 0) {
    GS.gameOver = true;
    GS.winner   = 'player';
    const mode  = GS.secondChance ? 'dazed_defeated' : 'dream_saved';
    logAction(GS.secondChance ? 'Dazed defeated! Victory!' : 'Enemy defeated! Dream Saved!', 'system');
    const ep = document.getElementById('gf-enemy-portrait');
    if (ep) { ep.classList.remove('portrait-dead'); void ep.offsetWidth; ep.classList.add('portrait-dead'); }
    setTimeout(() => showResultScreen(mode), 1200);
    return;
  }

  if (GS.mainHp.player.hp <= 0) {
    if (GS.secondChance) {
      // Already in Second Chance → true game over
      GS.gameOver = true;
      GS.winner   = 'enemy';
      logAction('Defeated by the Dazed. Dream Failed.', 'system');
      const pp = document.getElementById('gf-player-portrait');
      if (pp) { pp.classList.remove('portrait-dead'); void pp.offsetWidth; pp.classList.add('portrait-dead'); }
      setTimeout(() => showResultScreen('game_over'), 1500);
    } else {
      // First loss → trigger Second Chance
      logAction('Player defeated! Entering Second Chance...', 'system');
      const pp = document.getElementById('gf-player-portrait');
      if (pp) { pp.classList.remove('portrait-dead'); void pp.offsetWidth; pp.classList.add('portrait-dead'); }
      setTimeout(() => triggerSecondChance(), 1500);
    }
  }
};

/* =============================================
   B4-3-B: PILE VIEWER
   Click deck pile → scrollable menu of remaining cards.
   Click discard pile → scrollable menu of discarded cards.
   Both include a search bar and hover-to-enlarge per spec.
   Enemy deck is hidden. Enemy discard is visible.
   ============================================= */
function viewPile(who, type) {
  if (who === 'enemy' && type === 'deck') {
    showToast("You can't view the enemy's deck.");
    return;
  }

  const key = who === 'player'
    ? (type === 'deck' ? 'playerDeck' : 'playerDiscard')
    : (type === 'deck' ? 'enemyDeck'  : 'enemyDiscard');

  const allCards = (GS[key] || []).map(id => CARDS.find(c => c.id === id)).filter(Boolean);

  const titleEl  = document.getElementById('gf-pile-viewer-title');
  const gridEl   = document.getElementById('gf-pile-viewer-grid');

  const label = `${who === 'player' ? 'Your' : "Enemy's"} ${type === 'deck' ? 'Deck' : 'Discard'}`;
  titleEl.textContent = `${label} (${allCards.length})`;

  // Build search bar if not already present
  let searchEl = document.getElementById('gf-pile-search');
  if (!searchEl) {
    searchEl = document.createElement('input');
    searchEl.id          = 'gf-pile-search';
    searchEl.type        = 'text';
    searchEl.placeholder = 'Search cards…';
    searchEl.style.cssText = `
      display:block; width:calc(100% - 24px); margin:0 12px 8px;
      background:rgba(255,255,255,0.05); border:1px solid rgba(200,168,75,0.25);
      color:var(--text-main); font-family:var(--font-ui); font-size:12px;
      font-weight:600; padding:5px 10px; border-radius:2px; outline:none;
      flex-shrink:0;
    `;
    // Insert before the grid
    gridEl.parentNode.insertBefore(searchEl, gridEl);
  }
  searchEl.value = '';

  function renderPileGrid(filter) {
    const filtered = filter
      ? allCards.filter(c => (c.name || '').toLowerCase().includes(filter.toLowerCase()))
      : allCards;
    gridEl.innerHTML = '';
    if (filtered.length === 0) {
      gridEl.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:16px;text-align:center;">No cards found.</div>';
      return;
    }
    filtered.forEach(card => {
      const thumb = document.createElement('div');
      thumb.className = 'b3-card-thumb';
      if (card.img) {
        const img = document.createElement('img');
        img.src = card.img; img.alt = card.name || ''; thumb.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'b3-card-ph'; ph.textContent = card.name || '?'; thumb.appendChild(ph);
      }
      thumb.addEventListener('mouseenter', e => showEnlargedCard(card, null, e));
      thumb.addEventListener('mouseleave', () => hideEnlargedCard());
      gridEl.appendChild(thumb);
    });
  }

  searchEl.oninput = () => renderPileGrid(searchEl.value);
  renderPileGrid('');

  document.getElementById('gf-pile-viewer').style.display = 'flex';
}

function closePileViewer() {
  document.getElementById('gf-pile-viewer').style.display = 'none';
  // Remove search bar so it doesn't persist between opens with stale listeners
  const s = document.getElementById('gf-pile-search');
  if (s) s.remove();
}

/* =============================================
   CARDS DATA (B3) — move to cards.js later
   Edit this array to add all your cards.
   ============================================= */

/* =============================================
   TERRITORY → ZONE + ENERGY LOOKUP (B3-4)
   ============================================= */

/* =============================================
   PLAYER COLLECTION STATE
   ============================================= */
function loadCollection() {
  try {
    const s = JSON.parse(localStorage.getItem('nullcorps_collection'));
    if (s) return s;
  } catch(e) {}
  // Initialize: owned = all default cards
  const owned = {};
  CARDS.forEach(c => { if (c.isDefault) owned[c.id] = true; });
  return { owned, dust: 0, dt: STATE.dreamTickets, decks: [] };
}
function saveCollection(col) {
  localStorage.setItem('nullcorps_collection', JSON.stringify(col));
}
let COLLECTION = loadCollection();

/* =============================================
   B3: CARD GALLERY — BUILD & FILTER
   ============================================= */
function openGallery() {
  COLLECTION = loadCollection();
  STATE.dreamTickets = COLLECTION.dt || 0;
  updateFloatingMenu();
  b3RefreshCounts();
  b3ApplyFilters();
  goTo('screen-gallery');
}

function b3RefreshCounts() {
  const total = CARDS.length;
  const owned = CARDS.filter(c => COLLECTION.owned[c.id]).length;
  document.getElementById('b3-owned').textContent = owned;
  document.getElementById('b3-total').textContent = total;
  document.getElementById('b3-dust').textContent = COLLECTION.dust;
  const cr = document.getElementById('cr-have');
  if (cr) cr.textContent = COLLECTION.dust;
}

function b3ApplyFilters() {
  const sortKey = document.getElementById('b3-sort-cat').value;
  const query   = document.getElementById('b3-search').value.toLowerCase().trim();
  const filter  = document.getElementById('b3-collect-filter').value;

  let cards = [...CARDS];

  // Collection filter
  if (filter === 'owned')   cards = cards.filter(c => COLLECTION.owned[c.id]);
  if (filter === 'unowned') cards = cards.filter(c => !COLLECTION.owned[c.id]);

  // Search
  if (query) {
    cards = cards.filter(c => {
      switch(sortKey) {
        case 'cardName_az': case 'cardName_za': return c.name.toLowerCase().includes(query);
        case 'cardTitle_az': case 'cardTitle_za': return (c.title||'').toLowerCase().includes(query);
        case 'cardType': return (c.type||'').toLowerCase().includes(query);
        case 'setType':  return (c.set||'').toLowerCase().includes(query);
        case 'era':      return (c.era||'').toLowerCase().includes(query);
        case 'wordCount': return String(c.name.split(' ').length) === query;
        case 'specialLetter': return (c.specialLetters||[]).join(',').toLowerCase().includes(query);
        case 'mergedLetter':  return (c.mergedLetters||[]).join(',').toLowerCase().includes(query);
        case 'energyType':    return (c.mainEnergy||'').toLowerCase().includes(query);
        case 'zoneType':      return (c.zone||'').toLowerCase().includes(query);
        case 'territoryType': return (c.territory||'').toLowerCase().includes(query);
        case 'atk': return String(c.atk||0) === query;
        case 'def': return String(c.def||0) === query;
        case 'hp':  return String(c.hp||0)  === query;
        case 'shd': return String(c.shd||0) === query;
        case 'eg':  return String(c.eg||0)  === query;
        case 'cardNum': return (c.id||'').toLowerCase().includes(query);
        default: return c.name.toLowerCase().includes(query);
      }
    });
  }

  // Sort
  cards.sort((a,b) => {
    switch(sortKey) {
      case 'cardName_az':  return a.name.localeCompare(b.name);
      case 'cardName_za':  return b.name.localeCompare(a.name);
      case 'cardTitle_az': return (a.title||'').localeCompare(b.title||'');
      case 'cardTitle_za': return (b.title||'').localeCompare(a.title||'');
      case 'cardType':     return (a.type||'').localeCompare(b.type||'');
      case 'setType':      return (a.set||'').localeCompare(b.set||'');
      case 'era':          return (a.era||'').localeCompare(b.era||'');
      case 'wordCount':    return a.name.split(' ').length - b.name.split(' ').length;
      case 'specialLetter': return (a.specialLetters||[]).join(',').localeCompare((b.specialLetters||[]).join(','));
      case 'mergedLetter':  return (a.mergedLetters||[]).join(',').localeCompare((b.mergedLetters||[]).join(','));
      case 'energyType':    return (a.mainEnergy||'').localeCompare(b.mainEnergy||'');
      case 'zoneType':      return (a.zone||'').localeCompare(b.zone||'');
      case 'territoryType': return (a.territory||'').localeCompare(b.territory||'');
      case 'atk': return (b.atk||0) - (a.atk||0);
      case 'def': return (b.def||0) - (a.def||0);
      case 'hp':  return (b.hp||0)  - (a.hp||0);
      case 'shd': return (b.shd||0) - (a.shd||0);
      case 'eg':  return (a.eg||0)  - (b.eg||0);
      case 'cardNum': return (a.id||'').localeCompare(b.id||'');
      default: return 0;
    }
  });

  renderB3Grid('b3-grid', cards, 'b3-empty', card => openCardDetail(card.id));
}

function renderB3Grid(gridId, cards, emptyId, onClick, selectMode=false, selectedSet=null) {
  const grid  = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  grid.innerHTML = '';
  if (empty) empty.classList.toggle('show', cards.length === 0);

  cards.forEach(card => {
    const owned = !!COLLECTION.owned[card.id];
    const div = document.createElement('div');
    div.className = 'b3-card-thumb';
    if (selectMode && selectedSet && selectedSet.has(card.id)) {
      div.style.borderColor = 'var(--accent-teal)';
      div.style.boxShadow = '0 0 12px rgba(0,201,200,0.25)';
    }

    if (card.img) {
      const img = document.createElement('img');
      img.src = card.img; img.alt = card.name; img.draggable = false;
      div.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'b3-card-ph';
      ph.textContent = card.name;
      div.appendChild(ph);
    }

    if (!owned) {
      const mark = document.createElement('div');
      mark.className = 'b3-card-unowned-mark';
      mark.textContent = '?';
      div.appendChild(mark);
    }

    const lbl = document.createElement('div');
    lbl.className = 'b3-card-label';
    lbl.textContent = card.id ? `${card.id}` : card.name;
    div.appendChild(lbl);

    div.addEventListener('click', () => onClick(card));
    grid.appendChild(div);
  });
}

/* =============================================
   B3-A: CARD DETAIL
   ============================================= */
function openCardDetail(cardId) {
  const card = CARDS.find(c => c.id === cardId);
  if (!card) return;
  const owned = !!COLLECTION.owned[card.id];

  document.getElementById('b3a-name').textContent   = card.name || '';
  document.getElementById('b3a-title').textContent  = card.title || '';
  document.getElementById('b3a-num').textContent    = card.id || '';
  document.getElementById('b3a-badge').textContent  = card.type || '';
  document.getElementById('b3a-type').textContent   = card.type || '';
  document.getElementById('b3a-set').textContent    = card.set || '';

  // Era (only for CH/DA/LO)
  const eraRow = document.getElementById('b3a-era-row');
  eraRow.style.display = ['CH','DA','LO'].includes(card.type) ? 'flex' : 'none';
  document.getElementById('b3a-era').textContent = card.era || '—';

  // Territory + Energy
  const hasTerritory = card.territory && TERRITORY_DATA[card.territory];
  document.getElementById('b3a-territory-row').style.display = hasTerritory ? 'flex' : 'none';
  document.getElementById('b3a-energy-row').style.display = hasTerritory ? 'flex' : 'none';
  if (hasTerritory) {
    const td = TERRITORY_DATA[card.territory];
    document.getElementById('b3a-territory').textContent = `${card.territory} (${td.zone})`;
    const energyParts = [td.main, td.secondary, td.third].filter(e => e && e !== '—');
    document.getElementById('b3a-energy').textContent = energyParts.join(' / ') || '—';
  }

  // Stats
  const statsRow = document.getElementById('b3a-stats-row');
  statsRow.innerHTML = '';
  if (['CH','DZ','DA'].includes(card.type)) {
    [['ATK', card.atk],['DEF', card.def],['HP', card.hp],['SHD', card.shd],['EG', card.eg]]
      .forEach(([k,v]) => {
        if (v !== undefined) {
          const chip = document.createElement('div');
          chip.className = 'b3a-stat-chip';
          chip.textContent = `${k} ${v}`;
          statsRow.appendChild(chip);
        }
      });
  } else if (card.eg !== undefined) {
    const chip = document.createElement('div');
    chip.className = 'b3a-stat-chip';
    chip.textContent = `EG ${card.eg}`;
    statsRow.appendChild(chip);
  }

  // Word / letter info
  const words = (card.name||'').split(' ');
  document.getElementById('b3a-words').textContent   = `${words.length} word${words.length!==1?'s':''}`;
  document.getElementById('b3a-special').textContent = (card.specialLetters||[]).join(', ') || '—';
  document.getElementById('b3a-merged').textContent  = (card.mergedLetters||[]).join(', ')  || '—';
  document.getElementById('b3a-desc').textContent    = card.description || '(No description yet.)';

  // Card art
  const art = document.getElementById('b3a-card-art');
  art.innerHTML = '';
  if (card.img) {
    const img = document.createElement('img');
    img.src = card.img; img.style.cssText='width:100%;height:100%;object-fit:cover;';
    art.appendChild(img);
  } else {
    art.style.cssText='display:flex;align-items:center;justify-content:center;color:rgba(200,168,75,0.2);font-size:14px;font-weight:700;height:100%;';
    art.textContent = card.name;
  }

  // Actions
  const actions = document.getElementById('b3a-actions');
  actions.innerHTML = '';
  if (owned) {
    const dustBtn = document.createElement('button');
    dustBtn.className = 'b3-top-btn';
    dustBtn.textContent = 'Dust (5 Dust)';
    dustBtn.onclick = () => dustSingleCard(card.id);
    actions.appendChild(dustBtn);
  }

  STATE.detailCardId = cardId;
  goTo('screen-card-detail');
}

function dustSingleCard(cardId) {
  if (!COLLECTION.owned[cardId]) return;
  delete COLLECTION.owned[cardId];
  COLLECTION.dust += 5;
  saveCollection(COLLECTION);
  b3RefreshCounts();
  showToast('Card dusted. +5 Dust');
  goTo('screen-gallery');
}

/* =============================================
   B3-B: DECK BUILDER
   ============================================= */
let ACTIVE_DECK_IDX = -1;

function openDeckBuilder() {
  renderDeckSlots();
  goTo('screen-deck-builder');
}

function renderDeckSlots() {
  const wrap = document.getElementById('b3b-deck-slots');
  wrap.innerHTML = '';
  const decks = COLLECTION.decks || [];
  decks.forEach((deck, i) => {
    const slot = document.createElement('div');
    slot.className = 'b3b-deck-slot';
    slot.innerHTML = `<div class="b3b-deck-name">${deck.name}</div>
      <div class="b3b-deck-count">${deck.cards.length}/50</div>`;
    if (deck.cards.length < 50) {
      const err = document.createElement('div');
      err.className = 'b3b-deck-error'; err.textContent = '⚠';
      slot.appendChild(err);
    }
    slot.onclick = () => openDeckEditor(i);
    wrap.appendChild(slot);
  });
  // Fill remaining up to 10 with empty slots
  for (let i = decks.length; i < 10; i++) {
    const slot = document.createElement('div');
    slot.className = 'b3b-deck-slot empty';
    slot.innerHTML = `<div style="font-size:28px;color:rgba(200,168,75,0.2)">+</div>
      <div class="b3b-deck-count">Empty Slot</div>`;
    slot.onclick = () => { if (decks.length < 10) createNewDeck(); };
    wrap.appendChild(slot);
  }
}

function createNewDeck() {
  if ((COLLECTION.decks||[]).length >= 10) { showToast('Max 10 decks reached.'); return; }
  const name = `Deck ${(COLLECTION.decks||[]).length + 1}`;
  COLLECTION.decks = COLLECTION.decks || [];
  COLLECTION.decks.push({ name, mainChar: null, cards: [] });
  saveCollection(COLLECTION);
  openDeckEditor(COLLECTION.decks.length - 1);
}

function openDeckEditor(deckIdx) {
  ACTIVE_DECK_IDX = deckIdx;
  const deck = COLLECTION.decks[deckIdx];
  document.getElementById('de-title').textContent = deck.name;
  renderDeckEditor();
  goTo('screen-deck-editor');
}

function renderDeckEditor() {
  const deck = COLLECTION.decks[ACTIVE_DECK_IDX];
  document.getElementById('de-count').textContent = deck.cards.length;

  // Main char slot
  const mainBox = document.getElementById('de-main-box');
  if (deck.mainChar) {
    const c = CARDS.find(c => c.id === deck.mainChar);
    mainBox.innerHTML = `<span style="color:var(--accent-gold);font-weight:700;">${c ? c.name : deck.mainChar}</span>`;
  } else {
    mainBox.innerHTML = '<span>+ Set Main Character</span>';
  }

  // Cards grid (4 rows × 13 cols = 52 slots, show 50)
  const grid = document.getElementById('de-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 50; i++) {
    const cardId = deck.cards[i];
    const slot = document.createElement('div');
    slot.className = 'b3-card-thumb';
    slot.style.cssText='cursor:pointer;';
    if (cardId) {
      const card = CARDS.find(c => c.id === cardId);
      const missing = card && !COLLECTION.owned[card.id];
      // Count duplicates
      const count = deck.cards.filter(id => id === cardId).length;
      if (card && card.img) {
        const img = document.createElement('img');
        img.src=card.img; img.style.cssText='width:100%;height:100%;object-fit:cover;';
        slot.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className='b3-card-ph'; ph.style.fontSize='8px';
        ph.textContent = card ? card.name : cardId;
        slot.appendChild(ph);
      }
      if (count > 1) {
        const badge = document.createElement('div');
        badge.style.cssText='position:absolute;bottom:2px;right:2px;background:rgba(5,8,16,0.85);border:1px solid var(--accent-gold);color:var(--accent-gold);font-size:9px;font-weight:700;padding:1px 4px;border-radius:2px;';
        badge.textContent = `×${count}`;
        slot.appendChild(badge);
      }
      if (missing) {
        const m = document.createElement('div');
        m.className='b3-card-unowned-mark'; m.textContent='?';
        slot.appendChild(m);
      }
      slot.addEventListener('click', () => removeDeckCard(i));
    } else {
      const ph = document.createElement('div');
      ph.className='b3-card-ph'; ph.textContent='+';
      slot.appendChild(ph);
      slot.addEventListener('click', () => openCardPicker('slot'));
    }
    grid.appendChild(slot);
  }
}

let PICKER_MODE = 'slot';
function openCardPicker(mode) {
  PICKER_MODE = mode;
  filterCardPicker();
  goTo('screen-card-picker');
}

function filterCardPicker() {
  const q = (document.getElementById('picker-search').value||'').toLowerCase();
  const deck = COLLECTION.decks[ACTIVE_DECK_IDX];
  let cards = CARDS.filter(c => COLLECTION.owned[c.id]);
  if (PICKER_MODE === 'main') cards = cards.filter(c => ['CH','DZ','DA'].includes(c.type));
  if (q) cards = cards.filter(c => c.name.toLowerCase().includes(q) || (c.id||'').toLowerCase().includes(q));

  renderB3Grid('picker-grid', cards, null, card => pickCard(card.id));
}

let PICKER_CALLBACK = null; // Optional: set before openCardPicker for custom return flow

function pickCard(cardId) {
  const deck = COLLECTION.decks[ACTIVE_DECK_IDX];
  if (PICKER_MODE === 'main') {
    deck.mainChar = cardId;
    saveCollection(COLLECTION);
    // If a custom callback is set (e.g. from Dream Ready), use it instead
    if (typeof PICKER_CALLBACK === 'function') {
      const cb = PICKER_CALLBACK;
      PICKER_CALLBACK = null;
      cb(cardId);
      return;
    }
    renderDeckEditor();
    goTo('screen-deck-editor');
    return;
  }
  // Max 4 of same card, max 50 total
  const countOfCard = deck.cards.filter(id => id === cardId).length;
  if (countOfCard >= 4) { showToast('Max 4 copies per card.'); return; }
  if (deck.cards.length >= 50) { showToast('Deck is full (50/50).'); return; }
  deck.cards.push(cardId);
  saveCollection(COLLECTION);
  renderDeckEditor();
  goTo('screen-deck-editor');
}

function removeDeckCard(slotIdx) {
  const deck = COLLECTION.decks[ACTIVE_DECK_IDX];
  if (!deck.cards[slotIdx]) { openCardPicker('slot'); return; }
  deck.cards.splice(slotIdx, 1);
  saveCollection(COLLECTION);
  renderDeckEditor();
}

function saveDeck() {
  const deck = COLLECTION.decks[ACTIVE_DECK_IDX];
  // Auto-assign main char if missing and CH card exists
  if (!deck.mainChar) {
    const ch = deck.cards.find(id => {
      const c = CARDS.find(c => c.id === id);
      return c && ['CH','DZ','DA'].includes(c.type);
    });
    if (ch) deck.mainChar = ch;
    else if (deck.cards.length === 50) {
      const randomCH = CARDS.find(c => ['CH','DZ','DA'].includes(c.type) && COLLECTION.owned[c.id]);
      if (randomCH) { deck.cards.splice(49,1); deck.cards.push(randomCH.id); deck.mainChar = randomCH.id; }
    }
  }
  saveCollection(COLLECTION);
  showToast('Deck saved!');
  renderDeckSlots();
}

function copyDeckCode() {
  const deck = COLLECTION.decks[ACTIVE_DECK_IDX];
  const code = btoa(JSON.stringify(deck));
  navigator.clipboard?.writeText(code).then(() => showToast('Deck code copied!')).catch(()=>showToast('Copy failed — try manually.'));
}

function loadDeckFromText() {
  const code = prompt('Paste deck code:');
  if (!code) return;
  try {
    const deck = JSON.parse(atob(code));
    COLLECTION.decks = COLLECTION.decks || [];
    COLLECTION.decks.push(deck);
    saveCollection(COLLECTION);
    renderDeckSlots();
    // Check for missing cards and notify the player
    const missingCards = (deck.cards || []).filter(id => !COLLECTION.owned[id]);
    if (missingCards.length > 0) {
      showToast(`Deck loaded! ${missingCards.length} card(s) you don't own are marked with ?.`);
    } else {
      showToast('Deck loaded!');
    }
    // Open the deck editor so missing cards are immediately visible with ? marks
    const newIdx = COLLECTION.decks.length - 1;
    openDeckEditor(newIdx);
  } catch(e) { showToast('Invalid deck code.'); }
}

/* =============================================
   B3-C: SUMMON
   ============================================= */
let SUMMON_MULT = 1;
let SUMMON_QUEUE = [];

function openSummon() {
  // FIX Bug 14: always reload DT from collection before computing max multiplier
  COLLECTION = loadCollection();
  STATE.dreamTickets = COLLECTION.dt || 0;
  updateFloatingMenu();

  SUMMON_MULT = 1;
  SUMMON_QUEUE = [];
  document.getElementById('summon-n').textContent = 1;
  document.getElementById('summon-m').textContent = 10;
  document.getElementById('summon-error').textContent = '';
  document.getElementById('summon-reveal-wrap').style.display = 'none';

  // Show 3 latest cards
  const showcase = document.getElementById('summon-showcase');
  showcase.innerHTML = '';
  const latest = [...CARDS].slice(-3);
  latest.forEach(card => {
    const div = document.createElement('div');
    div.className = 'summon-showcase-card';
    if (card.img) { div.innerHTML=`<img src="${card.img}" style="width:100%;height:100%;object-fit:cover;">`; }
    else { div.textContent = card.name || '?'; }
    showcase.appendChild(div);
  });

  goTo('screen-summon');
}

function adjustSummonMult(delta) {
  const maxMult = Math.floor(STATE.dreamTickets / 50) || 1;
  SUMMON_MULT = Math.max(1, Math.min(maxMult, SUMMON_MULT + delta));
  document.getElementById('summon-n').textContent = SUMMON_MULT;
  document.getElementById('summon-m').textContent = SUMMON_MULT * 10;
  document.getElementById('summon-error').textContent = '';
}

function doSummon() {
  const cost = SUMMON_MULT * 50;
  if (STATE.dreamTickets < cost) {
    const needed = cost - STATE.dreamTickets;
    document.getElementById('summon-error').textContent = `You need ${needed} more DT to summon.`;
    return;
  }
  if (CARDS.length === 0) { document.getElementById('summon-error').textContent = 'No cards in pool yet.'; return; }

  // Deduct DT
  STATE.dreamTickets -= cost;
  COLLECTION.dt = STATE.dreamTickets;
  updateFloatingMenu();

  // Build summon queue (batches of 10)
  SUMMON_QUEUE = [];
  const pool = CARDS.filter(c => !c.isDefault);
  for (let batch = 0; batch < SUMMON_MULT; batch++) {
    const picks = [];
    for (let i = 0; i < 10; i++) {
      picks.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    SUMMON_QUEUE.push(picks);
  }

  showNextSummonBatch();
}

function showNextSummonBatch() {
  if (SUMMON_QUEUE.length === 0) {
    document.getElementById('summon-reveal-wrap').style.display='none';
    saveCollection(COLLECTION);
    b3RefreshCounts();
    showToast('All cards added to collection!');
    return;
  }
  const batch = SUMMON_QUEUE.shift();
  const grid = document.getElementById('summon-reveal-grid');
  grid.innerHTML = '';
  document.getElementById('summon-reveal-wrap').style.display='flex';

  batch.forEach(card => {
    const div = document.createElement('div');
    div.className = 'summon-reveal-card';
    div.textContent = '?';
    div.dataset.cardId = card.id;
    div.addEventListener('click', () => {
      if (div.classList.contains('revealed')) return;
      revealSummonCard(div, card);
    });
    // Animate in from right
    div.style.animation = 'slideInCard 0.4s ease both';
    grid.appendChild(div);
  });
}

function revealSummonCard(div, card) {
  div.classList.add('revealed');
  div.textContent = '';
  if (card.img) {
    div.innerHTML = `<img src="${card.img}" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    div.style.cssText += 'font-size:9px;color:var(--accent-gold);font-weight:700;padding:4px;text-align:center;';
    div.textContent = card.name;
  }
  // If already owned, auto-dust
  if (COLLECTION.owned[card.id]) {
    COLLECTION.dust += 5;
    const dustMark = document.createElement('div');
    dustMark.style.cssText='position:absolute;top:2px;left:2px;background:rgba(5,8,16,0.85);border:1px solid var(--text-dim);color:var(--text-dim);font-size:8px;font-weight:700;padding:1px 3px;';
    dustMark.textContent='+5 Dust';
    div.style.position='relative';
    div.appendChild(dustMark);
  } else {
    COLLECTION.owned[card.id] = true;
  }
}

function openAllSummonCards() {
  document.querySelectorAll('.summon-reveal-card:not(.revealed)').forEach(div => {
    const card = CARDS.find(c => c.id === div.dataset.cardId);
    if (card) revealSummonCard(div, card);
  });
}

function continueSummon() {
  saveCollection(COLLECTION);
  if (SUMMON_QUEUE.length > 0) showNextSummonBatch();
  else {
    document.getElementById('summon-reveal-wrap').style.display='none';
    b3RefreshCounts();
    showToast('All cards added to collection!');
  }
}

/* =============================================
   B3-D: DUST MULTIPLE
   ============================================= */
const DM_SELECTED = new Set();

function openDustMultiple() {
  DM_SELECTED.clear();
  updateDMCounts();
  const ownedCards = CARDS.filter(c => COLLECTION.owned[c.id]);
  renderB3Grid('dm-grid', ownedCards, null, card => toggleDMSelect(card.id), true, DM_SELECTED);
  goTo('screen-dust-multi');
}

function toggleDMSelect(cardId) {
  if (DM_SELECTED.has(cardId)) DM_SELECTED.delete(cardId);
  else DM_SELECTED.add(cardId);
  updateDMCounts();
  // Re-render to update highlights
  const ownedCards = CARDS.filter(c => COLLECTION.owned[c.id]);
  renderB3Grid('dm-grid', ownedCards, null, card => toggleDMSelect(card.id), true, DM_SELECTED);
}

function updateDMCounts() {
  document.getElementById('dm-selected').textContent = DM_SELECTED.size;
  document.getElementById('dm-value').textContent = DM_SELECTED.size * 5;
}

function confirmDustMultiple() {
  if (DM_SELECTED.size === 0) { showToast('No cards selected.'); return; }
  DM_SELECTED.forEach(id => { delete COLLECTION.owned[id]; COLLECTION.dust += 5; });
  saveCollection(COLLECTION);
  b3RefreshCounts();
  showToast(`Dusted ${DM_SELECTED.size} card(s). +${DM_SELECTED.size*5} Dust`);
  DM_SELECTED.clear();
  goTo('screen-gallery');
}

/* =============================================
   B3-E: CRAFT CARDS
   ============================================= */
const CR_SELECTED = new Set();

function openCraftCards() {
  CR_SELECTED.clear();
  updateCRCounts();
  const unowned = CARDS.filter(c => !COLLECTION.owned[c.id]);
  renderB3Grid('cr-grid', unowned, null, card => toggleCRSelect(card.id), true, CR_SELECTED);
  document.getElementById('cr-have').textContent = COLLECTION.dust;
  goTo('screen-craft');
}

function toggleCRSelect(cardId) {
  if (CR_SELECTED.has(cardId)) CR_SELECTED.delete(cardId);
  else CR_SELECTED.add(cardId);
  updateCRCounts();
  const unowned = CARDS.filter(c => !COLLECTION.owned[c.id]);
  renderB3Grid('cr-grid', unowned, null, card => toggleCRSelect(card.id), true, CR_SELECTED);
}

function updateCRCounts() {
  document.getElementById('cr-selected').textContent = CR_SELECTED.size;
  document.getElementById('cr-cost').textContent = CR_SELECTED.size * 10;
}

function confirmCraft() {
  const cost = CR_SELECTED.size * 10;
  if (CR_SELECTED.size === 0) { showToast('No cards selected.'); return; }
  if (COLLECTION.dust < cost) { showToast(`Need ${cost} Dust. You have ${COLLECTION.dust}.`); return; }
  COLLECTION.dust -= cost;
  CR_SELECTED.forEach(id => { COLLECTION.owned[id] = true; });
  saveCollection(COLLECTION);
  b3RefreshCounts();
  showToast(`Crafted ${CR_SELECTED.size} card(s)! -${cost} Dust`);
  CR_SELECTED.clear();
  goTo('screen-gallery');
}

/* =============================================
   TOAST HELPER
   ============================================= */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* =============================================
   WIRE UP GALLERY BUTTON ON MAIN MENU
   ============================================= */
// Override the plain goTo for gallery button to use openGallery
const _galleryBtn = document.querySelector('[onclick="goTo(\'screen-gallery\')"]');
if (_galleryBtn) _galleryBtn.onclick = openGallery;

/* =============================================
   INIT
   ============================================= */
loadOptions();
updateFloatingMenu();
buildB2Grid();
computeCardTextStats(); // C3-1: auto-fill wordCount / letterCount on all cards
registerBuffsFromData(); // auto-register BUFFS[] / DEBUFFS[] from data.js

/* =============================================
   DEV REFERENCE SCREEN
   Full compendium of every card-effect variable
   from Section C3 of the design document.
   ============================================= */

const DEV_DATA = [
  // ── C3-1-A: Global Variables ──────────────────────────────────────────
  {
    cat: 'C3-1-A: Global',
    vars: [
      { name:'@ref:<variable>',          type:'target',   desc:'Links a variable to another — used to target specific cards or values.',                            example:'ATK:+10@ref:IsEnemy:OnField' },
      { name:'random:<targetvar>',        type:'target',   desc:'Picks one random card from the resolved target group.',                                            example:'random:IsEnemy:OnField' },
      { name:'random_no:><min,max>',      type:'numeric',  desc:'Picks a random number between min and max (inclusive).',                                           example:'random_no:><1,6' },
      { name:'CardPlayable:true/false',   type:'bool',     desc:'If false, the card cannot be dragged out of hand and cannot be played.',                           example:'CardPlayable:false' },
      { name:'CardMovable:true/false',    type:'bool',     desc:'If false, the card cannot be moved on the field by anyone.',                                       example:'CardMovable:false' },
      { name:'CardAttackable:true/false', type:'bool',     desc:'If false, this card cannot be targeted for attack by anyone.',                                     example:'CardAttackable:false' },
      { name:'CardEngageAttack:true/false',type:'bool',    desc:'If false, this card cannot initiate an attack.',                                                   example:'CardEngageAttack:false' },
      { name:'check_code:@ref:<target>,<text>:true/false', type:'bool', desc:'Checks all card effects of target cards for a specific text string. Returns true/false.', example:'check_code:@ref:IsPlayer,igv:end_of_turn:true' },
      { name:'unique_card_code',          type:'text',     desc:'Returns the static unique ID of the card (set in data.js).',                                       example:'condition:unique_card_code:001-HS-CH1' },
      { name:'unique_in-game_card_code',  type:'text',     desc:'Returns the runtime unique code assigned at game start. Player prefix p_, enemy prefix e_.',      example:'e_001-HS-CH1_1' },
      { name:'loop:<n>',                  type:'numeric',  desc:'Placed as the last numbered line — repeats all prior effect lines n times.',                       example:'3) loop:2' },
      { name:'repeat:loop@ref',           type:'modifier', desc:'Forces a card\'s effect to repeat itself when it fires.',                                           example:'repeat:loop@ref:TargetedCard' },
    ]
  },
  // ── C3-1-A: Take / Stay ───────────────────────────────────────────────
  {
    cat: 'C3-1-A: Stay / Pick / Copy',
    vars: [
      { name:'stay(<action>)',            type:'modifier', desc:'Performs a pick/copy action but stores the card\'s data without physically moving it to hand. Used before switch/merge.',  example:'stay(pick:IsPlayer:InHand,1,all)' },
      { name:'pick:<targetvar>,<count>,<choice>', type:'action', desc:'Shows a pick UI. Chosen cards move to hand. "all" for choice shows every card.',           example:'pick:IsEnemy:InDeck,1,3' },
      { name:'pick_cardcount',            type:'numeric',  desc:'How many cards can be picked to add to your hand.',                                                example:'pick_cardcount = 2' },
      { name:'pick_cardchoice',           type:'numeric',  desc:'How many cards are presented to be picked from.',                                                  example:'pick_cardchoice = 5' },
      { name:'copy:<targetvar>,<count>,<choice>', type:'action', desc:'Like pick but the original card stays. A duplicate is added to hand.',                       example:'copy:IsEnemy:InDeck,1,3' },
      { name:'copy_cardcount',            type:'numeric',  desc:'How many cards can be copied to your hand.',                                                       example:'copy_cardcount = 1' },
      { name:'copy_cardchoice',           type:'numeric',  desc:'How many cards are presented to be copied from.',                                                  example:'copy_cardchoice = 3' },
      { name:'all',                       type:'modifier', desc:'Used in pick/copy/merge as a choice count — presents every available card.',                       example:'pick:IsPlayer:OnField,2,all' },
    ]
  },
  // ── C3-1-A: Return / Switch / Merge ──────────────────────────────────
  {
    cat: 'C3-1-A: Return / Switch / Merge',
    vars: [
      { name:'return_card:true/false',    type:'action',   desc:'Returns a card from the field to its owner\'s hand. Set back to false after.',                    example:'return_card:true@ref:TargetedCard' },
      { name:'switch_target',             type:'target',   desc:'Stores the first card chosen in a switch operation.',                                              example:'switch_card_no[1]=LastCard:picked' },
      { name:'switch_chosen',             type:'target',   desc:'Stores the second card chosen to swap with switch_target.',                                        example:'switch_card_no[2]=LastCard:picked' },
      { name:'switch_cards:<A>><B>',      type:'action',   desc:'Swaps two cards between their positions.',                                                         example:'switch_cards:switch_card_no[1]><switch_card_no[2]' },
      { name:'switch_card_no[<n>]',       type:'modifier', desc:'Array slot storing a card\'s unique in-game code for switch operations.',                          example:'switch_card_no[1]=LastCard:picked' },
      { name:'merge_target',              type:'target',   desc:'The first card in a merge — this card receives the combined stats.',                               example:'merge_card_no[1]=LastCard:picked' },
      { name:'merge_chosen',              type:'target',   desc:'The second card in a merge — its stats are transferred to merge_target.',                          example:'merge_card_no[2]=LastCard:picked' },
      { name:'merge_cards:<A>><B>,<stats>',type:'action',  desc:'Merges specified stats from B into A. Use "all" for HP;DEF;SHD;ATK. Supports Max:/Min: prefixes.',example:'merge_cards:merge_card_no[1]><merge_card_no[2],all' },
      { name:'merge_card_no[<n>]',        type:'modifier', desc:'Array slot storing a card\'s unique in-game code for merge operations.',                           example:'merge_card_no[1]=LastCard:picked' },
    ]
  },
  // ── C3-1-A: Target Variables ──────────────────────────────────────────
  {
    cat: 'C3-1-A: Target Variables',
    vars: [
      { name:'IsEnemy:<linkedvar>',       type:'target',   desc:'Targets cards belonging to the enemy.',                                                            example:'IsEnemy:OnField' },
      { name:'IsPlayer:<linkedvar>',      type:'target',   desc:'Targets cards belonging to the player.',                                                           example:'IsPlayer:InHand' },
      { name:'IsMainChar:true/false',     type:'bool',     desc:'Filters to only main character cards.',                                                            example:'condition:IsMainChar:true' },
      { name:'IsSideChar:true/false',     type:'bool',     desc:'Filters to only side character cards.',                                                            example:'condition:IsSideChar:true' },
      { name:'TargetedCard[:<action>]',   type:'target',   desc:'Returns the card currently targeted by the player/enemy. Optional action filter.',                 example:'@ref:TargetedCard:attacked' },
      { name:'LastCard:<actionvar>',      type:'target',   desc:'Returns the last card that performed the specified action: picked / played / drawn / moved / attacked / banished / revived / returned.', example:'@ref:LastCard:played' },
      { name:'next_card:<action>,<mode>,<n>', type:'target', desc:'Returns cards played after the current one. mode: applyall (first n matches) or applyturn (skip n forward).', example:'@ref:next_card:played,applyall,1' },
      { name:'prev_card:<action>,<mode>,<n>', type:'target', desc:'Returns cards played before the current one. Same mode logic as next_card.',                    example:'@ref:prev_card:played,applyturn,2' },
      { name:'AnyCard:<glinkedvar>',      type:'target',   desc:'Searches both player and enemy for cards matching the location group. No side prefix needed.',    example:'AnyCard:OnField' },
    ]
  },
  // ── C3-1-A: Linked / Group Variables ─────────────────────────────────
  {
    cat: 'C3-1-A: Linked & Group Variables',
    vars: [
      { name:'OnField[:<actionvar>]',     type:'target',   desc:'Checks cards currently on the field. Optional action filter.',                                     example:'IsPlayer:OnField:lastaction:moved' },
      { name:'InHand[:<actionvar>]',      type:'target',   desc:'Checks cards currently in hand.',                                                                  example:'IsEnemy:InHand' },
      { name:'InDeck[:<actionvar>]',      type:'target',   desc:'Checks cards in the deck pile.',                                                                   example:'IsPlayer:InDeck' },
      { name:'InDiscardPile',             type:'target',   desc:'Checks cards in the discard pile.',                                                                example:'IsEnemy:InDiscardPile' },
      { name:'AnyCard:<loc1>;<loc2>',     type:'target',   desc:'Checks multiple locations at once for one side. Combine with IsPlayer/IsEnemy or use bare for both sides.', example:'IsPlayer:AnyCard:OnField;InHand' },
    ]
  },
  // ── C3-1-A: Action Variables ──────────────────────────────────────────
  {
    cat: 'C3-1-A: Action Variables',
    vars: [
      { name:'played',    type:'action', desc:'Checks for the playing of a card.',       example:'condition:lastaction:played' },
      { name:'drawn',     type:'action', desc:'Checks for the drawing of a card.',       example:'LastCard:drawn' },
      { name:'attacked',  type:'action', desc:'Checks for the attacking of a card.',     example:'TargetedCard:attacked' },
      { name:'moved',     type:'action', desc:'Checks for the moving of a card.',        example:'IsPlayer:OnField:lastaction:moved' },
      { name:'targeted',  type:'action', desc:'Checks for the targeting of a card.',     example:'condition:lastaction:targeted' },
      { name:'picked',    type:'action', desc:'Checks for the picking of a card.',       example:'LastCard:picked' },
      { name:'banished',  type:'action', desc:'Checks for the banishing of a card.',     example:'LastCard:banished' },
      { name:'revived',   type:'action', desc:'Checks for the reviving of a card.',      example:'LastCard:revived' },
      { name:'merged',    type:'action', desc:'Checks for the merging of a card.',       example:'LastCard:merged' },
      { name:'lastaction:<actionvar>',    type:'action',  desc:'Checks the last action performed by this card instance.',                                           example:'condition:lastaction:attacked' },
      { name:'nextaction:<actionvar>',    type:'action',  desc:'Checks what action is about to happen (set by the engine just before effect resolution).',          example:'condition:nextaction:played' },
    ]
  },
  // ── C3-1-B: Stats ─────────────────────────────────────────────────────
  {
    cat: 'C3-1-B: Stats',
    vars: [
      { name:'HP:<op><value>',   type:'numeric', desc:'Current HP stat. Use with operators: = + - < > <= >= !=',     example:'HP:+50 / HP:-10 / HP:=100' },
      { name:'DEF:<op><value>',  type:'numeric', desc:'Current DEF stat.',                                            example:'DEF:+5' },
      { name:'ATK:<op><value>',  type:'numeric', desc:'Current ATK stat.',                                            example:'ATK:-3' },
      { name:'SHD:<op><value>',  type:'numeric', desc:'Current Shield stat. SHD is always consumed before HP.',       example:'SHD:+20' },
      { name:'EG:<op><value>',   type:'numeric', desc:'Current energy in the energy bar (not card cost).',            example:'EG:+2' },
      { name:'cost:<op><value>', type:'numeric', desc:'Energy cost of the card itself (to be played from hand).',     example:'cost:-1' },
      { name:'damage:<value>',   type:'numeric', desc:'Amount of total damage dealt to a card this attack (ATK − target DEF).',  example:'condition:damage>10' },
      { name:'Max:<stat>',       type:'numeric', desc:'Returns/sets the original max value of a stat.',               example:'HP:+50%@Max:HP' },
      { name:'Min:<stat>',       type:'numeric', desc:'Sets the floor a stat cannot go below.',                       example:'Min:HP:5' },
      { name:'New:<stat>',       type:'numeric', desc:'Returns the current modified max (after buffs/debuffs changed it).', example:'New:HP' },
      { name:'Lost:<stat>',      type:'numeric', desc:'Returns (Max stat − current stat). Useful for "missing HP" effects.', example:'HP:+@Lost:HP' },
      { name:'Lowest:<stat>@ref:<target>', type:'numeric', desc:'Finds the card with the lowest value of that stat in the target group.', example:'Lowest:HP@ref:IsEnemy:OnField' },
      { name:'Highest:<stat>@ref:<target>',type:'numeric', desc:'Finds the card with the highest value of that stat in the target group.', example:'Highest:ATK@ref:IsPlayer:InHand' },
    ]
  },
  // ── C3-1-C: Location Stats ────────────────────────────────────────────
  {
    cat: 'C3-1-C: Location Stats',
    vars: [
      { name:'zone_type:<text>',          type:'text',     desc:'Returns/checks the Zone type of the card (e.g. Northwest, North, Central).',                       example:'condition:zone_type:North' },
      { name:'territory_type:<text>',     type:'text',     desc:'Returns/checks the Territory of the card. Zone and Energy auto-fill from territory.',              example:'condition:territory_type:Serenelast' },
      { name:'mainenergy_type:<text>',    type:'text',     desc:'Returns/checks the main energy type of the card.',                                                 example:'condition:mainenergy_type:Frigid' },
      { name:'secondaryenergy_type:<text>',type:'text',    desc:'Returns/checks the secondary energy type.',                                                        example:'condition:secondaryenergy_type:Thermal' },
      { name:'thirdenergy_type:<text>',   type:'text',     desc:'Returns/checks the third energy type.',                                                            example:'condition:thirdenergy_type:Nuclear' },
      { name:'allenergy_type:<text>',     type:'text',     desc:'Checks all three energy slots. True if ANY of them match.',                                        example:'condition:allenergy_type:Frigid' },
    ]
  },
  // ── C3-1-D: Set Stats ─────────────────────────────────────────────────
  {
    cat: 'C3-1-D: Set & Era Stats',
    vars: [
      { name:'era_type:<text>',           type:'text',     desc:'Checks the era of the card (e.g. 200BME, 0ME). Match the era value set in data.js.',              example:'condition:era_type:200BME' },
      { name:'set_type:<text>',           type:'text',     desc:'Checks the set of the card: Old_History, MCS (Main Cast), HS (Hierarchy), GS (Global).',          example:'condition:set_type:HS' },
    ]
  },
  // ── C3-1-E: Card Type Stats ───────────────────────────────────────────
  {
    cat: 'C3-1-E: Card Type Stats',
    vars: [
      { name:'card_type:<text>',          type:'text',     desc:'Checks the card\'s type code: CH, DZ, CHS, CHSS, DZS, DZSS, DA, DAS, DASS, DR, LO, EV.',         example:'condition:card_type:CH' },
      { name:'event_type:<text>',         type:'text',     desc:'For EV cards: checks the event type — Lucid, Nightmare, Liminal, Recurring, Daydream, Fever.',    example:'condition:event_type:Lucid' },
      { name:'CurrentEvent:<text>',       type:'text',     desc:'Returns the event type of the currently active Event card on the field.',                          example:'condition:CurrentEvent:Nightmare' },
      { name:'CurrentEventCard:<text>',   type:'text',     desc:'Returns the name of the currently active Event card.',                                             example:'condition:CurrentEventCard:Blue Skies' },
    ]
  },
  // ── C3-1-F: Character Variables ───────────────────────────────────────
  {
    cat: 'C3-1-F: Character Variables',
    vars: [
      { name:'HaveCharacter:true/false',  type:'bool',     desc:'Checks if the parent character of this skill card is currently on the field (either side). Required for CHS/CHSS/DZS etc.', example:'condition:HaveCharacter:true' },
      { name:'card_name:<text>',          type:'text',     desc:'Checks if a card\'s name contains the given text (case-insensitive partial match).',              example:'condition:card_name:Sparrow' },
      { name:'card_title:<text>',         type:'text',     desc:'Checks if a card\'s title contains the given text.',                                               example:'condition:card_title:Dream Catcher' },
      { name:'non-vowel:<letter>',        type:'text',     desc:'Returns true if the given letter is not a vowel.',                                                 example:'condition:non-vowel:T' },
      { name:'vowel:<letter>',            type:'text',     desc:'Returns true if the given letter is a vowel.',                                                     example:'condition:vowel:A' },
      { name:'special_letter:<letter>',   type:'text',     desc:'Checks if the card has the specified letter as a special letter (marked with [] in name).',       example:'condition:special_letter:T' },
      { name:'merged_letter:<letter>',    type:'text',     desc:'Checks if the card has the specified letter as a merged letter (marked with <> in name).',        example:'condition:merged_letter:E' },
      { name:'word_count:<n>',            type:'numeric',  desc:'Returns/checks the number of words in the card\'s name.',                                          example:'condition:word_count:2' },
      { name:'letter_count:<n>',          type:'numeric',  desc:'Returns/checks the number of letters (no spaces) in the card\'s name.',                           example:'condition:letter_count:5' },
      { name:'HasWord:<words>,true/false,<n>', type:'text', desc:'Checks if the card name contains the specified word(s), separated by ;. n = number of instances to check.', example:'condition:HasWord:FIRE;ICE,true' },
      { name:'HasLetter:<letters>,true/false,<n>', type:'text', desc:'Checks if the card name contains the specified letter(s), separated by ;.',                  example:'condition:HasLetter:T;W,true' },
    ]
  },
  // ── C3-1-G: Game Mechanics ────────────────────────────────────────────
  {
    cat: 'C3-1-G: Game Mechanic Variables',
    vars: [
      { name:'draw:<n>',                  type:'action',   desc:'Draw n cards from the deck.',                                                                      example:'draw:2' },
      { name:'CanDraw:IsPlayer/IsEnemy,true/false', type:'bool', desc:'Enables or disables card drawing for one side.',                                             example:'CanDraw:IsPlayer,false' },
      { name:'discard:<n>',               type:'action',   desc:'Discard n cards from hand.',                                                                       example:'discard:1' },
      { name:'CanDiscard:IsPlayer/IsEnemy,true/false', type:'bool', desc:'Enables or disables discarding for one side.',                                            example:'CanDiscard:IsEnemy,false' },
      { name:'CanCardDiscard:true/false', type:'bool',     desc:'Prevents this specific card from being discarded when false.',                                     example:'CanCardDiscard:false' },
      { name:'shuffle',                   type:'action',   desc:'Shuffles the deck.',                                                                               example:'shuffle' },
      { name:'CanShuffle:IsPlayer/IsEnemy,true/false', type:'bool', desc:'Enables or disables deck shuffling for one side.',                                        example:'CanShuffle:IsPlayer,false' },
      { name:'CanCardShuffle:true/false', type:'bool',     desc:'When false, this card stays pinned at its deck position and is never shuffled.',                   example:'CanCardShuffle:false' },
      { name:'destroy',                   type:'action',   desc:'Sets a card\'s HP to 0 and sends it to the discard pile.',                                         example:'destroy@ref:TargetedCard' },
      { name:'CanDestroy:IsPlayer/IsEnemy,true/false', type:'bool', desc:'Enables or disables card destruction for one side.',                                      example:'CanDestroy:IsEnemy,false' },
      { name:'CanCardDestroy:true/false', type:'bool',     desc:'When false, this card cannot be destroyed (HP cannot reach 0 via damage).',                        example:'CanCardDestroy:false' },
      { name:'banished',                                    type:'action', desc:'Removes a card from the game entirely. Banished cards go to an invisible banished pile and never return to the hand or deck.',                                               example:'banished@ref:TargetedCard' },
      { name:'CanBanish:IsPlayer/IsEnemy,true/false',        type:'bool',   desc:'Enables or disables banishing for one side. When false, no cards on that side can be banished.',                                                                                example:'CanBanish:IsEnemy,false' },
      { name:'CanCardBanish:true/false',                     type:'bool',   desc:'Checks if this specific card can be banished. Defaults to true.',                                                                                                                example:'CanCardBanish:false' },
      { name:'revived:discarded/banished@ref',               type:'action', desc:'Revives a card from the discard or banished pile of the card effect\'s choice, returning it to hand.',                                                                          example:'revived:banished@ref:IsPlayer:InBanishedPile' },
      { name:'CanRevive:IsPlayer/IsEnemy,true/false',        type:'bool',   desc:'Enables or disables reviving for one side. When false, no cards on that side can be revived.',                                                                                  example:'CanRevive:IsPlayer,false' },
      { name:'CanCardRevive:true/false',                     type:'bool',   desc:'Checks if this specific card can be revived from discard or banished pile. Defaults to true.',                                                                                   example:'CanCardRevive:false' },
      { name:'CanTakeDamage:true/false',                     type:'bool',   desc:'Checks if this card can take any damage. When false, HP cannot be reduced and all incoming damage is zero. Defaults to true.',                                                   example:'CanTakeDamage:false' },
      { name:'CanHeal:IsPlayer/IsEnemy,true/false',          type:'bool',   desc:'Enables or disables healing for one side. When false, no cards on that side can have their HP restored.',                                                                       example:'CanHeal:IsPlayer,false' },
      { name:'CanCardHeal:true/false',                       type:'bool',   desc:'Checks if this specific card can have its HP restored by healing effects. Does not apply to max HP increases. Defaults to true.',                                               example:'CanCardHeal:false' },
      { name:'CanBeBuffed:true/false',    type:'bool',     desc:'When false, no buffs can be applied to this card.',                                                example:'CanBeBuffed:false' },
      { name:'CanBeDebuffed:true/false',  type:'bool',     desc:'When false, no debuffs can be applied to this card.',                                              example:'CanBeDebuffed:false' },
      { name:'remove:buff:<id>',          type:'action',   desc:'Removes a specific applied buff from the card.',                                                   example:'remove:buff:increase_atk' },
      { name:'remove:debuff:<id>',        type:'action',   desc:'Removes a specific applied debuff from the card.',                                                 example:'remove:debuff:poisoned' },
      { name:'HaveBuff:true/false[,applied:buff:<id>]', type:'bool', desc:'Checks if a card has any buff, or a specific applied buff.',                           example:'condition:HaveBuff:true,applied:buff:increase_atk' },
      { name:'HaveDebuff:true/false',     type:'bool',     desc:'Checks if a card has any debuff, or a specific applied debuff.',                                   example:'condition:HaveDebuff:true' },
      { name:'HaveSkill:true/false',      type:'bool',     desc:'Checks if a card has any card effect at all.',                                                     example:'condition:HaveSkill:true' },
      { name:'applied:buff:<id>',         type:'modifier', desc:'Applies a registered buff to the target card.',                                                    example:'applied:buff:increase_atk@ref:TargetedCard' },
      { name:'applied:debuff:<id>',       type:'modifier', desc:'Applies a registered debuff to the target card.',                                                  example:'applied:debuff:poisoned@ref:IsEnemy:OnField' },
      { name:'stored:buff:<id>',          type:'modifier', desc:'Marks in card data that this card\'s skill CONTAINS the buff (not that it has the buff active).', example:'condition:stored:buff:increase_atk@ref:next_card:played,applyall,1' },
      { name:'stored:debuff:<id>',        type:'modifier', desc:'Marks in card data that this card\'s skill CONTAINS the debuff.',                                  example:'condition:stored:debuff:poison@ref:next_card:played,applyall,1' },
      { name:'FieldRow:front/back',       type:'target',   desc:'Checks which row the card is in on the field. Front = rows closer to the enemy.',                 example:'condition:FieldRow:front' },
      { name:'FieldColumn:<1-5>',         type:'numeric',  desc:'Checks which column (1–5) the card occupies on the field.',                                        example:'condition:FieldColumn:3' },
    ]
  },
  // ── C3-1-H: In-Game Variables (igv) ──────────────────────────────────
  {
    cat: 'C3-1-H: In-Game Variables (igv)',
    vars: [
      { name:'igv:end_of_turn[:<n>,<applyall>]',   type:'igv', desc:'Fires at the end of a turn. n = which turn offset. applyall:true = fires for n consecutive turns.', example:'>>igv:end_of_turn:2,true' },
      { name:'igv:start_of_turn[:<n>,<applyall>]', type:'igv', desc:'Fires at the start of a turn. Lingering effects begin on the NEXT available start of turn.',  example:'>>igv:start_of_turn' },
      { name:'igv:when_played',       type:'igv', desc:'Fires the moment the card is played from hand.',                                   example:'>>igv:when_played' },
      { name:'igv:when_discarded',    type:'igv', desc:'Fires when the card is discarded.',                                                example:'>>igv:when_discarded' },
      { name:'igv:when_drawn',        type:'igv', desc:'Fires when the card is drawn from the deck.',                                      example:'>>igv:when_drawn' },
      { name:'igv:when_destroyed',    type:'igv', desc:'Fires when the card\'s HP reaches 0.',                                             example:'>>igv:when_destroyed' },
      { name:'igv:when_damaged',      type:'igv', desc:'Fires when the card takes any damage. Fires BEFORE destruction if damage is lethal.', example:'>>igv:when_damaged' },
      { name:'igv:when_buffed',       type:'igv', desc:'Fires when the card gains a buff.',                                                example:'>>igv:when_buffed' },
      { name:'igv:when_debuffed',     type:'igv', desc:'Fires when the card gains a debuff.',                                              example:'>>igv:when_debuffed' },
      { name:'igv:when_shuffled',     type:'igv', desc:'Fires when the card is shuffled into the deck.',                                   example:'>>igv:when_shuffled' },
      { name:'igv:when_healed',       type:'igv', desc:'Fires when the card\'s HP is restored (not from max HP increases).',               example:'>>igv:when_healed' },
      { name:'igv:when_returned',     type:'igv', desc:'Fires when the card is returned from the field to hand.',                          example:'>>igv:when_returned' },
      { name:'igv:when_banished',     type:'igv', desc:'Fires when the card is banished from the current game.',                           example:'>>igv:when_banished' },
      { name:'igv:when_revived:discarded/banished', type:'igv', desc:'Fires when the card is revived. Specify the source zone.',          example:'>>igv:when_revived:discarded' },
      { name:'igv:<igv1>;<igv2>',     type:'igv', desc:'Chain two igvs with ; to fire at both moments.',                                  example:'>>igv:start_of_turn;end_of_turn' },
    ]
  },
  // ── C2: Effect Syntax Operators ───────────────────────────────────────
  {
    cat: 'C2-A: Effect Syntax Operators',
    vars: [
      { name:':',    type:'modifier', desc:'Separates a variable from its value or action.', example:'draw:2 / HP:-5' },
      { name:'=',    type:'modifier', desc:'Sets a numeric value exactly.',                  example:'HP:=-5' },
      { name:'- / +',type:'modifier', desc:'Subtracts or adds a numeric value.',             example:'HP:-5 / ATK:+10' },
      { name:'< / >',type:'modifier', desc:'Less than / greater than comparison.',           example:'condition:HP<5' },
      { name:'<= / >=', type:'modifier', desc:'Less/greater than or equal to.',             example:'condition:HP<=5' },
      { name:'>>',   type:'modifier', desc:'"Then" — chains a condition to an effect, or an effect to an igv.', example:'condition:pair>>draw:2>>igv:when_played' },
      { name:';',    type:'modifier', desc:'"And" — joins multiple conditions or effects.',  example:'draw:2;HP:-5' },
      { name:'/',    type:'modifier', desc:'"Or" — alternative conditions or effects.',      example:'draw:2/draw:1;HP:-5' },
      { name:'~',    type:'modifier', desc:'"But" — first condition true AND second false.',  example:'condition:HP:=5~condition:DEF:=10>>draw:2' },
      { name:'!',    type:'modifier', desc:'"Not" / negation.',                              example:'condition:HP!5>>draw:2' },
      { name:'><',   type:'modifier', desc:'"Between" — value is between two numbers.',      example:'condition:HP><3,8' },
      { name:'*',    type:'modifier', desc:'"Repeat/Loop" — repeat the effect n times.',    example:'draw:2*3' },
      { name:'%',    type:'modifier', desc:'Percentage chance — effect only fires X% of the time.', example:'draw:2%50' },
      { name:'n)',   type:'modifier', desc:'Numbered effect line — for cards with multiple sequential effects.', example:'1) cet:one_time>>condition:pair>>draw:2>>igv:when_played' },
      { name:'@',    type:'modifier', desc:'Links a variable to a reference (e.g. baseATK).', example:'ATK:+50%@baseATK' },
      { name:'( )',  type:'modifier', desc:'Groups operations — resolved first, like in maths.', example:'HP:+50%@(Max:HP)' },
    ]
  },
  // ── C2-1: Conditions ──────────────────────────────────────────────────
  {
    cat: 'C2-1: Combo Conditions',
    vars: [
      { name:'condition:single',  type:'bool', desc:'True if this card has 0 default merged letters (no joined words).', example:'condition:single>>draw:1' },
      { name:'condition:pair',    type:'bool', desc:'True if this card has 1 merged letter by default.',                  example:'condition:pair>>draw:2' },
      { name:'condition:triple',  type:'bool', desc:'True if this card has 2 merged letters by default.',                 example:'condition:triple>>draw:3' },
      { name:'condition:multi',   type:'bool', desc:'True if this card has 3+ merged letters, OR was upgraded via combo.', example:'condition:multi>>HP:+20@ref:IsPlayer:OnField' },
    ]
  },
  // ── C2-4: CET Types ───────────────────────────────────────────────────
  {
    cat: 'C2-4: Card Effect Types (cet)',
    vars: [
      { name:'cet:one_time',   type:'modifier', desc:'Effect fires once then disappears. Will not fire again unless re-triggered.',                                  example:'cet:one_time>>draw:2>>igv:when_played' },
      { name:'cet:lingering',  type:'modifier', desc:'Effect loops forever on matching igv. Starts on the next available igv occurrence after activation.',          example:'cet:lingering>>draw:1>>igv:start_of_turn' },
      { name:'permanent>>',    type:'modifier', desc:'Buff/debuff prefix: lasts forever and does not expire.',                                                      example:'permanent>>HP:-5%@Max:HP>>stacks:3' },
      { name:'undispellable>>', type:'modifier', desc:'Buff/debuff prefix: cannot be removed by any remove:buff/remove:debuff effect.',                             example:'undispellable>>ATK:+10>>stacks:1' },
      { name:'>>stacks:<n>',   type:'numeric',  desc:'Max number of times this buff/debuff can be stacked on a single card. Default is 1.',                         example:'>>stacks:5' },
    ]
  },
];

/* ── Build the dev screen ─────────────────────── */
function openDevRef() {
  buildDevScreen();
  goTo('screen-dev');
}

let _devBuilt = false;
function buildDevScreen() {
  if (_devBuilt) return;
  _devBuilt = true;

  const tabBar = document.getElementById('dev-tabs');
  const body   = document.getElementById('dev-body');
  if (!tabBar || !body) return;

  const TYPE_LABELS = {
    numeric:  'Numeric',
    bool:     'True/False',
    text:     'Text',
    action:   'Action',
    target:   'Target',
    igv:      'IGV',
    modifier: 'Operator',
  };

  DEV_DATA.forEach((section, si) => {
    // Tab
    const tab = document.createElement('button');
    tab.className = 'dev-tab' + (si === 0 ? ' active' : '');
    tab.textContent = section.cat.split(':')[0].trim();
    tab.title = section.cat;
    tab.dataset.section = si;
    tab.onclick = () => {
      document.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.dev-section').forEach(s => {
        s.style.display = s.dataset.section == si ? '' : 'none';
      });
    };
    tabBar.appendChild(tab);

    // Section block
    const sec = document.createElement('div');
    sec.className = 'dev-section';
    sec.dataset.section = si;
    if (si !== 0) sec.style.display = 'none';

    const title = document.createElement('div');
    title.className = 'dev-section-title';
    title.textContent = section.cat;
    sec.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'dev-grid';

    section.vars.forEach(v => {
      const card = document.createElement('div');
      card.className = 'dev-var';
      card.dataset.search = (v.name + ' ' + v.desc + ' ' + (v.example||'')).toLowerCase();

      const typeEl = document.createElement('div');
      typeEl.className = `dev-var-type dev-type-${v.type}`;
      typeEl.textContent = TYPE_LABELS[v.type] || v.type;

      const nameEl = document.createElement('div');
      nameEl.className = 'dev-var-name';
      // Highlight placeholder tokens in <italic gold>
      nameEl.innerHTML = v.name.replace(/(<[^>]+>|\[[^\]]+\])/g,
        m => `<span class="dev-placeholder">${m}</span>`);

      const descEl = document.createElement('div');
      descEl.className = 'dev-var-desc';
      descEl.textContent = v.desc;

      card.appendChild(typeEl);
      card.appendChild(nameEl);
      card.appendChild(descEl);

      if (v.example) {
        const ex = document.createElement('div');
        ex.className = 'dev-var-example';
        ex.textContent = '→ ' + v.example;
        card.appendChild(ex);
      }

      grid.appendChild(card);
    });

    sec.appendChild(grid);
    body.appendChild(sec);
  });

  // No results message
  const noRes = document.createElement('div');
  noRes.className = 'dev-no-results';
  noRes.id = 'dev-no-results';
  noRes.style.display = 'none';
  noRes.textContent = 'No variables match your search.';
  body.appendChild(noRes);
}

function devFilter(query) {
  query = query.toLowerCase().trim();
  const sections = document.querySelectorAll('.dev-section');
  const tabs     = document.querySelectorAll('.dev-tab');
  let totalVisible = 0;

  if (!query) {
    // Reset to tab view
    sections.forEach((s, i) => {
      s.style.display = i === 0 ? '' : 'none';
      s.querySelectorAll('.dev-var').forEach(v => v.classList.remove('hidden'));
    });
    tabs.forEach((t, i) => { t.classList.toggle('active', i === 0); });
    document.getElementById('dev-no-results').style.display = 'none';
    return;
  }

  // When searching — show ALL sections
  sections.forEach(s => {
    s.style.display = '';
    let secVisible = 0;
    s.querySelectorAll('.dev-var').forEach(v => {
      const match = v.dataset.search.includes(query);
      v.classList.toggle('hidden', !match);
      if (match) { secVisible++; totalVisible++; }
    });
    // Hide empty sections
    s.style.display = secVisible ? '' : 'none';
  });

  tabs.forEach(t => t.classList.remove('active'));
  document.getElementById('dev-no-results').style.display = totalVisible ? 'none' : '';
}
