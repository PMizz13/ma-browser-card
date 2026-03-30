/**
 * MA Browser Card  v2.0.0
 * A Plex-inspired Music Assistant browser card for Home Assistant
 *
 * Installation:
 *   1. Copy ma-browser-card.js to /config/www/ma-browser-card.js
 *   2. In HA go to Settings → Dashboards → Resources → Add
 *      URL: /local/ma-browser-card.js  Type: JavaScript Module
 *   3. Add the card to your dashboard (see README for full config)
 *
 * Minimal config:
 *   type: custom:ma-browser-card
 *   config_entry_id: YOUR_MA_CONFIG_ENTRY_ID
 *   ma_url: http://YOUR_MA_IP:8095
 *
  * Full config options:
 *   type: custom:ma-browser-card
 *   config_entry_id: 01JXXX...         # HA → Settings → Devices & Services → Music Assistant → Configure (check the URL)
 *   ma_url: http://192.168.1.x:8095    # Your Music Assistant server URL
 *   ma_token: eyJ...                   # MA Settings → Profile → Access Tokens (optional but enables Recently Played)
 *   height: 580                         # Card height in px (default: 580)
 *   theme: dark                         # Theme: dark (default), light, or auto (follows HA theme)
 *   players:                            # Optional: limit to specific MA player entities
 *     - media_player.my_speaker
 *     - media_player.kitchen
 */

const CSS = `
  :host { display: block; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .card {
    /* ── Dark theme (default) ── */
    --gold: #e5a00d;
    --gold-bg: rgba(229,160,13,0.13);
    --gold-border: rgba(229,160,13,0.25);
    --bg0: #111113;
    --bg2: #222228;
    --bg3: #2e2e38;
    --bg-sidebar: #0d0d10;
    --bg-player: #09090e;
    --t1: #f0f0f5;
    --t2: #9898aa;
    --t3: #55555f;
    --border: rgba(255,255,255,0.07);
    --sidebar: 195px;
    font-family: 'Outfit', 'Segoe UI', system-ui, sans-serif;
    display: flex;
    border-radius: 14px;
    overflow: hidden;
    background: var(--bg0);
    color: var(--t1);
    font-size: 13px;
    height: var(--card-height, 580px);
    position: relative;
  }

  /* ── Light theme ── */
  .card.theme-light {
    --gold: var(--primary-color, #e5a00d);
    --gold-bg: color-mix(in srgb, var(--primary-color, #e5a00d) 12%, transparent);
    --gold-border: color-mix(in srgb, var(--primary-color, #e5a00d) 30%, transparent);
    --bg0: #f5f5f7;
    --bg2: #ffffff;
    --bg3: #e8e8ee;
    --t1: #111113;
    --t2: #55555f;
    --t3: #9898aa;
    --border: rgba(0,0,0,0.08);
  }
  .card.theme-light {
    --bg-sidebar: #ebebef;
    --bg-player: #e0e0e6;
  }
  .card.theme-light .logo { border-bottom-color: rgba(0,0,0,0.08); }
  .card.theme-light .nav-btn.active { background: var(--gold-bg); }
  .card.theme-light .ctx-menu { background: #ffffff; }
  .card.theme-light .queue-panel { background: #f0f0f4; }

  /* ── Auto theme (follows HA theme) ── */
  .card.theme-auto {
    --gold: var(--primary-color, #e5a00d);
    --gold-bg: color-mix(in srgb, var(--primary-color, #e5a00d) 12%, transparent);
    --gold-border: color-mix(in srgb, var(--primary-color, #e5a00d) 30%, transparent);
    --bg0: var(--primary-background-color, #111113);
    --bg2: var(--card-background-color, #222228);
    --bg3: var(--secondary-background-color, #2e2e38);
    --t1: var(--primary-text-color, #f0f0f5);
    --t2: var(--secondary-text-color, #9898aa);
    --t3: var(--disabled-text-color, #55555f);
    --border: var(--divider-color, rgba(255,255,255,0.07));
  }
  .card.theme-auto {
    --bg-sidebar: var(--sidebar-background-color, var(--primary-background-color, #0d0d10));
    --bg-player: var(--sidebar-background-color, var(--primary-background-color, #09090e));
  }
  .card.theme-auto .ctx-menu { background: var(--card-background-color, #1a1a22); }


  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar); background: var(--bg-sidebar);
    display: flex; flex-direction: column; flex-shrink: 0;
    border-right: 1px solid var(--border);
  }
  .logo {
    display: flex; align-items: center; gap: 9px;
    padding: 15px 13px 13px; border-bottom: 1px solid var(--border);
  }
  .logo-icon {
    width: 30px; height: 30px; background: var(--gold);
    border-radius: 8px; display: flex; align-items: center;
    justify-content: center; font-size: 13px; color: #111; flex-shrink: 0;
  }
  .logo-name { font-size: 14px; font-weight: 600; color: var(--t1); letter-spacing: -0.2px; }
  .logo-sub  { font-size: 10px; color: var(--t3); }
  .nav { padding: 10px 8px; flex: 1; overflow-y: auto; }
  .nav-label {
    font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--t3); padding: 8px 8px 4px; font-weight: 500;
  }
  .nav-btn {
    display: flex; align-items: center; gap: 9px; padding: 8px;
    border-radius: 7px; cursor: pointer; color: var(--t2); font-size: 12.5px;
    transition: all 0.14s; margin-bottom: 1px; border: 1px solid transparent;
    background: none; width: 100%; text-align: left; font-family: inherit;
  }
  .nav-btn:hover { background: var(--bg2); color: var(--t1); }
  .nav-btn.active { background: var(--gold-bg); color: var(--gold); border-color: var(--gold-border); font-weight: 500; }
  .nav-ico { width: 16px; text-align: center; font-size: 14px; flex-shrink: 0; }

  /* ── PLAYER BAR ── */
  .player-bar { padding: 11px; border-top: 1px solid var(--border); background: var(--bg-player); }
  .np-row { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; cursor: pointer; }
  .np-art {
    width: 38px; height: 38px; border-radius: 6px; background: var(--bg3);
    flex-shrink: 0; overflow: hidden; display: flex; align-items: center;
    justify-content: center; font-size: 18px; transition: opacity 0.14s;
  }
  .np-art:hover { opacity: 0.8; }
  .np-art img { width: 100%; height: 100%; object-fit: cover; }
  .np-info { flex: 1; min-width: 0; }
  .np-title  { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .np-artist { font-size: 11px; color: var(--t3); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .controls { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px; }
  .ctrl-btn {
    background: none; border: none; color: var(--t2); cursor: pointer;
    font-size: 15px; padding: 2px; line-height: 1; transition: color 0.12s;
  }
  .ctrl-btn:hover { color: var(--t1); }
  .ctrl-btn.active { color: var(--gold); }
  .ctrl-play {
    width: 30px; height: 30px; background: var(--gold); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #111; font-size: 12px; border: none; cursor: pointer; transition: transform 0.1s;
  }
  .ctrl-play:hover { transform: scale(1.08); }
  .progress-bar { height: 3px; background: var(--bg3); border-radius: 2px; margin-bottom: 10px; cursor: pointer; }
  .progress-fill { height: 100%; background: var(--gold); border-radius: 2px; width: 0; transition: width 1s linear; }
  .ps-label { font-size: 10px; color: var(--t3); margin-bottom: 4px; }
  .player-sel {
    width: 100%; background: var(--bg2); border: 1px solid var(--border);
    color: var(--t1); font-size: 11px; padding: 5px 7px; border-radius: 6px;
    outline: none; cursor: pointer; font-family: inherit;
  }
  .player-sel:focus { border-color: var(--gold); }
  .vol-row { display: flex; align-items: center; gap: 7px; margin-top: 8px; }
  .vol-icon { font-size: 12px; color: var(--t3); flex-shrink: 0; cursor: pointer; }
  .vol-slider {
    flex: 1; -webkit-appearance: none; appearance: none;
    height: 3px; border-radius: 2px; outline: none; cursor: pointer;
    background: linear-gradient(to right, var(--gold) 0%, var(--gold) var(--vol-pct, 50%), var(--bg3) var(--vol-pct, 50%), var(--bg3) 100%);
  }
  .vol-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 13px; height: 13px;
    border-radius: 50%; background: var(--gold); cursor: pointer;
  }
  .vol-slider::-moz-range-thumb {
    width: 13px; height: 13px; border: none;
    border-radius: 50%; background: var(--gold); cursor: pointer;
  }

  /* ── MAIN ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .topbar {
    display: flex; align-items: center; gap: 9px;
    padding: 10px 13px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .search-wrap {
    flex: 1; display: flex; align-items: center; background: var(--bg2);
    border: 1px solid var(--border); border-radius: 20px; padding: 6px 11px;
    gap: 7px; transition: border-color 0.14s;
  }
  .search-wrap:focus-within { border-color: var(--gold-border); }
  .search-inp {
    background: none; border: none; color: var(--t1); font-size: 12.5px;
    outline: none; flex: 1; font-family: inherit;
  }
  .search-inp::placeholder { color: var(--t3); }
  .search-clear {
    background: none; border: none; color: var(--t3); cursor: pointer;
    font-size: 14px; line-height: 1; padding: 0; display: none;
  }
  .search-clear.visible { display: block; }
  .scroll { flex: 1; overflow-y: auto; padding: 13px; scrollbar-width: thin; scrollbar-color: var(--bg3) transparent; }
  .scroll::-webkit-scrollbar { width: 4px; }
  .scroll::-webkit-scrollbar-thumb { background: var(--bg3); border-radius: 2px; }

  /* ── SECTIONS ── */
  .section { margin-bottom: 22px; }
  .sec-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 11px; flex-wrap: wrap; }
  .sec-title { font-size: 13px; font-weight: 600; color: var(--t1); }
  .sec-count {
    font-size: 10px; color: var(--t3); background: var(--bg2);
    padding: 2px 7px; border-radius: 10px; border: 1px solid var(--border);
  }
  .sec-actions { display: flex; gap: 5px; margin-left: auto; }
  .sec-btn {
    background: var(--bg2); border: 1px solid var(--border); color: var(--t2);
    font-size: 10px; padding: 3px 9px; border-radius: 10px; cursor: pointer;
    font-family: inherit; transition: all 0.12s; white-space: nowrap;
  }
  .sec-btn:hover { background: var(--gold-bg); border-color: var(--gold-border); color: var(--gold); }

  /* ── ALBUM / RADIO GRID ── */
  .album-grid, .radio-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 11px;
  }
  .album-card { cursor: pointer; position: relative; }
  .album-card.now-playing .a-art-wrap {
    border-color: var(--gold);
    box-shadow: 0 0 0 1px var(--gold);
  }
  .a-art-wrap {
    width: 100%; aspect-ratio: 1; border-radius: 8px; background: var(--bg2);
    margin-bottom: 6px; position: relative; overflow: hidden;
    border: 1px solid var(--border); transition: transform 0.14s, border-color 0.14s;
    display: flex; align-items: center; justify-content: center;
  }
  .album-card:hover .a-art-wrap { transform: translateY(-2px); }
  .a-art-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; position: absolute; inset: 0; }
  .a-placeholder { font-size: 28px; color: var(--t3); }
  .a-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.52);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.14s; z-index: 2;
  }
  .album-card:hover .a-overlay { opacity: 1; }
  .play-circle {
    width: 36px; height: 36px; background: var(--gold); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #111; font-size: 13px; transform: scale(0.85); transition: transform 0.14s;
  }
  .album-card:hover .play-circle { transform: scale(1); }
  .playing-badge {
    position: absolute; bottom: 5px; left: 5px; z-index: 3;
    background: var(--gold); border-radius: 4px; padding: 2px 5px;
    font-size: 9px; color: #111; font-weight: 600; display: none;
  }
  .album-card.now-playing .playing-badge { display: block; }
  .a-name   { font-size: 11.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--t1); }
  .a-artist { font-size: 10.5px; color: var(--t3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
  .a-year   { font-size: 10px; color: var(--t3); opacity: 0.7; }

  /* ── ARTIST GRID ── */
  .artist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 13px; }
  .artist-card { cursor: pointer; text-align: center; }
  .ar-img {
    width: 76px; height: 76px; border-radius: 50%; background: var(--bg2);
    margin: 0 auto 7px; overflow: hidden; border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; color: var(--t3); transition: border-color 0.14s, transform 0.14s;
  }
  .artist-card:hover .ar-img { border-color: var(--gold); transform: scale(1.04); }
  .ar-img img { width: 100%; height: 100%; object-fit: cover; }
  .ar-name { font-size: 11.5px; font-weight: 500; }

  /* ── TRACK LIST ── */
  .track-row {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 8px; border-radius: 7px; cursor: pointer; transition: background 0.1s;
  }
  .track-row:hover { background: var(--bg2); }
  .track-row.playing { background: var(--gold-bg); }
  .tr-num { width: 18px; font-size: 11px; color: var(--t3); text-align: center; flex-shrink: 0; }
  .track-row.playing .tr-num { color: var(--gold); }
  .tr-art {
    width: 32px; height: 32px; border-radius: 4px; background: var(--bg3);
    flex-shrink: 0; overflow: hidden; display: flex; align-items: center;
    justify-content: center; font-size: 15px;
  }
  .tr-art img { width: 100%; height: 100%; object-fit: cover; }
  .tr-info { flex: 1; min-width: 0; }
  .tr-name { font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .track-row.playing .tr-name { color: var(--gold); font-weight: 500; }
  .tr-meta { font-size: 11px; color: var(--t3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tr-dur  { font-size: 11px; color: var(--t3); flex-shrink: 0; }

  /* ── CONTEXT MENU ── */
  .ctx-menu {
    position: fixed; background: var(--bg2); border: 1px solid var(--border);
    border-radius: 9px; padding: 5px; z-index: 999; min-width: 160px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }
  .ctx-item {
    display: flex; align-items: center; gap: 9px; padding: 8px 11px;
    border-radius: 6px; cursor: pointer; font-size: 12.5px; color: var(--t1);
    transition: background 0.1s;
  }
  .ctx-item:hover { background: var(--bg3); }
  .ctx-ico { font-size: 14px; width: 18px; text-align: center; }

  /* ── QUEUE PANEL ── */
  .queue-panel {
    position: absolute; inset: 0; background: var(--bg-sidebar);
    display: flex; flex-direction: column; z-index: 10;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
  .queue-header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .queue-art {
    width: 48px; height: 48px; border-radius: 7px; background: var(--bg3);
    overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 22px;
  }
  .queue-art img { width: 100%; height: 100%; object-fit: cover; }
  .queue-title-wrap { flex: 1; min-width: 0; }
  .queue-title { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .queue-subtitle { font-size: 11px; color: var(--t3); margin-top: 2px; }
  .queue-close {
    background: none; border: none; color: var(--t2); font-size: 18px;
    cursor: pointer; padding: 4px; flex-shrink: 0;
  }
  .queue-close:hover { color: var(--t1); }
  .queue-scroll { flex: 1; overflow-y: auto; padding: 8px; scrollbar-width: thin; scrollbar-color: var(--bg3) transparent; }
  .queue-item {
    display: flex; align-items: center; gap: 9px; padding: 7px 8px;
    border-radius: 7px; cursor: pointer; transition: background 0.1s;
  }
  .queue-item:hover { background: var(--bg2); }
  .queue-item.active { background: var(--gold-bg); }
  .queue-item.active .qi-name { color: var(--gold); font-weight: 500; }
  .queue-item.past { opacity: 0.45; }
  .qi-num { width: 20px; font-size: 11px; color: var(--t3); text-align: center; flex-shrink: 0; }
  .queue-item.active .qi-num { color: var(--gold); }
  .qi-art {
    width: 30px; height: 30px; border-radius: 4px; background: var(--bg3);
    flex-shrink: 0; overflow: hidden; display: flex; align-items: center;
    justify-content: center; font-size: 13px;
  }
  .qi-art img { width: 100%; height: 100%; object-fit: cover; }
  .qi-info { flex: 1; min-width: 0; }
  .qi-name { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qi-artist { font-size: 10.5px; color: var(--t3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qi-dur { font-size: 11px; color: var(--t3); flex-shrink: 0; }

  /* ── ARTIST DETAIL ── */
  .artist-hdr {
    display: flex; gap: 13px; margin-bottom: 16px; align-items: flex-start;
  }
  .artist-hero {
    width: 90px; height: 90px; border-radius: 50%; background: var(--bg2);
    flex-shrink: 0; overflow: hidden; border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center; font-size: 36px;
  }
  .artist-hero img { width: 100%; height: 100%; object-fit: cover; }
  .artist-detail-name { font-size: 17px; font-weight: 600; margin-bottom: 6px; }
  .artist-detail-back {
    background: var(--bg2); color: var(--t1); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 20px; font-size: 12px;
    cursor: pointer; font-family: inherit; transition: background 0.13s;
  }
  .artist-detail-back:hover { background: var(--bg3); }

  /* ── SKELETON ── */
  .skeleton-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 11px;
  }
  .skel-card { }
  .skel-art {
    width: 100%; aspect-ratio: 1; border-radius: 8px;
    background: var(--bg2); margin-bottom: 6px;
    animation: shimmer 1.4s ease infinite;
  }
  .skel-line {
    height: 10px; border-radius: 5px; background: var(--bg2); margin-bottom: 5px;
    animation: shimmer 1.4s ease infinite;
  }
  .skel-line.short { width: 60%; }
  @keyframes shimmer {
    0%, 100% { opacity: 0.5; } 50% { opacity: 1; }
  }

  /* ── GLOBAL SEARCH RESULTS ── */
  .search-results { }

  /* ── STATE ── */
  .state-box {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 180px; gap: 10px; color: var(--t3); text-align: center; padding: 0 20px;
  }
  .spinner {
    width: 22px; height: 22px; border: 2px solid var(--bg3);
    border-top-color: var(--gold); border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .err-txt { font-size: 12px; line-height: 1.6; color: var(--t2); }
  .retry-btn {
    background: var(--gold-bg); color: var(--gold); border: 1px solid var(--gold-border);
    padding: 7px 16px; border-radius: 20px; font-size: 12px; font-weight: 500;
    cursor: pointer; font-family: inherit; margin-top: 4px;
  }
  .retry-btn:hover { background: var(--gold); color: #111; }
`;

class MABrowserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._maUrl = '';
    this._view = 'home';
    this._players = [];
    this._selectedPlayer = null;
    this._pollTimer = null;
    this._searchTimer = null;
    this._built = false;
    this._imgCache = {};
    this._imgObserver = null;
    this._libCache = {};
    this._libCacheTTL = 300000;
    this._lastNpKey = '';
    this._nowPlayingUri = '';
    this._queueVisible = false;
    this._ctxMenu = null;
    this._ws = null;
    this._wsReady = false;
    this._wsMsgId = 100;
    this._wsPending = {};   // msgId -> {resolve, reject}
    this._maQueueState = null;   // latest queue state from MA WS
    this._progressTimer = null;  // smooth progress animation
  }

  setConfig(config) {
    if (!config.config_entry_id) {
      throw new Error(
        'ma-browser-card: config_entry_id is required.\n' +
        'Find it in HA → Settings → Devices & Services → Music Assistant → Configure.\n' +
        'The URL contains it: ...?config_entry=01JXXX...'
      );
    }
    if (!config.ma_url) {
      throw new Error(
        'ma-browser-card: ma_url is required.\n' +
        'Set it to your Music Assistant URL, e.g. http://192.168.1.x:8095'
      );
    }
    this._config = config;
    this._maUrl = config.ma_url.replace(/\/$/, '');
    this._maToken = config.ma_token || '';
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._build();
      this._built = true;
      this._init();
    } else if (this._players.length === 0) {
      this._loadPlayers();
    }
  }

  // ── BUILD ─────────────────────────────────────────────────────
  _build() {
    const height = this._config.height || 580;
    if (this._config.columns) this.style.gridColumn = `span ${this._config.columns}`;
    const theme = this._config.theme || 'dark';
    const themeClass = theme === 'light' ? 'theme-light' : theme === 'auto' ? 'theme-auto' : '';

    this.shadowRoot.innerHTML = `<style>${CSS}</style>
    <div class="card ${themeClass}" style="--card-height:${height}px">
      <div class="sidebar">
        <div class="logo">
          <div class="logo-icon">▶︎</div>
          <div><div class="logo-name">Music</div><div class="logo-sub">Music Assistant</div></div>
        </div>
        <nav class="nav">
          <div class="nav-label">Library</div>
          <button class="nav-btn active" data-view="home"><span class="nav-ico">⌂︎</span>Home</button>
          <button class="nav-btn" data-view="radio"><span class="nav-ico">∿︎</span>Radio</button>
          <button class="nav-btn" data-view="albums"><span class="nav-ico">◉︎</span>Albums</button>
          <button class="nav-btn" data-view="artists"><span class="nav-ico">♪︎</span>Artists</button>
          <button class="nav-btn" data-view="tracks"><span class="nav-ico">♫︎</span>Tracks</button>
          <button class="nav-btn" data-view="playlists"><span class="nav-ico">☰︎</span>Playlists</button>
        </nav>
        <div class="player-bar">
          <div class="np-row" id="npRow">
            <div class="np-art" id="npArt">♪︎</div>
            <div class="np-info">
              <div class="np-title" id="npTitle">Nothing playing</div>
              <div class="np-artist" id="npArtist">—</div>
            </div>
          </div>
          <div class="controls">
            <button class="ctrl-btn" id="btnShuffle" title="Shuffle">⇄︎</button>
            <button class="ctrl-btn" id="btnPrev">⏮︎</button>
            <button class="ctrl-play" id="btnPlay">▶︎</button>
            <button class="ctrl-btn" id="btnNext">⏭︎</button>
            <button class="ctrl-btn" id="btnRepeat" title="Repeat">↺︎</button>
          </div>
          <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
          <div class="ps-label">Playing on</div>
          <select class="player-sel" id="playerSel"><option value="">Loading…</option></select>
          <div class="vol-row">
            <span class="vol-icon" id="volIcon">🔈</span>
            <input class="vol-slider" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%" />
          </div>
        </div>
      </div>
      <div class="main">
        <div class="topbar">
          <div class="search-wrap">
            <span style="font-size:14px;color:var(--t3)">⌕︎</span>
            <input class="search-inp" id="searchInp" type="text" placeholder="Search everything…" />
            <button class="search-clear" id="searchClear">✕︎</button>
          </div>
        </div>
        <div class="scroll" id="scroll">
          <div class="state-box"><div class="spinner"></div><span>Connecting…</span></div>
        </div>
      </div>
    </div>`;

    // Nav
    this.shadowRoot.querySelectorAll('.nav-btn').forEach(btn =>
      btn.addEventListener('click', () => this._nav(btn.dataset.view, btn))
    );

    // Search - global, works on any view
    const searchEl = this.shadowRoot.getElementById('searchInp');
    const clearBtn = this.shadowRoot.getElementById('searchClear');
    const searchHandler = () => {
      const q = searchEl.value;
      clearBtn.classList.toggle('visible', q.length > 0);
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        if (q.trim()) {
          this._renderGlobalSearch(q.trim());
        } else {
          this._renderView(this._view);
        }
      }, 400);
    };
    searchEl.addEventListener('input', searchHandler);
    searchEl.addEventListener('keyup', searchHandler);
    searchEl.addEventListener('keydown', e => e.stopPropagation());
    clearBtn.addEventListener('click', () => {
      searchEl.value = '';
      clearBtn.classList.remove('visible');
      this._renderView(this._view);
    });

    // Player controls
    this.shadowRoot.getElementById('playerSel').addEventListener('change', e => {
      this._selectedPlayer = e.target.value || null;
      this._lastNpKey = '';
      this._updateNowPlaying();
    });
    this.shadowRoot.getElementById('btnPlay').addEventListener('click', () => this._togglePlay());
    this.shadowRoot.getElementById('btnPrev').addEventListener('click', () => this._playerCmd('previous'));
    this.shadowRoot.getElementById('btnNext').addEventListener('click', () => this._playerCmd('next'));
    this.shadowRoot.getElementById('btnShuffle').addEventListener('click', () => this._toggleShuffle());
    this.shadowRoot.getElementById('btnRepeat').addEventListener('click', () => this._toggleRepeat());
    this.shadowRoot.getElementById('npRow').addEventListener('click', () => this._toggleQueue());

    // Volume
    const volEl = this.shadowRoot.getElementById('volSlider');
    volEl.addEventListener('input', e => {
      const pct = e.target.value;
      volEl.style.setProperty('--vol-pct', pct + '%');
      const v = pct / 100;
      this.shadowRoot.getElementById('volIcon').textContent = v === 0 ? '🔇' : v < 0.3 ? '🔈' : v < 0.7 ? '🔉' : '🔊';
      this._setVolume(v);
    });
    this.shadowRoot.getElementById('volIcon').addEventListener('click', () => this._toggleMute());

    // Click scroll area - delegated
    this._attachClickHandler();

    // Dismiss context menu on outside click
    document.addEventListener('click', () => this._dismissCtx());
    this.shadowRoot.addEventListener('click', (e) => {
      if (this._ctxMenu && !this._ctxMenu.contains(e.target)) this._dismissCtx();
    });
  }

  async _init() {
    try {
      this._loadPlayers();
      this._connectMA();
      // Render home immediately - recently played will wait for WS internally
      await this._renderHome();
      this._startPoll();
      setTimeout(() => { if (this._players.length === 0) this._loadPlayers(); }, 3000);
      // If recently played was empty (WS not ready yet), re-render home after WS connects
      setTimeout(async () => {
        if (this._wsReady && this._view === 'home') {
          await this._renderHome();
        }
      }, 4000);
    } catch(e) { this._err(e); }
  }

  // ── UTILS ─────────────────────────────────────────────────────
  _$ = id => this.shadowRoot.getElementById(id);
  _scroll = () => this._$('scroll');

  _skeleton(count = 8) {
    const cards = Array.from({length: count}, () =>
      `<div class="skel-card"><div class="skel-art"></div><div class="skel-line"></div><div class="skel-line short"></div></div>`
    ).join('');
    return `<div class="section"><div class="skeleton-grid">${cards}</div></div>`;
  }

  _loading() {
    if (this._imgObserver) this._imgObserver.disconnect();
    this._scroll().innerHTML = this._skeleton();
  }

  _err(e, retryFn) {
    const msg = e?.message || String(e);
    const retryHtml = retryFn ? `<button class="retry-btn" id="retryBtn">Try again</button>` : '';
    this._scroll().innerHTML = `<div class="state-box"><div>⚠</div><div class="err-txt">${msg}</div>${retryHtml}</div>`;
    if (retryFn) {
      const btn = this._scroll().querySelector('#retryBtn');
      if (btn) btn.addEventListener('click', retryFn);
    }
  }

  _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  _fmtDur(sec) {
    if (!sec) return '';
    return `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
  }
  _artUrl(item) {
    if (!item) return null;
    return item.image || item.image_url || item.album?.image || item.album?.image_url || null;
  }
  _artistName(item) {
    return item?.artists?.length ? item.artists.map(a => a.name).join(', ') : '';
  }

  // ── IMAGE LOADING ─────────────────────────────────────────────
  async _loadImgInto(url, el, ph) {
    if (!url) { el.innerHTML = ph; return; }
    if (this._imgCache[url]) {
      if (el.isConnected) el.innerHTML = `<img src="${this._imgCache[url]}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
      return;
    }
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(resp.status);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      this._imgCache[url] = blobUrl;
      if (el.isConnected) el.innerHTML = `<img src="${blobUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
    } catch {
      if (el.isConnected) {
        const img = document.createElement('img');
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;';
        img.onerror = () => { if (el.isConnected) el.innerHTML = ph; };
        img.src = url;
        el.innerHTML = '';
        el.appendChild(img);
      }
    }
  }

  _hydrateImages() {
    const els = this._scroll().querySelectorAll('[data-img]');
    if (!els.length) return;
    if (!this._imgObserver) {
      this._imgObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          this._imgObserver.unobserve(el);
          const url = el.dataset.img;
          const ph = el.dataset.placeholder || '💿';
          delete el.dataset.img;
          this._loadImgInto(url, el, ph);
        });
      }, { root: this._scroll(), rootMargin: '100px' });
    }
    els.forEach(el => this._imgObserver.observe(el));
  }

  // ── HA API ────────────────────────────────────────────────────
  async _callService(service, data) {
    return this._hass.connection.sendMessagePromise({
      type: 'call_service', domain: 'music_assistant', service,
      service_data: { config_entry_id: this._config.config_entry_id, ...data },
      return_response: true,
    });
  }

  // Always fetches fresh from MA — use for time-sensitive data like last_played
  async _fetchLibrary(mediaType, orderBy, limit, favoritesOnly = false) {
    const data = { media_type: mediaType, order_by: orderBy, limit };
    if (favoritesOnly) data.favorite = true;
    const res = await this._callService('get_library', data);
    if (!res) return [];
    const r = res.response ?? res;
    return r.items ?? (Array.isArray(r) ? r : []);
  }

  async _getLibrary(mediaType, orderBy = 'sort_name', limit = 500, favoritesOnly = false) {
    const key = `${mediaType}:${orderBy}:${limit}:${favoritesOnly}`;
    const cached = this._libCache[key];
    if (cached && (Date.now() - cached.ts < this._libCacheTTL)) return cached.items;
    const data = { media_type: mediaType, order_by: orderBy, limit };
    if (favoritesOnly) data.favorite = true;
    const res = await this._callService('get_library', data);
    if (!res) return [];
    const r = res.response ?? res;
    const items = r.items ?? (Array.isArray(r) ? r : []);
    this._libCache[key] = { items, ts: Date.now() };
    return items;
  }

  async _search(query) {
    const res = await this._callService('search', { name: query, media_type: ['album','artist','track','radio','playlist'], limit: 20 });
    return res?.response ?? res ?? {};
  }

  async _getQueue() {
    if (!this._selectedPlayer) return null;
    try {
      // get_queue does NOT accept config_entry_id — call directly
      const res = await this._hass.connection.sendMessagePromise({
        type: 'call_service',
        domain: 'music_assistant',
        service: 'get_queue',
        service_data: { queue_id: this._selectedPlayer },
        return_response: true,
      });
      return res?.response ?? res ?? null;
    } catch(e) {
      console.warn('[MA Card] get_queue error:', e);
      return null;
    }
  }

  async _playMedia(uri, mediaType, enqueue = 'play') {
    if (!this._selectedPlayer) { alert('Select a player first'); return; }
    const isShuffle = enqueue === 'shuffle';
    if (isShuffle) {
      // Enable shuffle then play
      await this._hass.callService('media_player', 'shuffle_set', {
        entity_id: this._selectedPlayer, shuffle: true,
      });
    }
    await this._hass.callService('music_assistant', 'play_media', {
      entity_id: this._selectedPlayer,
      media_id: uri,
      media_type: mediaType || 'album',
      enqueue: isShuffle ? 'play' : enqueue,
    });
    this._lastNpKey = '';
  }

  // ── MA WEBSOCKET ──────────────────────────────────────────────
  _connectMA() {
    if (!this._maToken || !this._maUrl) return;
    if (this._ws) { this._ws.close(); this._ws = null; }
    const wsUrl = this._maUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';
    const ws = new WebSocket(wsUrl);
    this._ws = ws;
    this._wsReady = false;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.server_version && !msg.message_id) {
        ws.send(JSON.stringify({ message_id: 'auth', command: 'auth', args: { token: this._maToken } }));
        return;
      }
      if (msg.message_id === 'auth') {
        if (msg.result?.authenticated) { this._wsReady = true; console.log('[MA Card] WS authenticated'); }
        else console.warn('[MA Card] WS auth failed');
        return;
      }
      const pending = this._wsPending[msg.message_id];
      if (pending) {
        delete this._wsPending[msg.message_id];
        if (msg.error_code) pending.reject(new Error(msg.details || 'MA error ' + msg.error_code));
        else pending.resolve(msg.result);
      }
    };
    ws.onerror = () => { this._wsReady = false; };
    ws.onclose = () => {
      this._wsReady = false;
      setTimeout(() => { if (this._maToken) this._connectMA(); }, 10000);
    };
  }

  _wsSend(command, args = {}) {
    return new Promise((resolve, reject) => {
      if (!this._ws || !this._wsReady) { reject(new Error('MA WS not ready')); return; }
      const id = String(++this._wsMsgId);
      this._wsPending[id] = { resolve, reject };
      this._ws.send(JSON.stringify({ message_id: id, command, args }));
      setTimeout(() => {
        if (this._wsPending[id]) { delete this._wsPending[id]; reject(new Error('MA WS timeout')); }
      }, 10000);
    });
  }

  async _fetchRecentlyPlayed(limit = 20) {
    // If WS not ready yet, wait up to 5s for auth to complete
    if (!this._wsReady && this._ws) {
      await new Promise(resolve => {
        const check = setInterval(() => {
          if (this._wsReady) { clearInterval(check); resolve(); }
        }, 200);
        setTimeout(() => { clearInterval(check); resolve(); }, 5000);
      });
    }
    if (!this._wsReady) return [];  // WS not available, skip silently
    try {
      const items = await this._wsSend('music/recently_played_items', { limit, media_types: ['album'] });
      const seen = new Set();
      return (Array.isArray(items) ? items : []).filter(item => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
      });
    } catch(e) {
      console.warn('[MA Card] recently_played failed:', e.message);
      return [];
    }
  }

  // ── PLAYERS ───────────────────────────────────────────────────
  _loadPlayers() {
    const sel = this._$('playerSel');
    let entities = [];
    if (this._config.players?.length) {
      entities = this._config.players.map(eid => this._hass.states[eid]).filter(Boolean);
    }
    if (!entities.length) {
      entities = Object.values(this._hass.states).filter(e => {
        if (!e.entity_id.startsWith('media_player.')) return false;
        const a = e.attributes;
        return a.app_id === 'music_assistant' || a.mass_player_type || a.active_queue;
      });
    }
    if (!entities.length) {
      entities = Object.values(this._hass.states).filter(e => e.entity_id.startsWith('media_player.'));
    }
    this._players = entities;
    sel.innerHTML = entities.length
      ? entities.map(e => `<option value="${e.entity_id}">${this._esc(e.attributes.friendly_name || e.entity_id)}</option>`).join('')
      : '<option value="">No players found</option>';
    if (entities.length) { this._selectedPlayer = entities[0].entity_id; sel.value = this._selectedPlayer; }
  }

  // ── NAVIGATION ────────────────────────────────────────────────
  _nav(view, btn) {
    this._view = view;
    this.shadowRoot.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this._$('searchInp').value = '';
    this._$('searchClear').classList.remove('visible');
    clearTimeout(this._searchTimer);
    if (this._imgObserver) this._imgObserver.disconnect();
    if (this._queueVisible) this._hideQueue();
    this._renderView(view);
  }

  _renderView(view) {
    switch (view) {
      case 'home':      return this._renderHome();
      case 'radio':     return this._renderRadio();
      case 'albums':    return this._renderAlbums();
      case 'artists':   return this._renderArtists();
      case 'tracks':    return this._renderTracks();
      case 'playlists': return this._renderPlaylists();
    }
  }

  // ── GLOBAL SEARCH ─────────────────────────────────────────────
  async _renderGlobalSearch(q) {
    this._loading();
    try {
      const res = await this._search(q);
      const albums    = res.albums    ?? [];
      const artists   = res.artists   ?? [];
      const tracks    = res.tracks    ?? [];
      const radio     = res.radio     ?? [];
      const playlists = res.playlists ?? [];

      let html = `<div class="section"><div class="sec-hdr"><span class="sec-title">Search: ${this._esc(q)}</span></div></div>`;
      if (radio.length)     html += this._section('Radio', radio.map(a => this._radioCardHtml(a)).join(''), 'radio-grid');
      if (albums.length)    html += this._section('Albums', albums.map(a => this._albumCardHtml(a)).join(''), 'album-grid', albums.length, this._sectionActions(albums));
      if (artists.length)   html += this._section('Artists', artists.map(a => this._artistCardHtml(a)).join(''), 'artist-grid');
      if (tracks.length)    html += this._section('Tracks', tracks.map((t,i) => this._trackRowHtml(t, i+1)).join(''), 'track-list', tracks.length, this._sectionActions(tracks));
      if (playlists.length) html += this._section('Playlists', playlists.map(a => this._albumCardHtml(a,'playlist')).join(''), 'album-grid', playlists.length, this._sectionActions(playlists));
      if (!albums.length && !artists.length && !tracks.length && !radio.length && !playlists.length) {
        html = `<div class="state-box">No results for "${this._esc(q)}"</div>`;
      }
      this._scroll().innerHTML = html;
      this._hydrateImages();
      this._attachClickHandler();
    } catch(e) { this._err(e, () => this._renderGlobalSearch(q)); }
  }

  // ── HOME ──────────────────────────────────────────────────────
  async _renderHome() {
    this._loading();
    try {
      // Use allSettled so one failing fetch doesn't break the whole home screen
      const results = await Promise.allSettled([
        this._getLibrary('radio', 'sort_name', 50, true),
        this._fetchRecentlyPlayed(20),
        this._fetchLibrary('album', 'last_modified', 20),
        this._fetchLibrary('album', 'random', 20),
      ]);
      const [radio, recentlyPlayed, recentAlbums, random] = results.map(r => r.value ?? []);
      let html = '';
      if (radio.length)          html += this._section('Radio Stations', radio.map(a => this._radioCardHtml(a)).join(''), 'radio-grid');
      if (recentlyPlayed.length) html += this._section('Recently Played', recentlyPlayed.map(a => this._maItemCardHtml(a)).join(''), 'album-grid');
      if (recentAlbums.length)   html += this._section('Recently Added', recentAlbums.map(a => this._albumCardHtml(a)).join(''), 'album-grid');
      if (random.length)         html += this._section('Discover', random.map(a => this._albumCardHtml(a)).join(''), 'album-grid');
      this._scroll().innerHTML = html || '<div class="state-box">No content found</div>';
      this._hydrateImages();
      this._attachClickHandler();
      this._highlightNowPlaying();
    } catch(e) { this._err(e, () => this._renderHome()); }
  }

  // ── ALBUMS ────────────────────────────────────────────────────
  async _renderAlbums() {
    const key = 'album:sort_name:500:false';
    const cached = this._libCache[key];
    if (cached) {
      this._scroll().innerHTML = this._section('All Albums', cached.items.map(a => this._albumCardHtml(a)).join(''), 'album-grid', cached.items.length);
      this._hydrateImages(); this._attachClickHandler(); this._highlightNowPlaying(); return;
    }
    this._loading();
    try {
      const items = await this._getLibrary('album', 'sort_name', 500);
      this._scroll().innerHTML = this._section('All Albums', items.map(a => this._albumCardHtml(a)).join(''), 'album-grid', items.length);
      this._hydrateImages(); this._attachClickHandler(); this._highlightNowPlaying();
    } catch(e) { this._err(e, () => this._renderAlbums()); }
  }

  // ── ARTISTS ───────────────────────────────────────────────────
  async _renderArtists() {
    const key = 'artist:sort_name:500:false';
    const cached = this._libCache[key];
    if (cached) {
      this._scroll().innerHTML = this._section('All Artists', cached.items.map(a => this._artistCardHtml(a)).join(''), 'artist-grid', cached.items.length);
      this._hydrateImages(); this._attachClickHandler(); return;
    }
    this._loading();
    try {
      const items = await this._getLibrary('artist', 'sort_name', 500);
      this._scroll().innerHTML = this._section('All Artists', items.map(a => this._artistCardHtml(a)).join(''), 'artist-grid', items.length);
      this._hydrateImages(); this._attachClickHandler();
    } catch(e) { this._err(e, () => this._renderArtists()); }
  }

  // ── ARTIST DETAIL ─────────────────────────────────────────────
  async _renderArtistDetail(artistName, artUrl) {
    this._loading();
    try {
      const res = await this._search(artistName);
      const albums = (res.albums ?? []).filter(a =>
        this._artistName(a).toLowerCase().includes(artistName.toLowerCase())
      );
      const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="🎤"` : '';
      this._scroll().innerHTML = `
        <div class="artist-hdr">
          <div class="artist-hero" ${artAttrs}>🎤</div>
          <div>
            <div class="artist-detail-name">${this._esc(artistName)}</div>
            <button class="artist-detail-back" data-action="back">← Back</button>
          </div>
        </div>
        ${albums.length ? this._section('Albums', albums.map(a => this._albumCardHtml(a)).join(''), 'album-grid') : '<div class="state-box">No albums found</div>'}`;
      this._hydrateImages(); this._attachClickHandler();
    } catch(e) { this._err(e, () => this._renderArtistDetail(artistName, artUrl)); }
  }

  // ── TRACKS ────────────────────────────────────────────────────
  async _renderTracks() {
    this._loading();
    try {
      const items = await this._getLibrary('track', 'sort_name', 500);
      this._scroll().innerHTML = this._section('All Tracks', items.map((t,i) => this._trackRowHtml(t,i+1)).join(''), 'track-list', items.length);
      this._hydrateImages(); this._attachClickHandler();
    } catch(e) { this._err(e, () => this._renderTracks()); }
  }

  // ── PLAYLISTS ─────────────────────────────────────────────────
  async _renderPlaylists() {
    this._loading();
    try {
      const items = await this._getLibrary('playlist', 'sort_name', 500);
      this._scroll().innerHTML = this._section('Playlists', items.map(a => this._albumCardHtml(a,'playlist')).join(''), 'album-grid', items.length);
      this._hydrateImages(); this._attachClickHandler();
    } catch(e) { this._err(e, () => this._renderPlaylists()); }
  }

  // ── RADIO ─────────────────────────────────────────────────────
  async _renderRadio() {
    const key = 'radio:sort_name:5000:true';
    const cached = this._libCache[key];
    if (cached) {
      this._scroll().innerHTML = this._section('Radio Stations', cached.items.map(a => this._radioCardHtml(a)).join(''), 'radio-grid', cached.items.length);
      this._hydrateImages(); this._attachClickHandler(); return;
    }
    this._loading();
    try {
      const items = await this._getLibrary('radio', 'sort_name', 5000, true);
      this._scroll().innerHTML = this._section('Radio Stations', items.map(a => this._radioCardHtml(a)).join(''), 'radio-grid', items.length);
      this._hydrateImages(); this._attachClickHandler();
    } catch(e) { this._err(e, () => this._renderRadio()); }
  }

  // ── HTML BUILDERS ─────────────────────────────────────────────
  // Play all items in a list — encodes URIs as comma-separated media_id
  async _playAll(items, shuffle) {
    if (!items.length) return;
    if (!this._selectedPlayer) { alert('Select a player first'); return; }
    if (shuffle) {
      await this._hass.callService('media_player', 'shuffle_set', {
        entity_id: this._selectedPlayer, shuffle: true,
      });
    }
    // Play first item then enqueue the rest
    await this._hass.callService('music_assistant', 'play_media', {
      entity_id: this._selectedPlayer,
      media_id: items[0].uri,
      media_type: items[0].media_type || 'album',
      enqueue: 'play',
    });
    for (let i = 1; i < items.length; i++) {
      await this._hass.callService('music_assistant', 'play_media', {
        entity_id: this._selectedPlayer,
        media_id: items[i].uri,
        media_type: items[i].media_type || 'album',
        enqueue: 'add',
      });
    }
    this._lastNpKey = '';
  }

  _sectionActions(items) {
    if (!items.length) return '';
    // Encode items as JSON in data attribute
    const encoded = this._esc(JSON.stringify(items.map(i => ({ uri: i.uri, media_type: i.media_type || 'album' }))));
    return `<button class="sec-btn" data-action="play-all" data-items="${encoded}">▶︎ Play all</button>
            <button class="sec-btn" data-action="shuffle-all" data-items="${encoded}">⇄︎ Shuffle all</button>`;
  }

  _section(title, inner, wrapClass, count, actions) {
    const badge = count !== undefined ? `<span class="sec-count">${count}</span>` : '';
    const actHtml = actions ? `<div class="sec-actions">${actions}</div>` : '';
    return `<div class="section"><div class="sec-hdr"><span class="sec-title">${title}</span>${badge}${actHtml}</div><div class="${wrapClass}">${inner}</div></div>`;
  }

  _albumCardHtml(item, forceType) {
    const artUrl = this._artUrl(item);
    const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="💿"` : '';
    const artist = this._artistName(item);
    const uri = item.uri || '';
    const name = item.name || '';
    const mediaType = forceType || item.media_type || 'album';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="${mediaType}" data-name="${this._esc(name)}" data-artist="${this._esc(artist)}">
      <div class="a-art-wrap" ${artAttrs}>
        <span class="a-placeholder">💿</span>
        <div class="a-overlay"><div class="play-circle">▶︎</div></div>
        <div class="playing-badge">▶︎ playing</div>
      </div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
      <div class="a-artist">${this._esc(artist)}</div>
      ${item.year ? `<div class="a-year">${item.year}</div>` : ''}
    </div>`;
  }

  // Card for items from MA WebSocket API — image is {type, path, provider}
  _maItemCardHtml(item) {
    const imgPath = item.image?.path;
    const artUrl = imgPath ? `${this._maUrl}/imageproxy?path=${encodeURIComponent(imgPath)}&provider=${encodeURIComponent(item.image?.provider || '')}&size=200` : null;
    const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="💿"` : '';
    const uri = item.uri || '';
    const name = item.name || '';
    const mediaType = item.media_type || 'album';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="${mediaType}" data-name="${this._esc(name)}" data-artist="">
      <div class="a-art-wrap" ${artAttrs}>
        <span class="a-placeholder">💿</span>
        <div class="a-overlay"><div class="play-circle">▶︎</div></div>
      </div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
    </div>`;
  }

  _artistCardHtml(item) {
    const artUrl = this._artUrl(item);
    const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="🎤"` : '';
    const name = item.name || '';
    return `<div class="artist-card" data-action="artist-detail" data-name="${this._esc(name)}" data-art="${this._esc(artUrl||'')}">
      <div class="ar-img" ${artAttrs}>🎤</div>
      <div class="ar-name">${this._esc(name)}</div>
    </div>`;
  }

  _trackRowHtml(item, num, inAlbum) {
    const artUrl = this._artUrl(item);
    const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="♫︎"` : '';
    const artist = this._artistName(item);
    const meta = inAlbum ? artist : [artist, item.album?.name].filter(Boolean).join(' · ');
    const uri = item.uri || '';
    const name = item.name || '';
    return `<div class="track-row" data-uri="${this._esc(uri)}" data-type="track" data-name="${this._esc(name)}">
      <div class="tr-num">${num}</div>
      <div class="tr-art" ${artAttrs}>♫︎</div>
      <div class="tr-info">
        <div class="tr-name">${this._esc(name)}</div>
        ${meta ? `<div class="tr-meta">${this._esc(meta)}</div>` : ''}
      </div>
      <div class="tr-dur">${this._fmtDur(item.duration)}</div>
    </div>`;
  }

  _radioCardHtml(item) {
    const artUrl = this._artUrl(item);
    const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="⊙︎"` : '';
    const uri = item.uri || '';
    const name = item.name || '';
    const desc = item.metadata?.description || '';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="radio" data-name="${this._esc(name)}" data-artist="">
      <div class="a-art-wrap" ${artAttrs}>
        <span class="a-placeholder">⊙︎</span>
        <div class="a-overlay"><div class="play-circle">▶︎</div></div>
      </div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
      ${desc ? `<div class="a-artist">${this._esc(desc)}</div>` : ''}
    </div>`;
  }

  // ── CLICK HANDLING ────────────────────────────────────────────
  _attachClickHandler() {
    const scroll = this._scroll();
    scroll.removeEventListener('click', this._boundClick);
    scroll.removeEventListener('contextmenu', this._boundCtx);
    this._boundClick = e => this._handleClick(e);
    this._boundCtx   = e => this._handleCtx(e);
    scroll.addEventListener('click', this._boundClick);
    scroll.addEventListener('contextmenu', this._boundCtx);
  }

  _handleClick(e) {
    this._dismissCtx();
    // album-card or track-row — play on click
    const albumEl = e.target.closest('.album-card');
    if (albumEl && albumEl.dataset.uri) {
      this._playMedia(albumEl.dataset.uri, albumEl.dataset.type);
      return;
    }
    const trackEl = e.target.closest('.track-row');
    if (trackEl && trackEl.dataset.uri) {
      this._playMedia(trackEl.dataset.uri, 'track');
      return;
    }
    // artist card
    const artistEl = e.target.closest('.artist-card');
    if (artistEl) {
      this._renderArtistDetail(artistEl.dataset.name, artistEl.dataset.art);
      return;
    }
    // play-all / shuffle-all buttons
    const secBtn = e.target.closest('.sec-btn');
    if (secBtn) {
      const items = JSON.parse(secBtn.dataset.items || '[]');
      const shuffle = secBtn.dataset.action === 'shuffle-all';
      this._playAll(items, shuffle);
      return;
    }

    // back button
    const backEl = e.target.closest('[data-action="back"]');
    if (backEl) {
      this._renderView(this._view);
      return;
    }
  }

  // Right-click / long-press context menu
  _handleCtx(e) {
    const albumEl = e.target.closest('.album-card');
    const trackEl = e.target.closest('.track-row');
    const el = albumEl || trackEl;
    if (!el || !el.dataset.uri) return;
    e.preventDefault();
    this._showCtxMenu(e.clientX, e.clientY, el.dataset.uri, el.dataset.type || 'album', el.dataset.name || '');
  }

  _showCtxMenu(x, y, uri, type, name) {
    this._dismissCtx();
    const menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.innerHTML = `
      <div class="ctx-item" data-enqueue="play"><span class="ctx-ico">▶︎</span>Play now</div>
      <div class="ctx-item" data-enqueue="shuffle"><span class="ctx-ico">⇄︎</span>Shuffle play</div>
      <div class="ctx-item" data-enqueue="next"><span class="ctx-ico">⏭︎</span>Play next</div>
      <div class="ctx-item" data-enqueue="add"><span class="ctx-ico">+</span>Add to queue</div>`;
    menu.querySelectorAll('.ctx-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        this._playMedia(uri, type, item.dataset.enqueue);
        this._dismissCtx();
      });
    });
    // Attach inside shadow root so CSS applies
    const card = this.shadowRoot.querySelector('.card');
    card.appendChild(menu);
    this._ctxMenu = menu;
    // Position relative to card
    const cardRect = card.getBoundingClientRect();
    let mx = x - cardRect.left;
    let my = y - cardRect.top;
    menu.style.cssText = `position:absolute;left:${mx}px;top:${my}px;`;
    // Adjust if off card edge
    requestAnimationFrame(() => {
      const mr = menu.getBoundingClientRect();
      const cr = cardRect;
      if (mr.right  > cr.right)  menu.style.left = (mx - mr.width)  + 'px';
      if (mr.bottom > cr.bottom) menu.style.top  = (my - mr.height) + 'px';
    });
  }

  _dismissCtx() {
    if (this._ctxMenu) { this._ctxMenu.remove(); this._ctxMenu = null; }
  }

  // ── NOW PLAYING HIGHLIGHT ─────────────────────────────────────
  _highlightNowPlaying() {
    if (!this._nowPlayingUri) return;
    this._scroll().querySelectorAll('.album-card').forEach(card => {
      const isPlaying = card.dataset.uri === this._nowPlayingUri;
      card.classList.toggle('now-playing', isPlaying);
    });
  }

  // ── QUEUE PANEL ──────────────────────────────────────────────
  _toggleQueue() {
    if (this._queueVisible) { this._hideQueue(); return; }
    this._showQueue();
  }

  async _showQueue() {
    if (!this._selectedPlayer) return;
    this._queueVisible = true;

    const card = this.shadowRoot.querySelector('.card');
    const panel = document.createElement('div');
    panel.className = 'queue-panel';
    panel.id = 'queuePanel';

    // Get current state from HA for the header
    const state = this._hass.states[this._selectedPlayer];
    const artPath = state?.attributes.entity_picture_local || state?.attributes.entity_picture || null;
    const artHtml = artPath ? `<img src="${artPath}" style="width:100%;height:100%;object-fit:cover;border-radius:7px;" />` : '♪︎';
    const title  = state?.attributes.media_title  || 'Queue';
    const artist = state?.attributes.media_artist || '';

    panel.innerHTML = `
      <div class="queue-header">
        <div class="queue-art">${artHtml}</div>
        <div class="queue-title-wrap">
          <div class="queue-title" id="qTitle">${this._esc(title)}</div>
          <div class="queue-subtitle" id="qSub">${this._esc(artist)}</div>
        </div>
        <button class="queue-close" id="qClose">✕︎</button>
      </div>
      <div class="queue-scroll" id="qScroll">
        <div class="state-box"><div class="spinner"></div></div>
      </div>`;

    card.appendChild(panel);
    panel.querySelector('#qClose').addEventListener('click', () => this._hideQueue());

    try {
      const queueId = this._hass.states[this._selectedPlayer]?.attributes?.active_queue;
      if (!queueId) throw new Error('No active queue found');

      // Fetch queue state first to get current index
      const queueState = await this._wsSend('player_queues/get', { queue_id: queueId });
      const currentIndex = queueState?.current_index ?? 0;
      const totalItems   = queueState?.items ?? 0;

      // Fetch 3 tracks of history + rest of queue from current position
      const historyStart = Math.max(0, currentIndex - 3);
      const fetchLimit   = Math.min(200, totalItems - historyStart);
      const queueItems   = await this._wsSend('player_queues/items', {
        queue_id: queueId,
        limit: fetchLimit,
        offset: historyStart,
      });

      // Update subtitle with track count
      const subEl = panel.querySelector('#qSub');
      if (subEl) subEl.textContent = `${artist ? artist + ' · ' : ''}${totalItems} tracks`;

      const qScroll = panel.querySelector('#qScroll');
      if (!queueItems?.length) {
        qScroll.innerHTML = '<div class="state-box">Queue is empty</div>';
        return;
      }

      qScroll.innerHTML = queueItems.map((item, i) => {
        const img = item.image;
        const artUrl = img ? `${this._maUrl}/imageproxy?path=${encodeURIComponent(img.path)}&provider=${encodeURIComponent(img.provider)}&size=100` : null;
        const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="♫︎"` : '';
        const trackName = item.media_item?.name || item.name || '';
        const artistName = item.media_item?.artists?.[0]?.name || '';
        const isActive = item.sort_index === currentIndex;
        const isPast = item.sort_index < currentIndex;
        return `<div class="queue-item${isActive ? ' active' : ''}${isPast ? ' past' : ''}">
          <div class="qi-num">${isActive ? '▶︎' : item.sort_index || i + 1}</div>
          <div class="qi-art" ${artAttrs}>♫︎</div>
          <div class="qi-info">
            <div class="qi-name">${this._esc(trackName)}</div>
            ${artistName ? `<div class="qi-artist">${this._esc(artistName)}</div>` : ''}
          </div>
          <div class="qi-dur">${this._fmtDur(item.duration)}</div>
        </div>`;
      }).join('');

            // Hydrate images
      qScroll.querySelectorAll('[data-img]').forEach(el => {
        const url = el.dataset.img;
        const ph = el.dataset.placeholder || '♫︎';
        delete el.dataset.img;
        this._loadImgInto(url, el, ph);
      });

      // Scroll active item into view
      setTimeout(() => {
        const active = qScroll.querySelector('.queue-item.active');
        if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);

    } catch(e) {
      const qScroll = panel.querySelector('#qScroll');
      if (qScroll) qScroll.innerHTML = `<div class="state-box"><div class="err-txt">${e.message}</div></div>`;
    }
  }

  _hideQueue() {
    this._queueVisible = false;
    const panel = this.shadowRoot.getElementById('queuePanel');
    if (panel) panel.remove();
  }

  // ── PLAYBACK ──────────────────────────────────────────────────
  _togglePlay() {
    if (!this._selectedPlayer) return;
    const state = this._hass.states[this._selectedPlayer]?.state;
    this._hass.callService('media_player', state === 'playing' ? 'media_pause' : 'media_play', { entity_id: this._selectedPlayer });
  }

  _playerCmd(cmd) {
    if (!this._selectedPlayer) return;
    this._hass.callService('media_player', cmd === 'previous' ? 'media_previous_track' : 'media_next_track', { entity_id: this._selectedPlayer });
  }

  _toggleShuffle() {
    if (!this._selectedPlayer) return;
    const cur = this._hass.states[this._selectedPlayer]?.attributes.shuffle;
    this._hass.callService('media_player', 'shuffle_set', { entity_id: this._selectedPlayer, shuffle: !cur });
  }

  _toggleRepeat() {
    if (!this._selectedPlayer) return;
    const modes = ['off', 'one', 'all'];
    const cur = this._hass.states[this._selectedPlayer]?.attributes.repeat || 'off';
    const next = modes[(modes.indexOf(cur) + 1) % modes.length];
    this._hass.callService('media_player', 'repeat_set', { entity_id: this._selectedPlayer, repeat: next });
  }

  _setVolume(level) {
    if (!this._selectedPlayer) return;
    this._hass.callService('media_player', 'volume_set', { entity_id: this._selectedPlayer, volume_level: Math.round(level * 100) / 100 });
  }

  _toggleMute() {
    if (!this._selectedPlayer) return;
    const muted = this._hass.states[this._selectedPlayer]?.attributes.is_volume_muted;
    this._hass.callService('media_player', 'volume_mute', { entity_id: this._selectedPlayer, is_volume_muted: !muted });
  }

  // ── NOW PLAYING POLL ──────────────────────────────────────────
  _startPoll() {
    this._updateNowPlaying();
    this._pollTimer = setInterval(() => this._updateNowPlaying(), 2000);
    // Smooth progress bar - interpolate between polls
    this._progressTimer = setInterval(() => this._tickProgress(), 500);
  }

  _tickProgress() {
    if (!this._maQueueState) return;
    const { elapsed_time, elapsed_time_last_updated, state, current_item } = this._maQueueState;
    if (state !== 'playing') return;
    const dur = current_item?.duration || 0;
    if (!dur) return;
    const now = Date.now() / 1000;
    const pos = elapsed_time + (now - elapsed_time_last_updated);
    const pct = Math.min(100, (pos / dur) * 100);
    const fill = this._$('progressFill');
    if (fill) fill.style.width = pct + '%';
  }

  _updateNowPlaying() {
    if (!this._selectedPlayer || !this._hass) return;
    const state = this._hass.states[this._selectedPlayer];
    if (!state) return;

    const npKey = `${state.state}:${state.attributes.media_title}:${Math.floor((state.attributes.media_position||0)/5)}:${state.attributes.volume_level}:${state.attributes.shuffle}:${state.attributes.repeat}`;
    if (npKey === this._lastNpKey) return;
    this._lastNpKey = npKey;

    const isPlaying = state.state === 'playing';
    this._$('btnPlay').innerHTML = isPlaying ? '⏸︎' : '▶︎';

    // Shuffle & repeat button states
    const shuffleBtn = this._$('btnShuffle');
    const repeatBtn  = this._$('btnRepeat');
    shuffleBtn.classList.toggle('active', !!state.attributes.shuffle);
    const repeat = state.attributes.repeat || 'off';
    repeatBtn.classList.toggle('active', repeat !== 'off');
    repeatBtn.textContent = repeat === 'one' ? '↺︎¹' : '↺︎';
    repeatBtn.title = `Repeat: ${repeat}`;

    this._$('npTitle').textContent  = state.attributes.media_title  || 'Nothing playing';
    this._$('npArtist').textContent = state.attributes.media_artist || '—';

    const artPath = state.attributes.entity_picture_local || state.attributes.entity_picture || null;
    const artEl = this._$('npArt');
    if (artPath) {
      if (artEl.querySelector('img')?.getAttribute('src') !== artPath) {
        artEl.innerHTML = `<img src="${artPath}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'" />`;
      }
    } else {
      artEl.textContent = '♪︎';
    }

    // Fetch accurate progress from MA queue via WebSocket
    const queueId = state.attributes.active_queue;
    if (queueId && this._wsReady) {
      this._wsSend('player_queues/get', { queue_id: queueId })
        .then(q => { this._maQueueState = q; })
        .catch(() => {});
    } else {
      // Fallback to HA state
      const dur = state.attributes.media_duration || 0;
      const pos = state.attributes.media_position || 0;
      if (dur) this._$('progressFill').style.width = Math.min(100, (pos/dur)*100) + '%';
    }

    const vol = state.attributes.volume_level;
    const muted = state.attributes.is_volume_muted;
    if (vol !== undefined) {
      const pct = Math.round(vol * 100);
      const slider = this._$('volSlider');
      slider.value = pct;
      slider.style.setProperty('--vol-pct', pct + '%');
      this._$('volIcon').textContent = muted ? '🔇' : vol < 0.3 ? '🔈' : vol < 0.7 ? '🔉' : '🔊';
    }

    // Track now-playing URI for grid highlight
    const contentId = state.attributes.media_content_id || '';
    if (contentId !== this._nowPlayingUri) {
      this._nowPlayingUri = contentId;
      this._highlightNowPlaying();
    }
  }

  disconnectedCallback() {
    clearInterval(this._pollTimer);
    clearInterval(this._progressTimer);
    clearTimeout(this._searchTimer);
    if (this._imgObserver) { this._imgObserver.disconnect(); this._imgObserver = null; }
    if (this._ws) { this._ws.onclose = null; this._ws.close(); this._ws = null; }
    Object.values(this._imgCache).forEach(url => URL.revokeObjectURL(url));
    this._imgCache = {};
    this._libCache = {};
    document.removeEventListener('click', () => this._dismissCtx());
  }

  getCardSize() { return 6; }
  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() {
    return {
      config_entry_id: 'YOUR_MA_CONFIG_ENTRY_ID',
      ma_url: 'http://YOUR_MA_IP:8095',
      theme: 'dark',
    };
  }
}

customElements.define('ma-browser-card', MABrowserCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ma-browser-card',
  name: 'MA Browser Card',
  description: 'A Music Assistant browser — browse albums, artists, tracks, radio and playlists with artwork, search, queue view and playback controls.',
  preview: true,
  documentationURL: 'https://github.com/PMizz13/ma-browser-card',
});
