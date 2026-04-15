/**
 * MA Browser Card  v3.2.0
 * A full-featured Music Assistant browser card for Home Assistant
 * GitHub: https://github.com/PMizz13/ma-browser-card
 *
 * Installation:
 *   1. Copy ma-browser-card.js to /config/www/ma-browser-card.js
 *   2. HA → Settings → Dashboards → Resources → Add Resource
 *      URL: /local/ma-browser-card.js  |  Type: JavaScript Module
 *   3. Add the card to your dashboard using the config below
 *
 * ── FULL CONFIG REFERENCE ──────────────────────────────────────────────
 *
 *   type: custom:ma-browser-card
 *
 *   # Required
 *   config_entry_id: 01JXXX...      # HA → Settings → Devices & Services →
 *                                   #   Music Assistant → Configure (copy ID from URL)
 *   ma_url: http://192.168.1.x:8095 # Your Music Assistant server URL
 *
 *   # Recommended
 *   ma_token: eyJ...                # MA Settings → Profile → Access Tokens
 *                                   # Enables the Recently Played section on home screen
 *
 *   # Layout
 *   height: 580                     # Card height in pixels (default: 580)
 *   sidebar_position: left          # left (default) or top (horizontal nav bar)
 *   sidebar_width: 195              # Sidebar width in px, left sidebar only (default: 195)
 *   player_position: bottom         # bottom (default) or top
 *                                   # top sidebar + bottom player = player pinned to card bottom
 *   show_title: true                # Show/hide the logo title bar (default: true)
 *
 *   # Appearance
 *   theme: auto                     # auto (default, follows HA theme), dark, light, or retro
 *   title: Music                    # Logo title text (default: Music)
 *   subtitle: Music Assistant       # Logo subtitle text (default: Music Assistant)
 *   icon: mdi:music                 # Any MDI icon for the logo (default: mdi:music)
 *
 *   # Behaviour
 *   click_action: play              # play (default) or enqueue
 *                                   # Controls single-click on album/track
 *                                   # Right-click always shows full Play/Shuffle/Next/Enqueue menu
 *
 *   # Home screen section limits (set to 0 to hide a section entirely)
 *   home_sections:
 *     radio: 50                     # Radio stations (default: 50)
 *     recently_played: 20           # Recently played albums (default: 20, requires ma_token)
 *     recently_added: 20            # Recently added albums (default: 20, requires ma_token)
 *     discover: 20                  # Random discover albums (default: 20)
 *                                   # Controls single-click on album/track
 *                                   # Right-click always shows full Play/Shuffle/Next/Enqueue menu
 *
 *   # Players
 *   players:                        # Optional: limit dropdown to specific MA player entities
 *     - media_player.kitchen        # If omitted, all MA players are auto-detected
 *     - media_player.living_room
 *
 * ───────────────────────────────────────────────────────────────────────
 */


const CSS = `
  :host { display: block; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .card {
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
  .card.theme-light {
    --gold: var(--primary-color, #e5a00d);
    --gold-bg: color-mix(in srgb, var(--primary-color, #e5a00d) 12%, transparent);
    --gold-border: color-mix(in srgb, var(--primary-color, #e5a00d) 30%, transparent);
    --bg0: #f5f5f7; --bg2: #ffffff; --bg3: #e8e8ee;
    --bg-sidebar: #ebebef; --bg-player: #e0e0e6;
    --t1: #111113; --t2: #55555f; --t3: #9898aa;
    --border: rgba(0,0,0,0.08);
  }
  .card.theme-auto {
    --gold: var(--primary-color, #e5a00d);
    --gold-bg: color-mix(in srgb, var(--primary-color, #e5a00d) 12%, transparent);
    --gold-border: color-mix(in srgb, var(--primary-color, #e5a00d) 30%, transparent);
    --bg0: var(--primary-background-color, #111113);
    --bg2: var(--card-background-color, #222228);
    --bg3: var(--secondary-background-color, #2e2e38);
    --bg-sidebar: var(--sidebar-background-color, var(--primary-background-color, #0d0d10));
    --bg-player: var(--sidebar-background-color, var(--primary-background-color, #09090e));
    --t1: var(--primary-text-color, #f0f0f5);
    --t2: var(--secondary-text-color, #9898aa);
    --t3: var(--disabled-text-color, #55555f);
    --border: var(--divider-color, rgba(255,255,255,0.07));
  }
  /* ── RETRO THEME ── */
  .card.theme-retro {
    --gold: #22cc00;
    --gold-bg: rgba(51,255,0,0.1);
    --gold-border: rgba(51,255,0,0.25);
    --bg0: #232323;
    --bg2: #2d2d2d;
    --bg3: #383838;
    --bg-sidebar: #1a1a1a;
    --bg-player: #111111;
    --t1: #cccccc;
    --t2: #888888;
    --t3: #555555;
    --border: rgba(255,255,255,0.1);
    font-family: 'Courier New', 'Lucida Console', monospace;
    font-size: 16px;
  }
  /* Kill all border radius in retro mode */
  .card.theme-retro,
  .card.theme-retro .sidebar,
  .card.theme-retro .logo,
  .card.theme-retro .logo-icon,
  .card.theme-retro .nav-btn,
  .card.theme-retro .a-art-wrap,
  .card.theme-retro .play-circle,
  .card.theme-retro .ar-img,
  .card.theme-retro .tr-art,
  .card.theme-retro .ctx-menu,
  .card.theme-retro .ctx-item,
  .card.theme-retro .search-wrap,
  .card.theme-retro .player-sel,
  .card.theme-retro .sec-btn,
  .card.theme-retro .sec-count,
  .card.theme-retro .retry-btn,
  .card.theme-retro .queue-panel,
  .card.theme-retro .queue-art,
  .card.theme-retro .queue-item,
  .card.theme-retro .np-art,
  .card.theme-retro .artist-hero,
  .card.theme-retro .artist-detail-back,
  .card.theme-retro .skel-art,
  .card.theme-retro .skel-line,
  .card.theme-retro .spinner { border-radius: 0 !important; }

  /* Title bar — black bg, yellow title, white subtitle */
  .card.theme-retro .logo {
    background: #000000;
    border-bottom: 2px solid #22cc00;
    padding: 8px 13px;
  }
  .card.theme-retro .logo-icon {
    background: #cccc00;
    border: 1px solid #888;
    box-shadow: 1px 1px 0 rgba(255,255,255,0.15), -1px -1px 0 rgba(0,0,0,0.6);
  }
  .card.theme-retro .logo-icon ha-icon { color: #000000; --mdc-icon-color: #000000; }
  .card.theme-retro .logo-name {
    color: #cccc00;
    font-size: 12px; font-weight: bold;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .card.theme-retro .logo-sub {
    color: #ffffff;
    font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  }

  /* Sidebar */
  .card.theme-retro .sidebar { border-right: 2px solid rgba(255,255,255,0.12); }
  .card.theme-retro .nav-label { color: #22cc00; font-size: 8px; letter-spacing: 0.15em; }
  .card.theme-retro .nav-btn {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #888;
  }
  .card.theme-retro .nav-btn:hover {
    background: #2d2d2d; color: #cccccc;
    box-shadow: inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.4);
  }
  .card.theme-retro .nav-btn.active {
    background: #111; color: #22cc00;
    border: 1px solid rgba(51,255,0,0.4);
    box-shadow: inset 1px 1px 0 rgba(0,0,0,0.6), inset -1px -1px 0 rgba(255,255,255,0.04);
  }

  /* Player bar — VFD display feel */
  .card.theme-retro .player-bar { background: #111111; border-top: 2px solid rgba(255,255,255,0.1); }
  .card.theme-retro .np-title { color: #22cc00; font-size: 11px; letter-spacing: 0.04em; }
  .card.theme-retro .np-artist { color: #1a8800; font-size: 10px; }
  .card.theme-retro .ps-label { color: #555; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; }

  /* Buttons — raised bevel */
  .card.theme-retro .ctrl-btn { color: #888; font-size: 14px; }
  .card.theme-retro .ctrl-btn:hover { color: #cccccc; }
  .card.theme-retro .ctrl-btn.active { color: #22cc00; }
  .card.theme-retro .ctrl-play {
    background: #2d2d2d; color: #22cc00;
    border: none;
    box-shadow: 2px 2px 0 #111, -1px -1px 0 #444, inset 0 0 0 1px rgba(255,255,255,0.05);
  }
  .card.theme-retro .ctrl-play:hover { transform: none; background: #383838; }
  .card.theme-retro .ctrl-play:active {
    box-shadow: 1px 1px 0 #111, inset 1px 1px 0 rgba(0,0,0,0.4);
  }

  /* Progress bar — inset LCD */
  .card.theme-retro .progress-bar {
    background: #0a0a0a; height: 5px;
    border-top: 1px solid #111; border-bottom: 1px solid #444;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
  }
  .card.theme-retro .progress-fill { background: #22cc00; box-shadow: 0 0 4px rgba(51,255,0,0.5); }

  /* Search */
  .card.theme-retro .search-wrap {
    background: #0f0f0f; border: 1px solid #444;
    box-shadow: inset 1px 1px 3px rgba(0,0,0,0.6), inset -1px -1px 0 rgba(255,255,255,0.04);
  }
  .card.theme-retro .search-inp { color: #22cc00; font-family: 'Courier New', monospace; font-size: 12px; }
  .card.theme-retro .search-inp::placeholder { color: #336633; }

  /* Player selector */
  .card.theme-retro .player-sel {
    background: #0f0f0f; border: 1px solid #444;
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5);
    color: #22cc00; font-family: 'Courier New', monospace; font-size: 10px;
  }

  /* Volume */
  .card.theme-retro .vol-slider {
    background: linear-gradient(to right, #22cc00 0%, #22cc00 var(--vol-pct,50%), #0f0f0f var(--vol-pct,50%), #0f0f0f 100%);
  }
  .card.theme-retro .vol-slider::-webkit-slider-thumb { background: #888; }
  .card.theme-retro .vol-slider::-moz-range-thumb { background: #888; }

  /* Album grid */
  .card.theme-retro .a-art-wrap {
    border: 1px solid #444;
    box-shadow: 2px 2px 0 #111, inset -1px -1px 0 rgba(255,255,255,0.03);
  }
  .card.theme-retro .a-name { color: #cccccc; font-size: 11px; }
  .card.theme-retro .a-artist { color: #666; }
  .card.theme-retro .play-circle {
    background: #1a1a1a; color: #22cc00;
    border: 1px solid #22cc00;
    box-shadow: 0 0 6px rgba(51,255,0,0.3);
  }
  .card.theme-retro .album-card.now-playing .a-art-wrap {
    border-color: #22cc00;
    box-shadow: 0 0 8px rgba(51,255,0,0.4), 2px 2px 0 #111;
  }

  /* Sections */
  .card.theme-retro .sec-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #cccc00; }
  .card.theme-retro .sec-count { background: #111; border-color: #444; color: #666; }
  .card.theme-retro .sec-btn {
    font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em;
    background: #2d2d2d; border: 1px solid #555; color: #888;
    box-shadow: 1px 1px 0 #111, -1px -1px 0 #444;
  }
  .card.theme-retro .sec-btn:hover { background: #22cc00; color: #000; border-color: #22cc00; box-shadow: none; }

  /* Queue */
  .card.theme-retro .queue-item.active { background: rgba(51,255,0,0.08); border-left: 2px solid #22cc00; }
  .card.theme-retro .qi-name { color: #cccccc; }
  .card.theme-retro .queue-item.active .qi-name { color: #22cc00; }

  /* Spinner */
  .card.theme-retro .spinner { border-color: #333; border-top-color: #22cc00; }

  /* Context menu */
  .card.theme-retro .ctx-menu { background: #1a1a1a; border: 1px solid #555; box-shadow: 3px 3px 0 #000; }
  .card.theme-retro .ctx-item:hover { background: #22cc00; color: #000; }

  /* ── TOP SIDEBAR ── */
  .card.sidebar-top { flex-direction: column; }
  .card.sidebar-top .sidebar {
    width: 100%; flex-direction: column;
    border-right: none; border-bottom: 1px solid var(--border);
    flex-shrink: 0; height: auto;
  }
  .card.sidebar-top > .logo { border-bottom: 1px solid var(--border); padding: 10px 13px; order: 0; flex-shrink: 0; }
  .card.sidebar-top .sidebar { order: 1; }
  .card.sidebar-top .main { order: 2; }
  .card.sidebar-top .nav {
    display: flex; flex-direction: row; flex-wrap: wrap;
    padding: 6px 8px; gap: 2px; overflow: visible;
  }
  .card.sidebar-top .nav-label { display: none; }
  .card.sidebar-top .nav-btn { white-space: nowrap; margin-bottom: 0; width: auto; }
  .card.sidebar-top .player-bar {
    border-top: 1px solid var(--border);
    display: flex; flex-direction: row; align-items: center;
    gap: 10px; padding: 6px 12px; flex-shrink: 0; flex-wrap: wrap;
  }
  .card.sidebar-top .np-row { margin-bottom: 0; flex-shrink: 0; min-width: 140px; max-width: 200px; }
  .card.sidebar-top .controls { margin-bottom: 0; gap: 8px; }
  .card.sidebar-top .progress-bar { display: none; }
  .card.sidebar-top .ps-label { display: none; }
  .card.sidebar-top .player-sel { width: 130px; }
  .card.sidebar-top .vol-row { margin-top: 0; min-width: 100px; }
  /* sidebar-top + player-bottom: use flex order to push player to card bottom */
  .card.sidebar-top.player-bottom { flex-direction: column; }
  .card.sidebar-top.player-bottom .sidebar { order: 0; }
  .card.sidebar-top.player-bottom .main { order: 1; flex: 1; min-height: 0; }
  .card.sidebar-top.player-bottom .player-footer { order: 3; flex-shrink: 0; border-top: 1px solid var(--border); background: var(--bg-player); }
  .card.sidebar-top.player-bottom .sidebar .player-bar { display: none; }
  .card.sidebar-top .player-footer {
    display: flex; flex-direction: row; align-items: center;
    gap: 10px; padding: 6px 12px; flex-wrap: wrap;
  }
  .card.sidebar-top .player-footer .np-row { margin-bottom: 0; flex-shrink: 0; min-width: 140px; max-width: 200px; }
  .card.sidebar-top .player-footer .controls { margin-bottom: 0; gap: 8px; }
  .card.sidebar-top .player-footer .progress-bar { display: none; }
  .card.sidebar-top .player-footer .ps-label { display: none; }
  .card.sidebar-top .player-footer .player-sel { width: 130px; }
  .card.sidebar-top .player-footer .vol-row { margin-top: 0; min-width: 100px; }
  /* sidebar-left player positioning */
  .card.player-top .sidebar { flex-direction: column-reverse; }
  .card.player-top.sidebar-left .player-bar { border-top: none; border-bottom: 1px solid var(--border); }

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
  .artist-hdr { display: flex; gap: 13px; margin-bottom: 16px; align-items: flex-start; }
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
  .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 11px; }
  .skel-art { width: 100%; aspect-ratio: 1; border-radius: 8px; background: var(--bg2); margin-bottom: 6px; animation: shimmer 1.4s ease infinite; }
  .skel-line { height: 10px; border-radius: 5px; background: var(--bg2); margin-bottom: 5px; animation: shimmer 1.4s ease infinite; }
  .skel-line.short { width: 60%; }
  @keyframes shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

  /* ── STATE ── */
  .state-box {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 180px; gap: 10px; color: var(--t3); text-align: center; padding: 0 20px;
  }
  .spinner { width: 22px; height: 22px; border: 2px solid var(--bg3); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.75s linear infinite; }
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
    this._wsPending = {};
    this._maQueueState = null;
    this._progressTimer = null;
  }

  setConfig(config) {
    if (!config.config_entry_id) {
      throw new Error('ma-browser-card: config_entry_id is required.\nFind it in HA → Settings → Devices & Services → Music Assistant → Configure.\nThe URL contains it: ...?config_entry=01JXXX...');
    }
    if (!config.ma_url) {
      throw new Error('ma-browser-card: ma_url is required.\nSet it to your Music Assistant URL, e.g. http://192.168.1.x:8095');
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

  _build() {
    const height       = this._config.height || 580;
    const theme        = this._config.theme || 'auto';
    const themeClass   = theme === 'light' ? 'theme-light' : theme === 'auto' ? 'theme-auto' : theme === 'retro' ? 'theme-retro' : '';
    const sidebarWidth = this._config.sidebar_width ? `${this._config.sidebar_width}px` : '195px';
    const sidebarTop   = this._config.sidebar_position === 'top';
    const playerTop    = this._config.player_position  === 'top';
    const showTitle    = this._config.show_title !== false;
    const cardTitle    = this._config.title    || 'Music';
    const cardSubtitle = this._config.subtitle || 'Music Assistant';
    const cardIcon     = this._config.icon     || 'mdi:music';
    if (this._config.columns) this.style.gridColumn = `span ${this._config.columns}`;

    const classes = [themeClass, sidebarTop ? 'sidebar-top' : '', playerTop ? 'player-top' : 'player-bottom'].filter(Boolean).join(' ');

    const playerBarHtml = `<div class="player-bar">
        <div class="np-row" id="npRow">
          <div class="np-art" id="npArt">\u266a\uFE0E</div>
          <div class="np-info">
            <div class="np-title" id="npTitle">Nothing playing</div>
            <div class="np-artist" id="npArtist">\u2014</div>
          </div>
        </div>
        <div class="controls">
          <button class="ctrl-btn" id="btnShuffle" title="Shuffle">\u21c4\uFE0E</button>
          <button class="ctrl-btn" id="btnPrev">\u23ee\uFE0E</button>
          <button class="ctrl-play" id="btnPlay">\u25b6\uFE0E</button>
          <button class="ctrl-btn" id="btnNext">\u23ed\uFE0E</button>
          <button class="ctrl-btn" id="btnRepeat" title="Repeat">\u21ba\uFE0E</button>
        </div>
        <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
        <div class="ps-label">Playing on</div>
        <select class="player-sel" id="playerSel"><option value="">Loading\u2026</option></select>
        <div class="vol-row">
          <span class="vol-icon" id="volIcon">🔈︎</span>
          <input class="vol-slider" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%" />
        </div>
      </div>`;

    const logoHtml = showTitle ? `<div class="logo">
        <div class="logo-icon"><ha-icon icon="${cardIcon}" style="--mdc-icon-size:18px;color:#111;"></ha-icon></div>
        <div><div class="logo-name">${cardTitle}</div><div class="logo-sub">${cardSubtitle}</div></div>
      </div>` : '';

    const navHtml = `<nav class="nav">
        <div class="nav-label">Library</div>
        <button class="nav-btn active" data-view="home"><span class="nav-ico">\u2302\uFE0E</span>Home</button>
        <button class="nav-btn" data-view="radio"><span class="nav-ico">\u223f\uFE0E</span>Radio</button>
        <button class="nav-btn" data-view="albums"><span class="nav-ico">\u25c9\uFE0E</span>Albums</button>
        <button class="nav-btn" data-view="artists"><span class="nav-ico">\u266a\uFE0E</span>Artists</button>
        <button class="nav-btn" data-view="tracks"><span class="nav-ico">\u266b\uFE0E</span>Tracks</button>
        <button class="nav-btn" data-view="playlists"><span class="nav-ico">\u2630\uFE0E</span>Playlists</button>
      </nav>`;

    const outerLogo    = sidebarTop ? logoHtml : '';
    const innerContent = playerTop
      ? (sidebarTop ? '' : logoHtml) + playerBarHtml + navHtml
      : (sidebarTop ? '' : logoHtml) + navHtml + (sidebarTop ? '' : playerBarHtml);
    const bottomPlayer = (sidebarTop && !playerTop)
      ? playerBarHtml.replace('class="player-bar"', 'class="player-bar player-footer"')
      : '';

    this.shadowRoot.innerHTML = `<style>${CSS}</style>
    <div class="card ${classes}" style="--card-height:${height}px;--sidebar:${sidebarWidth}">
      ${outerLogo}
      <div class="sidebar">${innerContent}</div>
      <div class="main">
        <div class="topbar">
          <div class="search-wrap">
            <span style="font-size:14px;color:var(--t3)">\u2315\uFE0E</span>
            <input class="search-inp" id="searchInp" type="text" placeholder="Search everything\u2026" />
            <button class="search-clear" id="searchClear">\u2715\uFE0E</button>
          </div>
        </div>
        <div class="scroll" id="scroll">
          <div class="state-box"><div class="spinner"></div><span>Connecting\u2026</span></div>
        </div>
      </div>
      ${bottomPlayer}
    </div>`;

    this.shadowRoot.querySelectorAll('.nav-btn').forEach(btn =>
      btn.addEventListener('click', () => this._nav(btn.dataset.view, btn))
    );
    const searchEl = this.shadowRoot.getElementById('searchInp');
    const clearBtn = this.shadowRoot.getElementById('searchClear');
    const searchHandler = () => {
      const q = searchEl.value;
      clearBtn.classList.toggle('visible', q.length > 0);
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        q.trim() ? this._renderGlobalSearch(q.trim()) : this._renderView(this._view);
      }, 400);
    };
    searchEl.addEventListener('input', searchHandler);
    searchEl.addEventListener('keyup', searchHandler);
    searchEl.addEventListener('keydown', e => e.stopPropagation());
    clearBtn.addEventListener('click', () => { searchEl.value = ''; clearBtn.classList.remove('visible'); this._renderView(this._view); });

    this.shadowRoot.getElementById('playerSel').addEventListener('change', e => { this._selectedPlayer = e.target.value || null; this._lastNpKey = ''; this._updateNowPlaying(); });
    this.shadowRoot.getElementById('btnPlay').addEventListener('click', () => this._togglePlay());
    this.shadowRoot.getElementById('btnPrev').addEventListener('click', () => this._playerCmd('previous'));
    this.shadowRoot.getElementById('btnNext').addEventListener('click', () => this._playerCmd('next'));
    this.shadowRoot.getElementById('btnShuffle').addEventListener('click', () => this._toggleShuffle());
    this.shadowRoot.getElementById('btnRepeat').addEventListener('click', () => this._toggleRepeat());
    this.shadowRoot.getElementById('npRow').addEventListener('click', () => this._toggleQueue());

    const volEl = this.shadowRoot.getElementById('volSlider');
    volEl.addEventListener('input', e => {
      const pct = e.target.value;
      volEl.style.setProperty('--vol-pct', pct + '%');
      const v = pct / 100;
      this.shadowRoot.getElementById('volIcon').textContent = v === 0 ? '🔇︎' : v < 0.3 ? '🔈︎' : v < 0.7 ? '🔉︎' : '🔊︎';
      this._setVolume(v);
    });
    this.shadowRoot.getElementById('volIcon').addEventListener('click', () => this._toggleMute());
    this._attachClickHandler();
    document.addEventListener('click', () => this._dismissCtx());
    this.shadowRoot.addEventListener('click', e => { if (this._ctxMenu && !this._ctxMenu.contains(e.target)) this._dismissCtx(); });
  }

  async _init() {
    try {
      this._loadPlayers();
      this._connectMA();
      await this._renderHome();
      this._startPoll();
      setTimeout(() => { if (this._players.length === 0) this._loadPlayers(); }, 3000);
      setTimeout(async () => { if (this._wsReady && this._view === 'home') await this._renderHome(); }, 4000);
    } catch(e) { this._err(e); }
  }

  _$ = id => this.shadowRoot.getElementById(id);
  _scroll = () => this._$('scroll');

  _skeleton(count = 8) {
    return `<div class="section"><div class="skeleton-grid">${Array.from({length: count}, () => `<div class="skel-card"><div class="skel-art"></div><div class="skel-line"></div><div class="skel-line short"></div></div>`).join('')}</div></div>`;
  }
  _loading() { if (this._imgObserver) this._imgObserver.disconnect(); this._scroll().innerHTML = this._skeleton(); }
  _err(e, retryFn) {
    const msg = e?.message || String(e);
    this._scroll().innerHTML = `<div class="state-box"><div>\u26a0</div><div class="err-txt">${msg}</div>${retryFn ? `<button class="retry-btn" id="retryBtn">Try again</button>` : ''}</div>`;
    if (retryFn) { const btn = this._scroll().querySelector('#retryBtn'); if (btn) btn.addEventListener('click', retryFn); }
  }
  _esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  _fmtDur(sec) { if (!sec) return ''; return `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,'0')}`; }
  _artUrl(item) { if (!item) return null; return item.image || item.image_url || item.album?.image || item.album?.image_url || null; }
  _artistName(item) { return item?.artists?.length ? item.artists.map(a => a.name).join(', ') : ''; }

  async _loadImgInto(url, el, ph) {
    if (!url) { el.innerHTML = ph; return; }
    if (this._imgCache[url]) { if (el.isConnected) el.innerHTML = `<img src="${this._imgCache[url]}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`; return; }
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(resp.status);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      this._imgCache[url] = blobUrl;
      if (el.isConnected) el.innerHTML = `<img src="${blobUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
    } catch {
      if (el.isConnected) { const img = document.createElement('img'); img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;'; img.onerror = () => { if (el.isConnected) el.innerHTML = ph; }; img.src = url; el.innerHTML = ''; el.appendChild(img); }
    }
  }

  _hydrateImages() {
    const els = this._scroll().querySelectorAll('[data-img]');
    if (!els.length) return;
    if (!this._imgObserver) {
      this._imgObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target; this._imgObserver.unobserve(el);
          const url = el.dataset.img; const ph = el.dataset.placeholder || '\U0001f4bf'; delete el.dataset.img;
          this._loadImgInto(url, el, ph);
        });
      }, { root: this._scroll(), rootMargin: '100px' });
    }
    els.forEach(el => this._imgObserver.observe(el));
  }

  async _callService(service, data) {
    return this._hass.connection.sendMessagePromise({ type: 'call_service', domain: 'music_assistant', service, service_data: { config_entry_id: this._config.config_entry_id, ...data }, return_response: true });
  }

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

  async _playMedia(uri, mediaType, enqueue = 'play') {
    if (!this._selectedPlayer) { alert('Select a player first'); return; }
    const isShuffle = enqueue === 'shuffle';
    if (isShuffle) await this._hass.callService('media_player', 'shuffle_set', { entity_id: this._selectedPlayer, shuffle: true });
    await this._hass.callService('music_assistant', 'play_media', { entity_id: this._selectedPlayer, media_id: uri, media_type: mediaType || 'album', enqueue: isShuffle ? 'play' : enqueue });
    this._lastNpKey = '';
  }

  // ── MA WEBSOCKET ──────────────────────────────────────────────

  // localStorage cache — survives card rebuild and theme changes (10 min TTL)
  _lsKey(key) {
    // Namespace by config_entry_id + home_sections limits
    // so cards with different limits don't share the same cache entry
    const id = this._config.config_entry_id || 'default';
    const sec = this._config.home_sections || {};
    const limitsStr = [
      sec.recently_played ?? 20,
      sec.recently_added  ?? 20,
    ].join('_');
    return `ma_card_${id}_${limitsStr}_${key}`;
  }

  _lsGet(key) {
    try {
      const raw = localStorage.getItem(this._lsKey(key));
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < 600000) return data;
      localStorage.removeItem(this._lsKey(key));
    } catch {}
    return null;
  }

  _lsSet(key, data) {
    try { localStorage.setItem(this._lsKey(key), JSON.stringify({ ts: Date.now(), data })); } catch {}
  }

  // Wait up to 5s for WS to authenticate
  async _waitForWS() {
    if (this._wsReady) return true;
    if (!this._ws) return false;
    await new Promise(resolve => {
      const check = setInterval(() => { if (this._wsReady) { clearInterval(check); resolve(); } }, 200);
      setTimeout(() => { clearInterval(check); resolve(); }, 5000);
    });
    return this._wsReady;
  }

  _connectMA() {
    if (!this._maToken || !this._maUrl) return;
    if (this._ws) { this._ws.close(); this._ws = null; }
    const wsUrl = this._maUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';
    const ws = new WebSocket(wsUrl);
    this._ws = ws; this._wsReady = false;
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.server_version && !msg.message_id) { ws.send(JSON.stringify({ message_id: 'auth', command: 'auth', args: { token: this._maToken } })); return; }
      if (msg.message_id === 'auth') { if (msg.result?.authenticated) { this._wsReady = true; } return; }
      const pending = this._wsPending[msg.message_id];
      if (pending) { delete this._wsPending[msg.message_id]; msg.error_code ? pending.reject(new Error(msg.details || 'MA error ' + msg.error_code)) : pending.resolve(msg.result); }
    };
    ws.onerror = () => { this._wsReady = false; };
    ws.onclose = () => { this._wsReady = false; setTimeout(() => { if (this._maToken) this._connectMA(); }, 10000); };
  }

  _wsSend(command, args = {}) {
    return new Promise((resolve, reject) => {
      if (!this._ws || !this._wsReady) { reject(new Error('MA WS not ready')); return; }
      const id = String(++this._wsMsgId);
      this._wsPending[id] = { resolve, reject };
      this._ws.send(JSON.stringify({ message_id: id, command, args }));
      setTimeout(() => { if (this._wsPending[id]) { delete this._wsPending[id]; reject(new Error('MA WS timeout')); } }, 10000);
    });
  }

  async _waitForWS() {
    if (this._wsReady) return true;
    if (!this._ws) return false;
    await new Promise(resolve => {
      const check = setInterval(() => { if (this._wsReady) { clearInterval(check); resolve(); } }, 200);
      setTimeout(() => { clearInterval(check); resolve(); }, 5000);
    });
    return this._wsReady;
  }

  async _fetchRecentlyAdded(limit = 20) {
    if (!this._maToken) return [];
    const cached = this._lsGet('recently_added');
    if (cached) {
      // Refresh in background without blocking render
      this._waitForWS().then(ready => {
        if (!ready) return;
        this._wsSend('music/albums/library_items', { order_by: 'timestamp_added_desc', limit })
          .then(result => { const items = result?.items ?? (Array.isArray(result) ? result : []); this._lsSet('recently_added', items); })
          .catch(() => {});
      });
      return cached;
    }
    if (!await this._waitForWS()) return [];
    try {
      const result = await this._wsSend('music/albums/library_items', { order_by: 'timestamp_added_desc', limit });
      const items = result?.items ?? (Array.isArray(result) ? result : []);
      this._lsSet('recently_added', items);
      return items;
    } catch(e) { console.warn('[MA Card] recently_added failed:', e.message); return []; }
  }

  async _fetchRecentlyPlayed(limit = 20) {
    if (!this._maToken) return [];
    const cached = this._lsGet('recently_played');
    if (cached) {
      this._waitForWS().then(ready => {
        if (!ready) return;
        this._wsSend('music/recently_played_items', { limit, media_types: ['album'] })
          .then(items => {
            const seen = new Set();
            const filtered = (Array.isArray(items) ? items : []).filter(i => { if (seen.has(i.name)) return false; seen.add(i.name); return true; });
            this._lsSet('recently_played', filtered);
          }).catch(() => {});
      });
      return cached;
    }
    if (!await this._waitForWS()) return [];
    try {
      const items = await this._wsSend('music/recently_played_items', { limit, media_types: ['album'] });
      const seen = new Set();
      const filtered = (Array.isArray(items) ? items : []).filter(i => { if (seen.has(i.name)) return false; seen.add(i.name); return true; });
      this._lsSet('recently_played', filtered);
      return filtered;
    } catch(e) { console.warn('[MA Card] recently_played failed:', e.message); return []; }
  }

  // ── PLAYERS ───────────────────────────────────────────────────
  _loadPlayers() {
    const sel = this._$('playerSel');
    let entities = [];
    if (this._config.players?.length) entities = this._config.players.map(eid => this._hass.states[eid]).filter(Boolean);
    if (!entities.length) entities = Object.values(this._hass.states).filter(e => { if (!e.entity_id.startsWith('media_player.')) return false; const a = e.attributes; return a.app_id === 'music_assistant' || a.mass_player_type || a.active_queue; });
    if (!entities.length) entities = Object.values(this._hass.states).filter(e => e.entity_id.startsWith('media_player.'));
    this._players = entities;
    sel.innerHTML = entities.length ? entities.map(e => `<option value="${e.entity_id}">${this._esc(e.attributes.friendly_name || e.entity_id)}</option>`).join('') : '<option value="">No players found</option>';
    if (entities.length) { this._selectedPlayer = entities[0].entity_id; sel.value = this._selectedPlayer; }
  }

  _nav(view, btn) {
    this._view = view;
    this.shadowRoot.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this._$('searchInp').value = ''; this._$('searchClear').classList.remove('visible');
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

  async _renderGlobalSearch(q) {
    this._loading();
    try {
      const res = await this._search(q);
      const albums = res.albums ?? [], artists = res.artists ?? [], tracks = res.tracks ?? [], radio = res.radio ?? [], playlists = res.playlists ?? [];
      let html = `<div class="section"><div class="sec-hdr"><span class="sec-title">Search: ${this._esc(q)}</span></div></div>`;
      if (albums.length)    html += this._section('Albums', albums.map(a => this._albumCardHtml(a)).join(''), 'album-grid', albums.length, this._sectionActions(albums));
      if (artists.length)   html += this._section('Artists', artists.map(a => this._artistCardHtml(a)).join(''), 'artist-grid');
      if (tracks.length)    html += this._section('Tracks', tracks.map((t,i) => this._trackRowHtml(t,i+1)).join(''), 'track-list', tracks.length, this._sectionActions(tracks));
      if (playlists.length) html += this._section('Playlists', playlists.map(a => this._albumCardHtml(a,'playlist')).join(''), 'album-grid', playlists.length, this._sectionActions(playlists));
      if (radio.length)     html += this._section('Radio', radio.map(a => this._radioCardHtml(a)).join(''), 'radio-grid');
      if (!albums.length && !artists.length && !tracks.length && !radio.length && !playlists.length) html = `<div class="state-box">No results for "${this._esc(q)}"</div>`;
      this._scroll().innerHTML = html;
      this._hydrateImages(); this._attachClickHandler();
    } catch(e) { this._err(e, () => this._renderGlobalSearch(q)); }
  }

  async _renderHome() {
    this._loading();
    try {
      const sec = this._config.home_sections || {};
      const radioLimit   = sec.radio          ?? 50;
      const playedLimit  = sec.recently_played ?? 20;
      const addedLimit   = sec.recently_added  ?? 20;
      const discoverLimit = sec.discover       ?? 20;
      const results = await Promise.allSettled([
        radioLimit   ? this._getLibrary('radio', 'sort_name', radioLimit, true) : Promise.resolve([]),
        playedLimit  ? this._fetchRecentlyPlayed(playedLimit)  : Promise.resolve([]),
        addedLimit   ? this._fetchRecentlyAdded(addedLimit)    : Promise.resolve([]),
        discoverLimit ? this._fetchLibrary('album', 'random', discoverLimit) : Promise.resolve([]),
      ]);
      const [radio, recentlyPlayed, recentAlbums, random] = results.map(r => r.value ?? []);
      let html = '';
      if (radio.length)          html += this._section('Radio Stations', radio.map(a => this._radioCardHtml(a)).join(''), 'radio-grid');
      if (recentlyPlayed.length) html += this._section('Recently Played', recentlyPlayed.map(a => this._maItemCardHtml(a)).join(''), 'album-grid');
      if (recentAlbums.length)   html += this._section('Recently Added', recentAlbums.map(a => this._maItemCardHtml(a)).join(''), 'album-grid');
      if (random.length)         html += this._section('Discover', random.map(a => this._albumCardHtml(a)).join(''), 'album-grid');
      this._scroll().innerHTML = html || '<div class="state-box">No content found</div>';
      this._hydrateImages(); this._attachClickHandler(); this._highlightNowPlaying();
    } catch(e) { this._err(e, () => this._renderHome()); }
  }

  async _renderAlbums() {
    const key = 'album:sort_name:500:false';
    const cached = this._libCache[key];
    if (cached) { this._scroll().innerHTML = this._section('All Albums', cached.items.map(a => this._albumCardHtml(a)).join(''), 'album-grid', cached.items.length); this._hydrateImages(); this._attachClickHandler(); this._highlightNowPlaying(); return; }
    this._loading();
    try { const items = await this._getLibrary('album', 'sort_name', 500); this._scroll().innerHTML = this._section('All Albums', items.map(a => this._albumCardHtml(a)).join(''), 'album-grid', items.length); this._hydrateImages(); this._attachClickHandler(); this._highlightNowPlaying(); }
    catch(e) { this._err(e, () => this._renderAlbums()); }
  }

  async _renderArtists() {
    const key = 'artist:sort_name:500:false';
    const cached = this._libCache[key];
    if (cached) { this._scroll().innerHTML = this._section('All Artists', cached.items.map(a => this._artistCardHtml(a)).join(''), 'artist-grid', cached.items.length); this._hydrateImages(); this._attachClickHandler(); return; }
    this._loading();
    try { const items = await this._getLibrary('artist', 'sort_name', 500); this._scroll().innerHTML = this._section('All Artists', items.map(a => this._artistCardHtml(a)).join(''), 'artist-grid', items.length); this._hydrateImages(); this._attachClickHandler(); }
    catch(e) { this._err(e, () => this._renderArtists()); }
  }

  async _renderArtistDetail(artistName, artUrl) {
    this._loading();
    try {
      const res = await this._search(artistName);
      const albums = (res.albums ?? []).filter(a => this._artistName(a).toLowerCase().includes(artistName.toLowerCase()));
      const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="\U0001f3a4"` : '';
      this._scroll().innerHTML = `<div class="artist-hdr"><div class="artist-hero" ${artAttrs}>\U0001f3a4</div><div><div class="artist-detail-name">${this._esc(artistName)}</div><button class="artist-detail-back" data-action="back">\u2190 Back</button></div></div>${albums.length ? this._section('Albums', albums.map(a => this._albumCardHtml(a)).join(''), 'album-grid') : '<div class="state-box">No albums found</div>'}`;
      this._hydrateImages(); this._attachClickHandler();
    } catch(e) { this._err(e, () => this._renderArtistDetail(artistName, artUrl)); }
  }

  async _renderTracks() {
    this._loading();
    try { const items = await this._getLibrary('track', 'sort_name', 500); this._scroll().innerHTML = this._section('All Tracks', items.map((t,i) => this._trackRowHtml(t,i+1)).join(''), 'track-list', items.length); this._hydrateImages(); this._attachClickHandler(); }
    catch(e) { this._err(e, () => this._renderTracks()); }
  }

  async _renderPlaylists() {
    this._loading();
    try { const items = await this._getLibrary('playlist', 'sort_name', 500); this._scroll().innerHTML = this._section('Playlists', items.map(a => this._albumCardHtml(a,'playlist')).join(''), 'album-grid', items.length); this._hydrateImages(); this._attachClickHandler(); }
    catch(e) { this._err(e, () => this._renderPlaylists()); }
  }

  async _renderRadio() {
    const key = 'radio:sort_name:5000:true';
    const cached = this._libCache[key];
    if (cached) { this._scroll().innerHTML = this._section('Radio Stations', cached.items.map(a => this._radioCardHtml(a)).join(''), 'radio-grid', cached.items.length); this._hydrateImages(); this._attachClickHandler(); return; }
    this._loading();
    try { const items = await this._getLibrary('radio', 'sort_name', 5000, true); this._scroll().innerHTML = this._section('Radio Stations', items.map(a => this._radioCardHtml(a)).join(''), 'radio-grid', items.length); this._hydrateImages(); this._attachClickHandler(); }
    catch(e) { this._err(e, () => this._renderRadio()); }
  }

  async _playAll(items, shuffle) {
    if (!items.length || !this._selectedPlayer) { if (!this._selectedPlayer) alert('Select a player first'); return; }
    if (shuffle) await this._hass.callService('media_player', 'shuffle_set', { entity_id: this._selectedPlayer, shuffle: true });
    await this._hass.callService('music_assistant', 'play_media', { entity_id: this._selectedPlayer, media_id: items[0].uri, media_type: items[0].media_type || 'album', enqueue: 'play' });
    for (let i = 1; i < items.length; i++) await this._hass.callService('music_assistant', 'play_media', { entity_id: this._selectedPlayer, media_id: items[i].uri, media_type: items[i].media_type || 'album', enqueue: 'add' });
    this._lastNpKey = '';
  }

  _sectionActions(items) {
    if (!items.length) return '';
    const encoded = this._esc(JSON.stringify(items.map(i => ({ uri: i.uri, media_type: i.media_type || 'album' }))));
    return `<button class="sec-btn" data-action="play-all" data-items="${encoded}">\u25b6\uFE0E Play all</button><button class="sec-btn" data-action="shuffle-all" data-items="${encoded}">\u21c4\uFE0E Shuffle all</button>`;
  }

  _section(title, inner, wrapClass, count, actions) {
    const badge = count !== undefined ? `<span class="sec-count">${count}</span>` : '';
    const actHtml = actions ? `<div class="sec-actions">${actions}</div>` : '';
    return `<div class="section"><div class="sec-hdr"><span class="sec-title">${title}</span>${badge}${actHtml}</div><div class="${wrapClass}">${inner}</div></div>`;
  }

  _albumCardHtml(item, forceType) {
    const artUrl = this._artUrl(item);
    const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="\U0001f4bf"` : '';
    const artist = this._artistName(item), uri = item.uri || '', name = item.name || '', mediaType = forceType || item.media_type || 'album';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="${mediaType}" data-name="${this._esc(name)}" data-artist="${this._esc(artist)}">
      <div class="a-art-wrap" ${artAttrs}><span class="a-placeholder">\U0001f4bf</span><div class="a-overlay"><div class="play-circle">\u25b6\uFE0E</div></div><div class="playing-badge">\u25b6\uFE0E playing</div></div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
      <div class="a-artist">${this._esc(artist)}</div>
      ${item.year ? `<div class="a-year">${item.year}</div>` : ''}
    </div>`;
  }

  _maItemCardHtml(item) {
    let artUrl = null;
    if (typeof item.image === 'string' && item.image) {
      artUrl = item.image;
    } else if (item.image?.path) {
      artUrl = `${this._maUrl}/imageproxy?path=${encodeURIComponent(item.image.path)}&provider=${encodeURIComponent(item.image.provider || '')}&size=200`;
    } else if (item.metadata?.images?.[0]?.path) {
      const img = item.metadata.images[0];
      artUrl = `${this._maUrl}/imageproxy?path=${encodeURIComponent(img.path)}&provider=${encodeURIComponent(img.provider || '')}&size=200`;
    }
    const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="\U0001f4bf"` : '';
    const uri = item.uri || '', name = item.name || '', mediaType = item.media_type || 'album';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="${mediaType}" data-name="${this._esc(name)}" data-artist="">
      <div class="a-art-wrap" ${artAttrs}><span class="a-placeholder">\U0001f4bf</span><div class="a-overlay"><div class="play-circle">\u25b6\uFE0E</div></div></div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
    </div>`;
  }

  _artistCardHtml(item) {
    const artUrl = this._artUrl(item), name = item.name || '';
    const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="\U0001f3a4"` : '';
    return `<div class="artist-card" data-action="artist-detail" data-name="${this._esc(name)}" data-art="${this._esc(artUrl||'')}"><div class="ar-img" ${artAttrs}>\U0001f3a4</div><div class="ar-name">${this._esc(name)}</div></div>`;
  }

  _trackRowHtml(item, num, inAlbum) {
    const artUrl = this._artUrl(item), artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="\u266b\uFE0E"` : '';
    const artist = this._artistName(item), meta = inAlbum ? artist : [artist, item.album?.name].filter(Boolean).join(' \u00b7 ');
    const uri = item.uri || '', name = item.name || '';
    return `<div class="track-row" data-uri="${this._esc(uri)}" data-type="track" data-name="${this._esc(name)}">
      <div class="tr-num">${num}</div><div class="tr-art" ${artAttrs}>\u266b\uFE0E</div>
      <div class="tr-info"><div class="tr-name">${this._esc(name)}</div>${meta ? `<div class="tr-meta">${this._esc(meta)}</div>` : ''}</div>
      <div class="tr-dur">${this._fmtDur(item.duration)}</div>
    </div>`;
  }

  _radioCardHtml(item) {
    const artUrl = this._artUrl(item), artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="\u2609\uFE0E"` : '';
    const uri = item.uri || '', name = item.name || '', desc = item.metadata?.description || '';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="radio" data-name="${this._esc(name)}" data-artist="">
      <div class="a-art-wrap" ${artAttrs}><span class="a-placeholder">\u2609\uFE0E</span><div class="a-overlay"><div class="play-circle">\u25b6\uFE0E</div></div></div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
      ${desc ? `<div class="a-artist">${this._esc(desc)}</div>` : ''}
    </div>`;
  }

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
    const albumEl = e.target.closest('.album-card');
    if (albumEl && albumEl.dataset.uri) { const action = this._config.click_action || 'play'; this._playMedia(albumEl.dataset.uri, albumEl.dataset.type, action === 'enqueue' ? 'add' : 'play'); return; }
    const trackEl = e.target.closest('.track-row');
    if (trackEl && trackEl.dataset.uri) { this._playMedia(trackEl.dataset.uri, 'track'); return; }
    const artistEl = e.target.closest('.artist-card');
    if (artistEl) { this._renderArtistDetail(artistEl.dataset.name, artistEl.dataset.art); return; }
    const secBtn = e.target.closest('.sec-btn');
    if (secBtn) { this._playAll(JSON.parse(secBtn.dataset.items || '[]'), secBtn.dataset.action === 'shuffle-all'); return; }
    const backEl = e.target.closest('[data-action="back"]');
    if (backEl) { this._renderView(this._view); return; }
  }

  _handleCtx(e) {
    const el = e.target.closest('.album-card') || e.target.closest('.track-row');
    if (!el || !el.dataset.uri) return;
    e.preventDefault();
    this._showCtxMenu(e.clientX, e.clientY, el.dataset.uri, el.dataset.type || 'album', el.dataset.name || '');
  }

  _showCtxMenu(x, y, uri, type, name) {
    this._dismissCtx();
    const menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.innerHTML = `
      <div class="ctx-item" data-enqueue="play"><span class="ctx-ico">\u25b6\uFE0E</span>Play now</div>
      <div class="ctx-item" data-enqueue="shuffle"><span class="ctx-ico">\u21c4\uFE0E</span>Shuffle play</div>
      <div class="ctx-item" data-enqueue="next"><span class="ctx-ico">\u23ed\uFE0E</span>Play next</div>
      <div class="ctx-item" data-enqueue="add"><span class="ctx-ico">+</span>Add to queue</div>`;
    menu.querySelectorAll('.ctx-item').forEach(item => item.addEventListener('click', e => { e.stopPropagation(); this._playMedia(uri, type, item.dataset.enqueue); this._dismissCtx(); }));
    const card = this.shadowRoot.querySelector('.card');
    card.appendChild(menu);
    this._ctxMenu = menu;
    const cardRect = card.getBoundingClientRect();
    let mx = x - cardRect.left, my = y - cardRect.top;
    menu.style.cssText = `position:absolute;left:${mx}px;top:${my}px;`;
    requestAnimationFrame(() => {
      const mr = menu.getBoundingClientRect(), cr = cardRect;
      if (mr.right > cr.right)   menu.style.left = (mx - mr.width)  + 'px';
      if (mr.bottom > cr.bottom) menu.style.top  = (my - mr.height) + 'px';
    });
  }

  _dismissCtx() { if (this._ctxMenu) { this._ctxMenu.remove(); this._ctxMenu = null; } }

  _highlightNowPlaying() {
    if (!this._nowPlayingUri) return;
    this._scroll().querySelectorAll('.album-card').forEach(card => card.classList.toggle('now-playing', card.dataset.uri === this._nowPlayingUri));
  }

  _toggleQueue() { this._queueVisible ? this._hideQueue() : this._showQueue(); }

  async _showQueue() {
    if (!this._selectedPlayer) return;
    this._queueVisible = true;
    const card = this.shadowRoot.querySelector('.card');
    const panel = document.createElement('div');
    panel.className = 'queue-panel'; panel.id = 'queuePanel';
    const state = this._hass.states[this._selectedPlayer];
    const artPath = state?.attributes.entity_picture_local || state?.attributes.entity_picture || null;
    const title = state?.attributes.media_title || 'Queue', artist = state?.attributes.media_artist || '';
    panel.innerHTML = `<div class="queue-header"><div class="queue-art">${artPath ? `<img src="${artPath}" style="width:100%;height:100%;object-fit:cover;border-radius:7px;" />` : '\u266a\uFE0E'}</div><div class="queue-title-wrap"><div class="queue-title" id="qTitle">${this._esc(title)}</div><div class="queue-subtitle" id="qSub">${this._esc(artist)}</div></div><button class="queue-close" id="qClose">\u2715\uFE0E</button></div><div class="queue-scroll" id="qScroll"><div class="state-box"><div class="spinner"></div></div></div>`;
    card.appendChild(panel);
    panel.querySelector('#qClose').addEventListener('click', () => this._hideQueue());
    try {
      const queueId = this._hass.states[this._selectedPlayer]?.attributes?.active_queue;
      if (!queueId) throw new Error('No active queue found');
      const queueState = await this._wsSend('player_queues/get', { queue_id: queueId });
      const currentIndex = queueState?.current_index ?? 0, totalItems = queueState?.items ?? 0;
      const historyStart = Math.max(0, currentIndex - 3);
      const queueItems = await this._wsSend('player_queues/items', { queue_id: queueId, limit: Math.min(200, totalItems - historyStart), offset: historyStart });
      const subEl = panel.querySelector('#qSub');
      if (subEl) subEl.textContent = `${artist ? artist + ' \u00b7 ' : ''}${totalItems} tracks`;
      const qScroll = panel.querySelector('#qScroll');
      if (!queueItems?.length) { qScroll.innerHTML = '<div class="state-box">Queue is empty</div>'; return; }
      qScroll.innerHTML = queueItems.map((item, i) => {
        const img = item.image;
        const artUrl = img ? `${this._maUrl}/imageproxy?path=${encodeURIComponent(img.path)}&provider=${encodeURIComponent(img.provider)}&size=100` : null;
        const artAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="\u266b\uFE0E"` : '';
        const isActive = item.sort_index === currentIndex, isPast = item.sort_index < currentIndex;
        return `<div class="queue-item${isActive?' active':''}${isPast?' past':''}"><div class="qi-num">${isActive ? '\u25b6\uFE0E' : item.sort_index || i+1}</div><div class="qi-art" ${artAttrs}>\u266b\uFE0E</div><div class="qi-info"><div class="qi-name">${this._esc(item.media_item?.name || item.name || '')}</div>${item.media_item?.artists?.[0]?.name ? `<div class="qi-artist">${this._esc(item.media_item.artists[0].name)}</div>` : ''}</div><div class="qi-dur">${this._fmtDur(item.duration)}</div></div>`;
      }).join('');
      qScroll.querySelectorAll('[data-img]').forEach(el => { const url = el.dataset.img, ph = el.dataset.placeholder || '\u266b\uFE0E'; delete el.dataset.img; this._loadImgInto(url, el, ph); });
      setTimeout(() => { const active = qScroll.querySelector('.queue-item.active'); if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 100);
    } catch(e) { const qs = panel.querySelector('#qScroll'); if (qs) qs.innerHTML = `<div class="state-box"><div class="err-txt">${e.message}</div></div>`; }
  }

  _hideQueue() { this._queueVisible = false; const p = this.shadowRoot.getElementById('queuePanel'); if (p) p.remove(); }

  _togglePlay() { if (!this._selectedPlayer) return; const s = this._hass.states[this._selectedPlayer]?.state; this._hass.callService('media_player', s === 'playing' ? 'media_pause' : 'media_play', { entity_id: this._selectedPlayer }); }
  _playerCmd(cmd) { if (!this._selectedPlayer) return; this._hass.callService('media_player', cmd === 'previous' ? 'media_previous_track' : 'media_next_track', { entity_id: this._selectedPlayer }); }
  _toggleShuffle() { if (!this._selectedPlayer) return; const cur = this._hass.states[this._selectedPlayer]?.attributes.shuffle; this._hass.callService('media_player', 'shuffle_set', { entity_id: this._selectedPlayer, shuffle: !cur }); }
  _toggleRepeat() { if (!this._selectedPlayer) return; const modes = ['off','one','all'], cur = this._hass.states[this._selectedPlayer]?.attributes.repeat || 'off'; this._hass.callService('media_player', 'repeat_set', { entity_id: this._selectedPlayer, repeat: modes[(modes.indexOf(cur)+1)%modes.length] }); }
  _setVolume(level) { if (!this._selectedPlayer) return; this._hass.callService('media_player', 'volume_set', { entity_id: this._selectedPlayer, volume_level: Math.round(level*100)/100 }); }
  _toggleMute() { if (!this._selectedPlayer) return; const muted = this._hass.states[this._selectedPlayer]?.attributes.is_volume_muted; this._hass.callService('media_player', 'volume_mute', { entity_id: this._selectedPlayer, is_volume_muted: !muted }); }

  _startPoll() {
    this._updateNowPlaying();
    this._pollTimer = setInterval(() => this._updateNowPlaying(), 2000);
    this._progressTimer = setInterval(() => this._tickProgress(), 500);
  }

  _tickProgress() {
    if (!this._maQueueState) return;
    const { elapsed_time, elapsed_time_last_updated, state, current_item } = this._maQueueState;
    if (state !== 'playing') return;
    const dur = current_item?.duration || 0; if (!dur) return;
    const pos = elapsed_time + (Date.now()/1000 - elapsed_time_last_updated);
    const fill = this._$('progressFill'); if (fill) fill.style.width = Math.min(100, (pos/dur)*100) + '%';
  }

  _updateNowPlaying() {
    if (!this._selectedPlayer || !this._hass) return;
    const state = this._hass.states[this._selectedPlayer]; if (!state) return;
    const npKey = `${state.state}:${state.attributes.media_title}:${Math.floor((state.attributes.media_position||0)/5)}:${state.attributes.volume_level}:${state.attributes.shuffle}:${state.attributes.repeat}`;
    if (npKey === this._lastNpKey) return; this._lastNpKey = npKey;
    const isPlaying = state.state === 'playing';
    this._$('btnPlay').innerHTML = isPlaying ? '\u23f8\uFE0E' : '\u25b6\uFE0E';
    const shuffleBtn = this._$('btnShuffle'), repeatBtn = this._$('btnRepeat');
    shuffleBtn.classList.toggle('active', !!state.attributes.shuffle);
    const repeat = state.attributes.repeat || 'off';
    repeatBtn.classList.toggle('active', repeat !== 'off');
    repeatBtn.textContent = repeat === 'one' ? '\u21ba\uFE0E\u00b9' : '\u21ba\uFE0E';
    repeatBtn.title = `Repeat: ${repeat}`;
    this._$('npTitle').textContent  = state.attributes.media_title  || 'Nothing playing';
    this._$('npArtist').textContent = state.attributes.media_artist || '\u2014';
    const artPath = state.attributes.entity_picture_local || state.attributes.entity_picture || null;
    const artEl = this._$('npArt');
    if (artPath) { if (artEl.querySelector('img')?.getAttribute('src') !== artPath) artEl.innerHTML = `<img src="${artPath}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'" />`; }
    else artEl.textContent = '\u266a\uFE0E';
    const queueId = state.attributes.active_queue;
    if (queueId && this._wsReady) this._wsSend('player_queues/get', { queue_id: queueId }).then(q => { this._maQueueState = q; }).catch(() => {});
    else { const dur = state.attributes.media_duration || 0, pos = state.attributes.media_position || 0; if (dur) this._$('progressFill').style.width = Math.min(100,(pos/dur)*100)+'%'; }
    const vol = state.attributes.volume_level, muted = state.attributes.is_volume_muted;
    if (vol !== undefined) { const pct = Math.round(vol*100), slider = this._$('volSlider'); slider.value = pct; slider.style.setProperty('--vol-pct', pct+'%'); this._$('volIcon').textContent = muted ? '🔇︎' : vol<0.3 ? '🔈︎' : vol<0.7 ? '🔉︎' : '🔊︎'; }
    const contentId = state.attributes.media_content_id || '';
    if (contentId !== this._nowPlayingUri) { this._nowPlayingUri = contentId; this._highlightNowPlaying(); }
  }

  disconnectedCallback() {
    clearInterval(this._pollTimer); clearInterval(this._progressTimer); clearTimeout(this._searchTimer);
    if (this._imgObserver) { this._imgObserver.disconnect(); this._imgObserver = null; }
    if (this._ws) { this._ws.onclose = null; this._ws.close(); this._ws = null; }
    Object.values(this._imgCache).forEach(url => URL.revokeObjectURL(url));
    this._imgCache = {}; this._libCache = {};
    document.removeEventListener('click', () => this._dismissCtx());
  }

  getCardSize() { return 6; }
  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() { return { config_entry_id: 'YOUR_MA_CONFIG_ENTRY_ID', ma_url: 'http://YOUR_MA_IP:8095' }; }
}

customElements.define('ma-browser-card', MABrowserCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ma-browser-card',
  name: 'MA Browser Card',
  description: 'A full-featured Music Assistant browser card — browse albums, artists, tracks, radio and playlists with artwork, search, queue view and playback controls.',
  preview: true,
  documentationURL: 'https://github.com/PMizz13/ma-browser-card',
});
