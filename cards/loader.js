/* ═══════════════════════════════════════════════════════════════
   cards/loader.js  —  NULL CORPS CARD DATA LOADER
   ─────────────────────────────────────────────────────────────
   Collects all card/portrait/buff/debuff/misc data from the
   cards/ folder structure and assembles the globals that
   game.js expects:

     CHARACTERS      []   — portrait + dialogue entries
     CARDS           []   — all card types (CH, CHS, DA, DZ…)
     BUFFS           []   — buff definitions
     DEBUFFS         []   — debuff definitions
     ENERGY_TYPES    {}   — loaded from miscellaneous/
     TERRITORY_DATA  {}   — loaded from miscellaneous/
     SKILL_PARENT_MAP{}   — loaded from miscellaneous/

   STRATEGY:
   ─────────────────────────────────────────────────────────────
   • On GitHub Pages  → uses the GitHub Contents API to list
     each folder automatically. Just drop a file in the right
     folder and push — nothing else needed.

   • Locally (file:// or localhost) → falls back to
     cards/manifest.js which you maintain manually.

   The loader runs BEFORE game.js. index.html loads:
     1. cards/manifest.js   (local fallback list)
     2. cards/loader.js     (this file — does all the work)
     3. game.js             (reads the assembled globals)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────── */
  const GITHUB_USER   = 'iridesuwa18';
  const GITHUB_REPO   = 'null-corps-game';
  const GITHUB_BRANCH = 'main';           // change if your default branch differs
  const CARDS_ROOT    = 'cards';          // folder name in repo root

  /* ── Card-type folders (the folders loader will scan) ────────── */
  const CARD_FOLDERS = [
    'char_cards',
    'charskill_cards',
    'charsubskill_cards',
    'dazed_cards',
    'dazedskill_cards',
    'dazedsubskill_cards',
    'dozer_cards',
    'dozerskill_cards',
    'dozersubskill_cards',
    'location_cards',
    'dreamscape_cards',
    'event_cards',
    'buffs',
    'debuffs',
    'portraits',
  ];

  /* Misc files are always loaded by exact name — no scanning needed */
  const MISC_FILES = [
    'miscellaneous/energy_types.js',
    'miscellaneous/territory_data.js',
    'miscellaneous/skill_parent_map.js',
  ];

  /* ── Staging area — each card file pushes into these ─────────── */
  window._NCG = {
    characters:     [],   // portraits/ files push here
    cards:          [],   // all card type folders push here
    buffs:          [],   // buffs/ files push here
    debuffs:        [],   // debuffs/ files push here
    energyTypes:    null, // miscellaneous/energy_types.js sets this
    territoryData:  null, // miscellaneous/territory_data.js sets this
    skillParentMap: null, // miscellaneous/skill_parent_map.js sets this
  };

  /* ── Detect environment ──────────────────────────────────────── */
  function _isGitHubPages() {
    const h = window.location.hostname;
    return h.endsWith('github.io') || h.endsWith('githubusercontent.com');
  }

  function _isLocal() {
    const h = window.location.hostname;
    return h === '' || h === 'localhost' || h === '127.0.0.1';
  }

  /* ── Load a single script by URL, returns a Promise ─────────── */
  function _loadScript(url) {
    return new Promise(function (resolve, reject) {
      const s   = document.createElement('script');
      s.src     = url;
      s.async   = false;
      s.onload  = resolve;
      s.onerror = function () {
        console.warn('[NCG Loader] Failed to load:', url);
        resolve(); // resolve anyway — one missing file shouldn't break everything
      };
      document.head.appendChild(s);
    });
  }

  /* ── Load an array of script URLs sequentially ───────────────── */
  async function _loadAll(urls) {
    for (const url of urls) {
      await _loadScript(url);
    }
  }

  /* ── GitHub API: list .js files in one folder ────────────────── */
  async function _ghListFolder(folder) {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${CARDS_ROOT}/${folder}?ref=${GITHUB_BRANCH}`;
    try {
      const res  = await fetch(apiUrl);
      if (!res.ok) {
        console.warn(`[NCG Loader] GitHub API error for ${folder}:`, res.status);
        return [];
      }
      const items = await res.json();
      return items
        .filter(item => item.type === 'file' && item.name.endsWith('.js'))
        .map(item => item.download_url);   // full raw URL
    } catch (e) {
      console.warn(`[NCG Loader] Could not reach GitHub API for ${folder}:`, e);
      return [];
    }
  }

  /* ── GitHub mode: scan all folders via API ───────────────────── */
  async function _collectFromGitHub() {
    console.log('[NCG Loader] GitHub Pages detected — reading folders via GitHub API');

    // Scan all card folders in parallel for speed
    const folderScans = await Promise.all(
      CARD_FOLDERS.map(folder => _ghListFolder(folder))
    );

    const cardUrls = folderScans.flat();

    // Misc files — build raw URLs directly (no need to scan)
    const repoRaw  = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
    const miscUrls = MISC_FILES.map(f => `${repoRaw}/${CARDS_ROOT}/${f}`);

    return { cardUrls, miscUrls };
  }

  /* ── Local mode: build URLs from manifest ────────────────────── */
  function _collectFromManifest() {
    console.log('[NCG Loader] Local mode — reading from cards/manifest.js');

    const manifest = window._NCG_MANIFEST || [];
    if (manifest.length === 0) {
      console.warn('[NCG Loader] manifest.js is empty — no cards will be loaded locally.');
    }

    // Work out the base path to the cards/ folder
    const base = _cardsBasePath();

    const cardUrls = manifest.map(f => `${base}${f}`);
    const miscUrls = MISC_FILES.map(f => `${base}${f}`);

    return { cardUrls, miscUrls };
  }

  /* ── Figure out where cards/ lives relative to index.html ───── */
  function _cardsBasePath() {
    // Get current page path, strip the filename, append cards/
    const path = window.location.pathname;
    const dir  = path.substring(0, path.lastIndexOf('/') + 1);
    return `${window.location.protocol}//${window.location.host}${dir}cards/`;
  }

  /* ── Assemble globals from staging area ──────────────────────── */
  function _assembleGlobals() {
    const ncg = window._NCG;

    window.CHARACTERS      = ncg.characters;
    window.CARDS           = ncg.cards;
    window.BUFFS           = ncg.buffs;
    window.DEBUFFS         = ncg.debuffs;
    window.ENERGY_TYPES    = ncg.energyTypes    || {};
    window.TERRITORY_DATA  = ncg.territoryData  || {};
    window.SKILL_PARENT_MAP= ncg.skillParentMap || {
      'CHS':  'CH',
      'CHSS': 'CH',
      'DZS':  'DZ',
      'DZSS': 'DZ',
      'DAS':  'DA',
      'DASS': 'DA',
    };

    console.log(
      `[NCG Loader] Assembled — ${CARDS.length} cards, ` +
      `${CHARACTERS.length} portraits, ` +
      `${BUFFS.length} buffs, ${DEBUFFS.length} debuffs`
    );
  }

  /* ── Main entry point ────────────────────────────────────────── */
  async function _init() {
    let cardUrls, miscUrls;

    if (_isGitHubPages()) {
      ({ cardUrls, miscUrls } = await _collectFromGitHub());
    } else {
      ({ cardUrls, miscUrls } = _collectFromManifest());
    }

    // Load misc (energy, territory, skill map) first — cards may reference them
    await _loadAll(miscUrls);

    // Then load all card/portrait/buff/debuff files
    await _loadAll(cardUrls);

    // Collapse staging area into the globals game.js expects
    _assembleGlobals();

    // Signal that data is ready — game.js checks for this
    window._NCG_READY = true;
    document.dispatchEvent(new CustomEvent('ncg:ready'));
  }

  /* ── Kick off immediately ────────────────────────────────────── */
  _init().catch(function (e) {
    console.error('[NCG Loader] Fatal error during load:', e);
    // Still assemble with whatever loaded so far
    _assembleGlobals();
    window._NCG_READY = true;
    document.dispatchEvent(new CustomEvent('ncg:ready'));
  });

})();
