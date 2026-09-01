/**
 * MA Browser Card  v3.8.1
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
 *   config_entry_id: 01JXXX...
 *   ma_url: http://192.168.1.x:8095
 *
 *   # Recommended
 *   ma_token: eyJ...                # enables Recently Played / Recently Added
 *
 *   # Layout
 *   height: 580
 *   sidebar_position: left          # left | top
 *   sidebar_width: 195
 *   player_position: bottom         # bottom | top
 *   show_title: true
 *   tile_size: 105                  # artwork size in px (scales grids + track thumbs)
 *
 *   # Appearance
 *   theme: auto                     # auto | dark | light | retro
 *   title: Music
 *   subtitle: Music Assistant
 *   icon: mdi:music
 *
 *   # Behaviour
 *   click_action: play              # play | enqueue | browse
 *                                    #   browse: albums/playlists open their track list instead
 *                                    #   of playing immediately (artists already do this).
 *                                    #   Right-click / long-press always shows the full menu,
 *                                    #   which also includes "Browse tracks" for albums and
 *                                    #   playlists regardless of this setting.
 *
 *   # Home screen sections (0 = hide)
 *   home_sections:
 *     favourite_playlists: 0
 *     favourite_albums: 0
 *     favourite_artists: 0
 *     favourite_tracks: 0
 *     radio: 50
 *     recently_played: 20
 *     recently_added: 20
 *     discover: 20
 *
 *   # Players (optional — omit to auto-detect)
 *   players:
 *     - media_player.kitchen
 *     - media_player.living_room
 *
 * ───────────────────────────────────────────────────────────────────────
 */

const CSS = `
  :host { display: block; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .card {
    --gold: #e5a00d; --gold-bg: rgba(229,160,13,0.13); --gold-border: rgba(229,160,13,0.25);
    --bg0: #111113; --bg2: #222228; --bg3: #2e2e38;
    --bg-sidebar: #0d0d10; --bg-player: #09090e;
    --t1: #f0f0f5; --t2: #9898aa; --t3: #55555f;
    --border: rgba(255,255,255,0.07); --sidebar: 195px;
    font-family: 'Outfit', 'Segoe UI', system-ui, sans-serif;
    display: flex; border-radius: 14px; overflow: hidden;
    background: var(--bg0); color: var(--t1); font-size: 13px;
    height: var(--card-height, 580px); position: relative;
  }
  .card.theme-light {
    --gold: var(--primary-color, #e5a00d);
    --gold-bg: color-mix(in srgb, var(--primary-color, #e5a00d) 12%, transparent);
    --gold-border: color-mix(in srgb, var(--primary-color, #e5a00d) 30%, transparent);
    --bg0:#f5f5f7; --bg2:#ffffff; --bg3:#e8e8ee; --bg-sidebar:#ebebef; --bg-player:#e0e0e6;
    --t1:#111113; --t2:#55555f; --t3:#9898aa; --border:rgba(0,0,0,0.08);
  }
  .card.theme-auto {
    --gold: var(--primary-color, #e5a00d);
    --gold-bg: color-mix(in srgb, var(--primary-color, #e5a00d) 12%, transparent);
    --gold-border: color-mix(in srgb, var(--primary-color, #e5a00d) 30%, transparent);
    --bg0:var(--primary-background-color,#111113); --bg2:var(--card-background-color,#222228);
    --bg3:var(--secondary-background-color,#2e2e38);
    --bg-sidebar:var(--sidebar-background-color,var(--primary-background-color,#0d0d10));
    --bg-player:var(--sidebar-background-color,var(--primary-background-color,#09090e));
    --t1:var(--primary-text-color,#f0f0f5); --t2:var(--secondary-text-color,#9898aa);
    --t3:var(--disabled-text-color,#55555f); --border:var(--divider-color,rgba(255,255,255,0.07));
  }
  .card.theme-retro {
    --gold:#22cc00; --gold-bg:rgba(34,204,0,0.1); --gold-border:rgba(34,204,0,0.3);
    --bg0:#c0c0c0; --bg2:#d4d0c8; --bg3:#b0aca4; --bg-sidebar:#b8b4ac; --bg-player:#1a1a1a;
    --t1:#000; --t2:#444; --t3:#888; --border:rgba(0,0,0,0.3);
    font-family:'Arial','Helvetica',sans-serif; font-size:16px;
  }
  .card.theme-retro,.card.theme-retro .sidebar,.card.theme-retro .logo,
  .card.theme-retro .logo-icon,.card.theme-retro .nav-btn,
  .card.theme-retro .a-art-wrap,.card.theme-retro .play-circle,
  .card.theme-retro .ar-img,.card.theme-retro .tr-art,
  .card.theme-retro .ctx-menu,.card.theme-retro .ctx-item,
  .card.theme-retro .search-wrap,.card.theme-retro .player-sel,
  .card.theme-retro .sec-btn,.card.theme-retro .sec-count,
  .card.theme-retro .retry-btn,.card.theme-retro .queue-panel,
  .card.theme-retro .queue-art,.card.theme-retro .queue-item,
  .card.theme-retro .np-art,.card.theme-retro .artist-hero,
  .card.theme-retro .artist-detail-back,.card.theme-retro .skel-art,
  .card.theme-retro .skel-line,.card.theme-retro .spinner { border-radius:0!important; }
  .card.theme-retro { background:linear-gradient(160deg,#d8d4cc 0%,#c0bcb4 30%,#b8b4ac 60%,#c8c4bc 100%); }
  .card.theme-retro .logo { background:linear-gradient(180deg,#1a1a1a 0%,#222 100%); border-bottom:2px solid #000; padding:8px 13px; }
  .card.theme-retro .logo-icon { background:#cccc00; border-top:2px solid #ffff88; border-left:2px solid #ffff88; border-bottom:2px solid #666600; border-right:2px solid #666600; }
  .card.theme-retro .logo-icon ha-icon { color:#000; --mdc-icon-color:#000; }
  .card.theme-retro .logo-name { color:#ffdd00; font-size:13px; font-weight:bold; letter-spacing:.06em; text-transform:uppercase; text-shadow:0 1px 2px rgba(0,0,0,.8); }
  .card.theme-retro .logo-sub { color:#fff; font-size:9px; letter-spacing:.12em; text-transform:uppercase; text-shadow:0 1px 1px rgba(0,0,0,.8); }
  .card.theme-retro .sidebar { background:linear-gradient(180deg,#202020 0%,#181818 50%,#1e1e1e 100%); border-right:2px solid #3a3a3a; }
  .card.theme-retro .nav-label { color:#555; font-size:9px; letter-spacing:.15em; text-transform:uppercase; }
  .card.theme-retro .nav-btn { font-size:11px; color:#787878; background:linear-gradient(180deg,#505050 0%,#2e2e2e 50%,#424242 100%); border-top:2px solid #3a3a3a; border-left:2px solid #3a3a3a; border-bottom:2px solid #080808; border-right:2px solid #080808; margin-bottom:3px; padding-left:22px; position:relative; }
  .card.theme-retro .nav-btn::before { content:''; position:absolute; left:7px; top:50%; transform:translateY(-50%); width:8px; height:8px; background:#333; border-top:1px solid #111; border-left:1px solid #111; border-bottom:1px solid #888; border-right:1px solid #888; box-shadow:inset 0 0 2px rgba(0,0,0,.5); }
  .card.theme-retro .nav-btn.active::before { background:radial-gradient(circle at 35% 35%,#88ff44,#22cc00 60%,#115500); box-shadow:0 0 4px rgba(34,204,0,.8),inset 0 0 2px rgba(255,255,255,.3); border-top-color:#44ff00; border-left-color:#44ff00; border-bottom-color:#115500; border-right-color:#115500; }
  .card.theme-retro .nav-btn:hover { background:linear-gradient(180deg,#acacac 0%,#8a8a8a 50%,#9e9e9e 100%); color:#000; }
  .card.theme-retro .nav-btn.active { background:linear-gradient(180deg,#acacac 0%,#8a8a8a 50%,#9e9e9e 100%); border-top:2px solid #707068; border-left:2px solid #707068; border-bottom:2px solid #e8e4dc; border-right:2px solid #e8e4dc; color:#000; }
  .card.theme-retro .player-bar { background:linear-gradient(180deg,#1a1a1a 0%,#111 100%); border-top:3px solid #000; }
  .card.theme-retro .np-title { color:#22cc00; font-size:12px; letter-spacing:.04em; font-weight:bold; }
  .card.theme-retro .np-artist { color:#158800; font-size:10px; }
  .card.theme-retro .ps-label { color:#444; font-size:9px; text-transform:uppercase; letter-spacing:.1em; }
  .card.theme-retro .ctrl-btn { color:#22cc00; font-size:14px; background:linear-gradient(180deg,#505050 0%,#2e2e2e 50%,#424242 100%); border-top:2px solid #3a3a3a; border-left:2px solid #3a3a3a; border-bottom:2px solid #080808; border-right:2px solid #080808; padding:3px 5px; border-radius:0!important; }
  .card.theme-retro .ctrl-btn:hover { color:#33ee00; background:linear-gradient(180deg,#bcbcbc 0%,#9a9a9a 50%,#aeaeae 100%); }
  .card.theme-retro .ctrl-btn.active { color:#22cc00; text-shadow:0 0 4px rgba(34,204,0,.5); }
  .card.theme-retro .ctrl-btn:active { border-top:2px solid #080808; border-left:2px solid #080808; border-bottom:2px solid #3a3a3a; border-right:2px solid #3a3a3a; }
  .card.theme-retro .ctrl-play { background:linear-gradient(180deg,#505050 0%,#2e2e2e 50%,#424242 100%); color:#22cc00; border-top:2px solid #3a3a3a; border-left:2px solid #3a3a3a; border-bottom:2px solid #080808; border-right:2px solid #080808; width:34px; height:34px; }
  .card.theme-retro .ctrl-play:hover { transform:none; background:linear-gradient(180deg,#bcbcbc 0%,#9a9a9a 50%,#aeaeae 100%); color:#33ee00; }
  .card.theme-retro .ctrl-play:active { border-top:2px solid #080808; border-left:2px solid #080808; border-bottom:2px solid #3a3a3a; border-right:2px solid #3a3a3a; }
  .card.theme-retro .progress-bar { background:#0a0a0a; height:5px; border-top:1px solid #000; border-bottom:1px solid #333; box-shadow:inset 0 1px 3px rgba(0,0,0,.9); }
  .card.theme-retro .progress-fill { background:linear-gradient(90deg,#22cc00,#44ff00); box-shadow:0 0 4px rgba(34,204,0,.6); }
  .card.theme-retro .vol-row { margin-top:8px; }
  .card.theme-retro .vol-slider { height:6px; -webkit-appearance:none; appearance:none; background:linear-gradient(to right,var(--vol-color,#22cc00) 0%,var(--vol-color,#22cc00) var(--vol-pct,50%),#1a1a1a var(--vol-pct,50%),#1a1a1a 100%)!important; border-top:1px solid #000; border-bottom:1px solid #444; }
  .card.theme-retro .vol-slider::-webkit-slider-thumb { -webkit-appearance:none; width:10px; height:16px; background:linear-gradient(180deg,#acacac 0%,#8a8a8a 50%,#9e9e9e 100%); border-top:2px solid #ccc; border-left:2px solid #ccc; border-bottom:2px solid #606060; border-right:2px solid #606060; cursor:pointer; border-radius:0!important; }
  .card.theme-retro .vol-slider::-moz-range-thumb { width:12px; height:18px; background:linear-gradient(180deg,#acacac 0%,#8a8a8a 50%,#9e9e9e 100%); border:2px solid #ccc; border-bottom-color:#606060; border-right-color:#606060; cursor:pointer; border-radius:0!important; }
  .card.theme-retro .vol-icon { color:#22cc00; font-size:14px; }
  .card.theme-retro .search-wrap { background:#181818; border-top:2px solid #0a0a0a; border-left:2px solid #0a0a0a; border-bottom:2px solid #4a4a4a; border-right:2px solid #4a4a4a; }
  .card.theme-retro .search-inp { color:#22cc00; font-size:13px; }
  .card.theme-retro .search-inp::placeholder { color:#336633; }
  .card.theme-retro .player-sel { background:#0f0f0f; border-top:2px solid #000; border-left:2px solid #000; border-bottom:2px solid #333; border-right:2px solid #333; color:#22cc00; font-size:11px; }
  .card.theme-retro .main { background:#222; }
  .card.theme-retro .topbar { background:#262626; border-bottom:2px solid #0a0a0a; }
  .card.theme-retro .a-name { color:#22cc00; font-size:12px; font-weight:bold; }
  .card.theme-retro .a-artist { color:#777; font-size:11px; }
  .card.theme-retro .sec-title { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:#cccc00; font-weight:bold; }
  .card.theme-retro .sec-count { background:#161616; border:1px solid #3a3a3a; color:#777; font-size:10px; }
  .card.theme-retro .a-art-wrap { border-top:2px solid #484848; border-left:2px solid #484848; border-bottom:2px solid #080808; border-right:2px solid #080808; background:#2a2a2a; }
  .card.theme-retro .play-circle { background:#1a1a1a; color:#22cc00; border-top:2px solid #444; border-left:2px solid #444; border-bottom:2px solid #000; border-right:2px solid #000; }
  .card.theme-retro .album-card.now-playing .a-art-wrap { border-top-color:#22cc00; border-left-color:#22cc00; border-bottom-color:#115500; border-right-color:#115500; }
  .card.theme-retro .sec-btn { font-size:10px; text-transform:uppercase; background:linear-gradient(180deg,#303030 0%,#1e1e1e 100%); color:#aaa; border-top:2px solid #505050; border-left:2px solid #505050; border-bottom:2px solid #080808; border-right:2px solid #080808; }
  .card.theme-retro .sec-btn:hover { background:linear-gradient(180deg,#3a3a3a 0%,#282828 100%); color:#ccc; }
  .card.theme-retro .track-row:hover { background:rgba(255,255,255,.05); }
  .card.theme-retro .track-row.playing { background:rgba(34,204,0,.12); }
  .card.theme-retro .tr-name { color:#22cc00; }
  .card.theme-retro .track-row.playing .tr-name { color:#22cc00; font-weight:bold; }
  .card.theme-retro .queue-panel { background:#1c1c1c; }
  .card.theme-retro .queue-header { border-bottom:2px solid #0a0a0a; }
  .card.theme-retro .queue-item:hover { background:rgba(255,255,255,.05); }
  .card.theme-retro .queue-item.active { background:rgba(34,204,0,.12); border-left:3px solid #22cc00; }
  .card.theme-retro .queue-item.active .qi-name { color:#22cc00; font-weight:bold; }
  .card.theme-retro .qi-name { color:#22cc00; }
  .card.theme-retro .qi-artist { color:#666; }
  .card.theme-retro .ctx-menu { background:#282828; border-top:2px solid #4a4a4a; border-left:2px solid #4a4a4a; border-bottom:2px solid #080808; border-right:2px solid #080808; box-shadow:3px 3px 0 rgba(0,0,0,.7); }
  .card.theme-retro .ctx-item { color:#ccc; font-size:12px; }
  .card.theme-retro .ctx-item:hover { background:#000080; color:#fff; }
  .card.theme-retro .spinner { border-color:#888; border-top-color:#22cc00; }
  /* TOP SIDEBAR */
  .card.sidebar-top { flex-direction:column; }
  .card.sidebar-top .sidebar { width:100%; flex-direction:column; border-right:none; border-bottom:1px solid var(--border); flex-shrink:0; height:auto; }
  .card.sidebar-top > .logo { border-bottom:1px solid var(--border); padding:10px 13px; order:0; flex-shrink:0; }
  .card.sidebar-top .sidebar { order:1; }
  .card.sidebar-top .main { order:2; }
  .card.sidebar-top .nav { display:flex; flex-direction:row; flex-wrap:wrap; padding:6px 8px; gap:2px; overflow:visible; }
  .card.sidebar-top .nav-label { display:none; }
  .card.sidebar-top .nav-btn { white-space:nowrap; margin-bottom:0; width:auto; }
  .card.sidebar-top .player-bar { border-top:1px solid var(--border); display:flex; flex-direction:row; align-items:center; gap:10px; padding:6px 12px; flex-shrink:0; flex-wrap:wrap; }
  .card.sidebar-top .np-row { margin-bottom:0; flex-shrink:0; min-width:140px; max-width:200px; }
  .card.sidebar-top .controls { margin-bottom:0; gap:8px; }
  .card.sidebar-top .progress-bar,.card.sidebar-top .ps-label { display:none; }
  .card.sidebar-top .player-sel { width:130px; }
  .card.sidebar-top .vol-row { margin-top:0; min-width:100px; }
  .card.sidebar-top.player-bottom { flex-direction:column; }
  .card.sidebar-top.player-bottom .sidebar { order:0; }
  .card.sidebar-top.player-bottom .main { order:1; flex:1; min-height:0; }
  .card.sidebar-top.player-bottom .player-footer { order:3; flex-shrink:0; border-top:1px solid var(--border); background:var(--bg-player); }
  .card.sidebar-top.player-bottom .sidebar .player-bar { display:none; }
  .card.sidebar-top .player-footer { display:flex; flex-direction:row; align-items:center; gap:10px; padding:6px 12px; flex-wrap:wrap; }
  .card.sidebar-top .player-footer .np-row { margin-bottom:0; flex-shrink:0; min-width:140px; max-width:200px; }
  .card.sidebar-top .player-footer .controls { margin-bottom:0; gap:8px; }
  .card.sidebar-top .player-footer .progress-bar,.card.sidebar-top .player-footer .ps-label { display:none; }
  .card.sidebar-top .player-footer .player-sel { width:130px; }
  .card.sidebar-top .player-footer .vol-row { margin-top:0; min-width:100px; }
  .card.player-top .sidebar { flex-direction:column; }
  .card.player-top .sidebar .logo { order:0; }
  .card.player-top .sidebar .player-bar { order:1; border-top:none; border-bottom:1px solid var(--border); }
  .card.player-top .sidebar .nav { order:2; }
  /* SIDEBAR */
  .sidebar { width:var(--sidebar); background:var(--bg-sidebar); display:flex; flex-direction:column; flex-shrink:0; border-right:1px solid var(--border); }
  .logo { display:flex; align-items:center; gap:9px; padding:15px 13px 13px; border-bottom:1px solid var(--border); }
  .logo-icon { width:30px; height:30px; background:var(--gold); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; color:#111; flex-shrink:0; }
  .logo-name { font-size:14px; font-weight:600; color:var(--t1); letter-spacing:-0.2px; }
  .logo-sub { font-size:10px; color:var(--t3); }
  .nav { padding:10px 8px; flex:1; overflow-y:auto; }
  .nav-label { font-size:9px; text-transform:uppercase; letter-spacing:.1em; color:var(--t3); padding:8px 8px 4px; font-weight:500; }
  .nav-btn { display:flex; align-items:center; gap:9px; padding:8px; border-radius:7px; cursor:pointer; color:var(--t2); font-size:12.5px; transition:all .14s; margin-bottom:1px; border:1px solid transparent; background:none; width:100%; text-align:left; font-family:inherit; }
  .nav-btn:hover { background:var(--bg2); color:var(--t1); }
  .nav-btn.active { background:var(--gold-bg); color:var(--gold); border-color:var(--gold-border); font-weight:500; }
  .nav-ico { width:16px; text-align:center; font-size:14px; flex-shrink:0; }
  /* PLAYER BAR */
  .player-bar { padding:11px; border-top:1px solid var(--border); background:var(--bg-player); }
  .np-row { display:flex; align-items:center; gap:8px; margin-bottom:9px; cursor:pointer; }
  .np-art { width:38px; height:38px; border-radius:6px; background:var(--bg3); flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:18px; transition:opacity .14s; }
  .np-art:hover { opacity:.8; }
  .np-art img { width:100%; height:100%; object-fit:cover; }
  .np-info { flex:1; min-width:0; }
  .np-title { font-size:12px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .np-artist { font-size:11px; color:var(--t3); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .controls { display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:8px; }
  .ctrl-btn { background:none; border:none; color:var(--t2); cursor:pointer; font-size:15px; padding:2px; line-height:1; transition:color .12s; }
  .ctrl-btn:hover { color:var(--t1); }
  .ctrl-btn.active { color:var(--gold); }
  .ctrl-play { width:30px; height:30px; background:var(--gold); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#111; font-size:12px; border:none; cursor:pointer; transition:transform .1s; }
  .ctrl-play:hover { transform:scale(1.08); }
  .progress-bar { height:3px; background:var(--bg3); border-radius:2px; margin-bottom:10px; cursor:pointer; }
  .progress-fill { height:100%; background:var(--gold); border-radius:2px; width:0; transition:width 1s linear; }
  .ps-label { font-size:10px; color:var(--t3); margin-bottom:4px; }
  .player-sel { width:100%; background:var(--bg2); border:1px solid var(--border); color:var(--t1); font-size:11px; padding:5px 7px; border-radius:6px; outline:none; cursor:pointer; font-family:inherit; }
  .player-sel:focus { border-color:var(--gold); }
  .vol-row { display:flex; align-items:center; gap:7px; margin-top:8px; }
  .vol-icon { font-size:12px; color:var(--t3); flex-shrink:0; cursor:pointer; width:20px; text-align:center; display:inline-block; }
  .vol-slider { flex:1; -webkit-appearance:none; appearance:none; height:3px; border-radius:2px; outline:none; cursor:pointer; background:linear-gradient(to right,var(--gold) 0%,var(--gold) var(--vol-pct,50%),var(--bg3) var(--vol-pct,50%),var(--bg3) 100%); }
  .vol-slider::-webkit-slider-thumb { -webkit-appearance:none; width:13px; height:13px; border-radius:50%; background:var(--gold); cursor:pointer; }
  .vol-slider::-moz-range-thumb { width:13px; height:13px; border:none; border-radius:50%; background:var(--gold); cursor:pointer; }
  /* MAIN */
  .main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .topbar { display:flex; align-items:center; gap:9px; padding:10px 13px; border-bottom:1px solid var(--border); flex-shrink:0; }
  .search-wrap { flex:1; display:flex; align-items:center; background:var(--bg2); border:1px solid var(--border); border-radius:20px; padding:6px 11px; gap:7px; transition:border-color .14s; }
  .search-wrap:focus-within { border-color:var(--gold-border); }
  .search-inp { background:none; border:none; color:var(--t1); font-size:12.5px; outline:none; flex:1; font-family:inherit; }
  .search-inp::placeholder { color:var(--t3); }
  .search-clear { background:none; border:none; color:var(--t3); cursor:pointer; font-size:14px; line-height:1; padding:0; display:none; }
  .search-clear.visible { display:block; }
  .scroll { flex:1; overflow-y:auto; padding:13px; scrollbar-width:thin; scrollbar-color:var(--bg3) transparent; }
  .scroll::-webkit-scrollbar { width:4px; }
  .scroll::-webkit-scrollbar-thumb { background:var(--bg3); border-radius:2px; }
  /* SECTIONS */
  .section { margin-bottom:22px; }
  .sec-hdr { display:flex; align-items:center; gap:8px; margin-bottom:11px; flex-wrap:wrap; }
  .sec-title { font-size:13px; font-weight:600; color:var(--t1); }
  .sec-count { font-size:10px; color:var(--t3); background:var(--bg2); padding:2px 7px; border-radius:10px; border:1px solid var(--border); }
  .sec-actions { display:flex; gap:5px; margin-left:auto; }
  .sec-btn { background:var(--bg2); border:1px solid var(--border); color:var(--t2); font-size:10px; padding:3px 9px; border-radius:10px; cursor:pointer; font-family:inherit; transition:all .12s; white-space:nowrap; }
  .sec-btn:hover { background:var(--gold-bg); border-color:var(--gold-border); color:var(--gold); }
  /* ALBUM / RADIO GRID */
  .album-grid,.radio-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(var(--art-size,105px),1fr)); gap:11px; }
  .album-card { cursor:pointer; position:relative; }
  .album-card.now-playing .a-art-wrap { border-color:var(--gold); box-shadow:0 0 0 1px var(--gold); }
  .a-art-wrap { width:100%; aspect-ratio:1; border-radius:8px; background:var(--bg2); margin-bottom:6px; position:relative; overflow:hidden; border:1px solid var(--border); transition:transform .14s,border-color .14s; display:flex; align-items:center; justify-content:center; }
  .album-card:hover .a-art-wrap { transform:translateY(-2px); }
  .a-art-wrap img { width:100%; height:100%; object-fit:cover; display:block; position:absolute; inset:0; }
  .a-art-wrap svg { flex-shrink:0; }
  .a-overlay { position:absolute; inset:0; background:rgba(0,0,0,.52); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .14s; z-index:2; }
  .album-card:hover .a-overlay { opacity:1; }
  .play-circle { width:36px; height:36px; background:var(--gold); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#111; font-size:13px; transform:scale(.85); transition:transform .14s; }
  .album-card:hover .play-circle { transform:scale(1); }
  .playing-badge { position:absolute; bottom:5px; left:5px; z-index:3; background:var(--gold); border-radius:4px; padding:2px 5px; font-size:9px; color:#111; font-weight:600; display:none; }
  .album-card.now-playing .playing-badge { display:block; }
  .a-name { font-size:11.5px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--t1); }
  .a-artist { font-size:10.5px; color:var(--t3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
  .a-year { font-size:10px; color:var(--t3); opacity:.7; }
  /* ARTIST GRID */
  .artist-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(calc(var(--art-size,105px) * 0.905),1fr)); gap:13px; }
  .artist-card { cursor:pointer; text-align:center; }
  .ar-img { width:calc(var(--art-size,105px) * 0.724); height:calc(var(--art-size,105px) * 0.724); border-radius:50%; background:var(--bg2); margin:0 auto 7px; overflow:hidden; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:26px; color:var(--t3); transition:border-color .14s,transform .14s; }
  .artist-card:hover .ar-img { border-color:var(--gold); transform:scale(1.04); }
  .ar-img img { width:100%; height:100%; object-fit:cover; }
  .ar-img svg { flex-shrink:0; }
  .ar-name { font-size:11.5px; font-weight:500; }
  /* TRACK LIST */
  .track-row { display:flex; align-items:center; gap:10px; padding:6px 8px; border-radius:7px; cursor:pointer; transition:background .1s; }
  .track-row:hover { background:var(--bg2); }
  .track-row.playing { background:var(--gold-bg); }
  .tr-num { width:18px; font-size:11px; color:var(--t3); text-align:center; flex-shrink:0; }
  .track-row.playing .tr-num { color:var(--gold); }
  .tr-art { width:calc(var(--art-size,105px) * 0.305); height:calc(var(--art-size,105px) * 0.305); border-radius:4px; background:var(--bg3); flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:15px; }
  .tr-art img { width:100%; height:100%; object-fit:cover; }
  .tr-art svg { flex-shrink:0; }
  .tr-info { flex:1; min-width:0; }
  .tr-name { font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .track-row.playing .tr-name { color:var(--gold); font-weight:500; }
  .tr-meta { font-size:11px; color:var(--t3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .tr-dur { font-size:11px; color:var(--t3); flex-shrink:0; }
  /* CONTEXT MENU */
  .ctx-menu { position:fixed; background:var(--bg2); border:1px solid var(--border); border-radius:9px; padding:5px; z-index:999; min-width:160px; box-shadow:0 8px 24px rgba(0,0,0,.6); }
  .ctx-item { display:flex; align-items:center; gap:9px; padding:8px 11px; border-radius:6px; cursor:pointer; font-size:12.5px; color:var(--t1); transition:background .1s; }
  .ctx-item:hover { background:var(--bg3); }
  .ctx-ico { font-size:14px; width:18px; text-align:center; }
  /* QUEUE PANEL */
  .queue-panel { position:absolute; inset:0; background:var(--bg-sidebar); display:flex; flex-direction:column; z-index:10; animation:slideUp .2s ease; }
  @keyframes slideUp { from { transform:translateY(20px); opacity:0; } to { transform:none; opacity:1; } }
  .queue-header { display:flex; align-items:center; gap:10px; padding:14px; border-bottom:1px solid var(--border); flex-shrink:0; }
  .queue-art { width:48px; height:48px; border-radius:7px; background:var(--bg3); overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:22px; }
  .queue-art img { width:100%; height:100%; object-fit:cover; }
  .queue-title-wrap { flex:1; min-width:0; }
  .queue-title { font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .queue-subtitle { font-size:11px; color:var(--t3); margin-top:2px; }
  .queue-close { background:none; border:none; color:var(--t2); font-size:18px; cursor:pointer; padding:4px; flex-shrink:0; }
  .queue-close:hover { color:var(--t1); }
  .queue-scroll { flex:1; overflow-y:auto; padding:8px; scrollbar-width:thin; scrollbar-color:var(--bg3) transparent; }
  .queue-item { display:flex; align-items:center; gap:9px; padding:7px 8px; border-radius:7px; cursor:pointer; transition:background .1s; }
  .queue-item:hover { background:var(--bg2); }
  .queue-item.active { background:var(--gold-bg); }
  .queue-item.active .qi-name { color:var(--gold); font-weight:500; }
  .queue-item.past { opacity:.45; }
  .qi-num { width:20px; font-size:11px; color:var(--t3); text-align:center; flex-shrink:0; }
  .queue-item.active .qi-num { color:var(--gold); }
  .qi-art { width:30px; height:30px; border-radius:4px; background:var(--bg3); flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:13px; }
  .qi-art img { width:100%; height:100%; object-fit:cover; }
  .qi-info { flex:1; min-width:0; }
  .qi-name { font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .qi-artist { font-size:10.5px; color:var(--t3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .qi-dur { font-size:11px; color:var(--t3); flex-shrink:0; }
  /* ARTIST DETAIL */
  .artist-hdr { display:flex; gap:13px; margin-bottom:16px; align-items:flex-start; }
  .artist-hero { width:90px; height:90px; border-radius:50%; background:var(--bg2); flex-shrink:0; overflow:hidden; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:36px; }
  .artist-hero img { width:100%; height:100%; object-fit:cover; }
  .artist-detail-name { font-size:17px; font-weight:600; margin-bottom:6px; }
  .artist-detail-back { background:var(--bg2); color:var(--t1); border:1px solid var(--border); padding:6px 12px; border-radius:20px; font-size:12px; cursor:pointer; font-family:inherit; transition:background .13s; }
  .artist-detail-back:hover { background:var(--bg3); }
  /* SKELETON */
  .skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(105px,1fr)); gap:11px; }
  .skel-art { width:100%; aspect-ratio:1; border-radius:8px; background:var(--bg2); margin-bottom:6px; animation:shimmer 1.4s ease infinite; }
  .skel-line { height:10px; border-radius:5px; background:var(--bg2); margin-bottom:5px; animation:shimmer 1.4s ease infinite; }
  .skel-line.short { width:60%; }
  @keyframes shimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }
  /* STATE */
  .state-box { display:flex; flex-direction:column; align-items:center; justify-content:center; height:180px; gap:10px; color:var(--t3); text-align:center; padding:0 20px; }
  .spinner { width:22px; height:22px; border:2px solid var(--bg3); border-top-color:var(--gold); border-radius:50%; animation:spin .75s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .err-txt { font-size:12px; line-height:1.6; color:var(--t2); }
  .retry-btn { background:var(--gold-bg); color:var(--gold); border:1px solid var(--gold-border); padding:7px 16px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; margin-top:4px; }
  .retry-btn:hover { background:var(--gold); color:#111; }
  /* Disable native touch interactions on scroll content */
  .scroll .album-card, .scroll .track-row, .scroll .artist-card { -webkit-touch-callout: none; user-select: none; -webkit-user-select: none; }
  .a-art-wrap, .ar-img, .tr-art { -webkit-touch-callout: none; }
`;

class MABrowserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null; this._config = {}; this._maUrl = '';
    this._view = 'home'; this._players = []; this._selectedPlayer = null;
    this._pollTimer = null; this._searchTimer = null; this._built = false;
    this._imgCache = {}; this._imgObserver = null;
    this._libCache = {}; this._libCacheTTL = 300000;
    this._lastNpKey = ''; this._nowPlayingUri = '';
    this._queueVisible = false; this._ctxMenu = null;
    this._ws = null; this._wsReady = false; this._wsMsgId = 100; this._wsPending = {};
    this._maQueueState = null; this._progressTimer = null;
  }

  setConfig(config) {
    if (!config.config_entry_id) throw new Error('ma-browser-card: config_entry_id is required.\nFind it in HA \u2192 Settings \u2192 Devices & Services \u2192 Music Assistant \u2192 Configure.\nThe URL contains it: ...?config_entry=01JXXX...');
    if (!config.ma_url) throw new Error('ma-browser-card: ma_url is required.\nSet it to your Music Assistant URL, e.g. http://192.168.1.x:8095');
    this._config = config;
    this._maUrl = config.ma_url.replace(/\/$/, '');
    this._maToken = config.ma_token || '';
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; this._init(); }
    else if (this._players.length === 0) this._loadPlayers();
  }

  _build() {
    const height       = this._config.height || 580;
    const tileSize     = this._config.tile_size || 105;
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
    const classes = [themeClass, sidebarTop ? 'sidebar-top' : 'sidebar-left', playerTop ? 'player-top' : 'player-bottom'].filter(Boolean).join(' ');

    const playerBarHtml = `<div class="player-bar">
        <div class="np-row" id="npRow"><div class="np-art" id="npArt">&#9834;&#xFE0E;</div>
          <div class="np-info"><div class="np-title" id="npTitle">Nothing playing</div><div class="np-artist" id="npArtist">&mdash;</div></div></div>
        <div class="controls">
          <button class="ctrl-btn" id="btnShuffle" title="Shuffle">&#x21C4;&#xFE0E;</button>
          <button class="ctrl-btn" id="btnPrev">&#x23EE;&#xFE0E;</button>
          <button class="ctrl-play" id="btnPlay">&#x25B6;&#xFE0E;</button>
          <button class="ctrl-btn" id="btnNext">&#x23ED;&#xFE0E;</button>
          <button class="ctrl-btn" id="btnRepeat" title="Repeat">&#x21BA;&#xFE0E;</button>
          <button class="ctrl-btn" id="btnClearQueue" title="Clear queue">&#x2298;&#xFE0E;</button>
        </div>
        <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
        <div class="ps-label">Playing on</div>
        <select class="player-sel" id="playerSel"><option value="">Loading&hellip;</option></select>
        <div class="vol-row">
          <span class="vol-icon" id="volIcon">&#128264;&#xFE0E;</span>
          <input class="vol-slider" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%" />
        </div>
      </div>`;

    const logoHtml = showTitle ? `<div class="logo">
        <div class="logo-icon"><ha-icon icon="${cardIcon}" style="--mdc-icon-size:18px;color:#111;"></ha-icon></div>
        <div><div class="logo-name">${cardTitle}</div><div class="logo-sub">${cardSubtitle}</div></div>
      </div>` : '';

    const navHtml = `<nav class="nav">
        <div class="nav-label">Library</div>
        <button class="nav-btn active" data-view="home"><span class="nav-ico">&#x2302;&#xFE0E;</span>Home</button>
        <button class="nav-btn" data-view="radio"><span class="nav-ico">&#x223F;&#xFE0E;</span>Radio</button>
        <button class="nav-btn" data-view="albums"><span class="nav-ico">&#x25C9;&#xFE0E;</span>Albums</button>
        <button class="nav-btn" data-view="artists"><span class="nav-ico">&#x266A;&#xFE0E;</span>Artists</button>
        <button class="nav-btn" data-view="tracks"><span class="nav-ico">&#x266B;&#xFE0E;</span>Tracks</button>
        <button class="nav-btn" data-view="playlists"><span class="nav-ico">&#x2630;&#xFE0E;</span>Playlists</button>
      </nav>`;

    const outerLogo    = sidebarTop ? logoHtml : '';
    const innerContent = playerTop
      ? (sidebarTop ? '' : logoHtml) + playerBarHtml + navHtml
      : (sidebarTop ? '' : logoHtml) + navHtml + (sidebarTop ? '' : playerBarHtml);
    const bottomPlayer = (sidebarTop && !playerTop)
      ? playerBarHtml.replace('class="player-bar"', 'class="player-bar player-footer"')
      : '';

    this.shadowRoot.innerHTML = `<style>${CSS}</style>
    <div class="card ${classes}" style="--card-height:${height}px;--sidebar:${sidebarWidth};--art-size:${tileSize}px">
      ${outerLogo}<div class="sidebar">${innerContent}</div>
      <div class="main">
        <div class="topbar"><div class="search-wrap">
          <span style="font-size:14px;color:var(--t3)">&#x2315;&#xFE0E;</span>
          <input class="search-inp" id="searchInp" type="text" placeholder="Search everything&hellip;" />
          <button class="search-clear" id="searchClear">&#x2715;&#xFE0E;</button>
        </div></div>
        <div class="scroll" id="scroll"><div class="state-box"><div class="spinner"></div><span>Connecting&hellip;</span></div></div>
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
    this.shadowRoot.getElementById('btnClearQueue').addEventListener('click', () => this._clearQueue());
    this.shadowRoot.getElementById('npRow').addEventListener('click', () => this._toggleQueue());
    const volEl = this.shadowRoot.getElementById('volSlider');
    volEl.addEventListener('input', e => {
      const pct = e.target.value;
      volEl.style.setProperty('--vol-pct', pct + '%');
      volEl.style.setProperty('--vol-color', this._volColor(+pct));
      const v = pct / 100;
      this.shadowRoot.getElementById('volIcon').innerHTML = v === 0 ? '&#128263;&#xFE0E;' : v < 0.3 ? '&#128264;&#xFE0E;' : v < 0.7 ? '&#128265;&#xFE0E;' : '&#128266;&#xFE0E;';
      this._setVolume(v);
    });
    this.shadowRoot.getElementById('volIcon').addEventListener('click', () => this._toggleMute());
    this._attachClickHandler();
    this._boundDismissCtx = () => this._dismissCtx();
    document.addEventListener('click', this._boundDismissCtx);
    this.shadowRoot.addEventListener('click', e => { if (this._ctxMenu && !this._ctxMenu.contains(e.target)) this._dismissCtx(); });
    // Suppress native context menu on images so our long-press handler works
    this.shadowRoot.addEventListener('contextmenu', e => {
      if (e.target.closest('.scroll')) e.preventDefault();
    });
  }

  async _init() {
    try {
      this._loadPlayers(); this._connectMA();
      await this._renderHome(); this._startPoll();
      setTimeout(() => { if (this._players.length === 0) this._loadPlayers(); }, 3000);
      setTimeout(async () => { if (this._wsReady && this._view === 'home') await this._renderHome(); }, 4000);
    } catch(e) { this._err(e); }
  }

  _$ = id => this.shadowRoot.getElementById(id);
  _scroll = () => this._$('scroll');
  _skeleton(count=8) { return `<div class="section"><div class="skeleton-grid">${Array.from({length:count},()=>`<div class="skel-card"><div class="skel-art"></div><div class="skel-line"></div><div class="skel-line short"></div></div>`).join('')}</div></div>`; }
  _loading() { if (this._imgObserver) this._imgObserver.disconnect(); this._scroll().innerHTML = this._skeleton(); }
  _err(e, retryFn) {
    const msg = e?.message||String(e);
    this._scroll().innerHTML = `<div class="state-box"><div>&#x26A0;</div><div class="err-txt">${msg}</div>${retryFn?`<button class="retry-btn" id="retryBtn">Try again</button>`:''}</div>`;
    if (retryFn) { const btn=this._scroll().querySelector('#retryBtn'); if(btn) btn.addEventListener('click',retryFn); }
  }
  _esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  _fmtDur(sec) { if(!sec) return''; return `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,'0')}`; }
  _artUrl(item) { if(!item) return null; return item.image||item.image_url||item.album?.image||item.album?.image_url||null; }
  _artistName(item) { return item?.artists?.length ? item.artists.map(a=>a.name).join(', ') : ''; }

  // ── Placeholders ─────────────────────────────────────────────
  // SVG fallbacks used when MA logo image fails or for specific types
  _svgPlaceholder(mediaType) {
    const c = 'var(--t3)';
    switch (mediaType) {
      case 'playlist':
        return `<svg viewBox="0 0 24 24" width="40%" height="40%" fill="${c}"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z"/></svg>`;
      case 'radio':
        return `<svg viewBox="0 0 24 24" width="40%" height="40%" fill="${c}"><path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 002 2h16a2 2 0 002-2V8c0-1.1-.9-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM12 18a3 3 0 110-6 3 3 0 010 6zm7-10a1 1 0 110 2 1 1 0 010-2z"/></svg>`;
      case 'track':
        return `<svg viewBox="0 0 24 24" width="40%" height="40%" fill="${c}"><path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/></svg>`;
      case 'artist':
        return `<svg viewBox="0 0 24 24" width="50%" height="50%" fill="${c}"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" width="40%" height="40%" fill="${c}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-5.5a1 1 0 100 2 1 1 0 000-2z"/></svg>`;
    }
  }

  // For tracks and artists: SVG is more meaningful (music note / person).
  // For albums, playlists, radio: MA logo is loaded via _loadMaLogo().
  // _placeholder() returns the SVG as an immediate render; _loadMaLogo() 
  // then replaces it with the MA logo if the fetch succeeds.
  _placeholder(mediaType) {
    return this._svgPlaceholder(mediaType);
  }

  // Render the MA logo SVG as placeholder — matches MA's own branding,
  // no network request needed, always works regardless of ma_url accessibility.
  _loadMaLogo(el, mediaType) {
    if (!el || !el.isConnected) return;
    el.innerHTML = `<svg width="100%" height="100%" style="display:block;position:absolute;inset:0;object-fit:cover;" preserveAspectRatio="xMidYMax meet" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M109.394 4.3814C115.242 -1.46047 124.788 -1.46047 130.606 4.3814L229.394 103.269C235.242 109.111 240 120.643 240 128.907V219.017L239.995 219.373C239.789 227.459 233.114 234.001 225 234.001H15C6.75759 234.001 2.40473e-05 227.22 0 218.987V128.877C0.000120331 120.613 4.78834 109.081 10.6064 103.239L109.394 4.3814Z" fill="#F2F4F9"/> <path d="M109.394 4.3814C115.242 -1.46047 124.788 -1.46047 130.606 4.3814L229.394 103.269C235.242 109.111 240 120.643 240 128.907V219.017L239.995 219.373C239.789 227.459 233.114 234.001 225 234.001H15C6.75759 234.001 2.40473e-05 227.22 0 218.987V128.877C0.000120331 120.613 4.78834 109.081 10.6064 103.239L109.394 4.3814ZM36 120.001C31.5817 120.001 28 123.582 28 128.001V206.001H44V128.001C44 123.582 40.4183 120.001 36 120.001ZM68 120.001C63.5817 120.001 60 123.582 60 128.001V206.001H76V128.001C76 123.582 72.4183 120.001 68 120.001ZM100 120.001C95.5817 120.001 92 123.582 92 128.001V206.001H108V128.001C108 123.582 104.418 120.001 100 120.001ZM158.393 120.427C154.2 119.032 149.671 121.3 148.275 125.492L121.479 206.001H138.342L163.456 130.544C164.851 126.352 162.584 121.823 158.393 120.427ZM188.708 125.492C187.313 121.3 182.783 119.032 178.591 120.427C174.399 121.823 172.131 126.352 173.526 130.544L198.642 206.001H215.504L188.708 125.492Z" fill="#18BCF2"/> </svg>`;  }

  async _loadImgInto(url, el, ph, maLogoType = null) {
    if (!url) {
      if (maLogoType) this._loadMaLogo(el, maLogoType); else el.innerHTML = ph;
      return;
    }
    if (this._imgCache[url]) {
      if (el.isConnected) {
        el.innerHTML = '';
        el.style.backgroundImage = `url("${this._imgCache[url]}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
      return;
    }
    // Use a hidden img to load/verify the URL, then apply as background-image.
    // background-image never triggers the iOS native image callout/save sheet.
    const img = document.createElement('img');
    img.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
    img.onload = () => {
      this._imgCache[url] = url;
      if (el.isConnected) {
        el.innerHTML = '';
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    };
    img.onerror = () => {
      if (!el.isConnected) return;
      if (maLogoType) this._loadMaLogo(el, maLogoType); else el.innerHTML = ph;
    };
    img.src = url;
    if (el.isConnected) el.appendChild(img);
  }

  _hydrateImages() {
    // Load MA logo into placeholder elements that support it
    const logoEls = this._scroll().querySelectorAll('[data-ma-logo]');
    logoEls.forEach(el => {
      const type = el.dataset.maLogo;
      delete el.dataset.maLogo;
      this._loadMaLogo(el, type);
    });
    const els = this._scroll().querySelectorAll('[data-img]'); if (!els.length) return;
    if (!this._imgObserver) {
      this._imgObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target; this._imgObserver.unobserve(el);
          const url = el.dataset.img;
          const type = el.dataset.placeholderType;
          const useMaLogo = type && type !== 'track' && type !== 'artist';
          delete el.dataset.img; delete el.dataset.placeholderType;
          this._loadImgInto(url, el, this._placeholder(type || 'album'), useMaLogo ? type : null);
        });
      }, { root: this._scroll(), rootMargin: '100px' });
    }
    els.forEach(el => this._imgObserver.observe(el));
  }

  async _callService(service, data) {
    return this._hass.connection.sendMessagePromise({ type:'call_service', domain:'music_assistant', service, service_data:{ config_entry_id:this._config.config_entry_id, ...data }, return_response:true });
  }
  async _fetchLibrary(mediaType, orderBy, limit, favoritesOnly=false) {
    const data={media_type:mediaType,order_by:orderBy,limit}; if(favoritesOnly) data.favorite=true;
    const res=await this._callService('get_library',data); if(!res) return [];
    const r=res.response??res; return r.items??(Array.isArray(r)?r:[]);
  }
  async _getLibrary(mediaType, orderBy='sort_name', limit=500, favoritesOnly=false) {
    const key=`${mediaType}:${orderBy}:${limit}:${favoritesOnly}`;
    const cached=this._libCache[key]; if(cached&&(Date.now()-cached.ts<this._libCacheTTL)) return cached.items;
    const data={media_type:mediaType,order_by:orderBy,limit}; if(favoritesOnly) data.favorite=true;
    const res=await this._callService('get_library',data); if(!res) return [];
    const r=res.response??res; const items=r.items??(Array.isArray(r)?r:[]);
    this._libCache[key]={items,ts:Date.now()}; return items;
  }
  async _search(query) {
    const res=await this._callService('search',{name:query,media_type:['album','artist','track','radio','playlist'],limit:20});
    return res?.response??res??{};
  }
  async _playMedia(uri, mediaType, enqueue='play') {
    if(!this._selectedPlayer){alert('Select a player first');return;}
    const isShuffle    = enqueue === 'shuffle';
    const isShuffleAdd = enqueue === 'shuffle_add';
    const isPlayNow    = enqueue === 'play' || isShuffle;
    // Clear queue before "play now" / "shuffle now" via HA service —
    // works both locally and remotely (Nabu Casa), unlike the direct MA WS.
    if(isPlayNow) {
      try { await this._hass.callService('media_player','clear_playlist',{entity_id:this._selectedPlayer}); }
      catch(e) { console.warn('[MA Card] clear_playlist failed:', e); }
    }
    if(isShuffle || isShuffleAdd) {
      await this._hass.callService('media_player','shuffle_set',{entity_id:this._selectedPlayer,shuffle:true});
    }
    // Preserve correct enqueue value for each action:
    // play/shuffle → 'play', next → 'next', add/shuffle_add → 'add'
    const maEnqueue = (enqueue === 'add' || isShuffleAdd) ? 'add' : enqueue === 'next' ? 'next' : 'play';
    await this._hass.callService('music_assistant','play_media',{entity_id:this._selectedPlayer,media_id:uri,media_type:mediaType||'album',enqueue:maEnqueue});
    this._lastNpKey='';
  }

  // ── MA WEBSOCKET ──────────────────────────────────────────────
  async _waitForWS() {
    if(this._wsReady) return true; if(!this._ws) return false;
    await new Promise(resolve=>{
      const check=setInterval(()=>{if(this._wsReady){clearInterval(check);resolve();}},200);
      setTimeout(()=>{clearInterval(check);resolve();},5000);
    });
    return this._wsReady;
  }
  _connectMA() {
    if(!this._maToken||!this._maUrl) return;
    if(this._ws){this._ws.close();this._ws=null;}
    const wsUrl=this._maUrl.replace('http://','ws://').replace('https://','wss://')+'/ws';
    const ws=new WebSocket(wsUrl); this._ws=ws; this._wsReady=false; this._wsGreeted=false;
    ws.onmessage=e=>{
      const msg=JSON.parse(e.data);
      if(!this._wsGreeted){this._wsGreeted=true;console.debug('[MA Card] MA WS first message:',msg);}
      if(msg.server_version&&!msg.message_id){ws.send(JSON.stringify({message_id:'auth',command:'auth',args:{token:this._maToken}}));return;}
      if(msg.message_id==='auth'){
        if(msg.result?.authenticated){this._wsReady=true;}
        else{console.error('[MA Card] MA WS auth did not succeed \u2014 full response:',msg);}
        return;
      }
      const pending=this._wsPending[msg.message_id];
      if(pending){delete this._wsPending[msg.message_id];msg.error_code?pending.reject(new Error(msg.details||'MA error '+msg.error_code)):pending.resolve(msg.result);}
    };
    ws.onerror=()=>{this._wsReady=false;};
    ws.onclose=()=>{this._wsReady=false;setTimeout(()=>{if(this._maToken)this._connectMA();},10000);};
  }
  _wsSend(command,args={}) {
    return new Promise((resolve,reject)=>{
      if(!this._ws||!this._wsReady){reject(new Error('MA WS not ready'));return;}
      const id=String(++this._wsMsgId); this._wsPending[id]={resolve,reject};
      this._ws.send(JSON.stringify({message_id:id,command,args}));
      setTimeout(()=>{if(this._wsPending[id]){delete this._wsPending[id];reject(new Error('MA WS timeout'));}},10000);
    });
  }
  async _fetchRecentlyAdded(limit=20) {
    if(!this._maToken) return [];
    if(!await this._waitForWS()) return [];
    try { const r=await this._wsSend('music/albums/library_items',{order_by:'timestamp_added_desc',limit}); return r?.items??(Array.isArray(r)?r:[]); }
    catch(e){console.warn('[MA Card] recently_added failed:',e.message);return[];}
  }
  async _fetchRecentlyPlayed(limit=20) {
    if(!this._maToken) return [];
    if(!await this._waitForWS()) return [];
    try {
      const items=await this._wsSend('music/recently_played_items',{limit,media_types:['album','artist','playlist']});
      const seen=new Set(); return(Array.isArray(items)?items:[]).filter(i=>{const key=i.uri||i.name;if(seen.has(key))return false;seen.add(key);return true;});
    } catch(e){console.warn('[MA Card] recently_played failed:',e.message);return[];}
  }

  // ── PLAYERS ───────────────────────────────────────────────────
  _loadPlayers() {
    const sel=this._$('playerSel'); let entities=[];
    if(this._config.players?.length) entities=this._config.players.map(eid=>this._hass.states[eid]).filter(Boolean);
    if(!entities.length) entities=Object.values(this._hass.states).filter(e=>{if(!e.entity_id.startsWith('media_player.'))return false;const a=e.attributes;return a.app_id==='music_assistant'||a.mass_player_type||a.active_queue;});
    if(!entities.length) entities=Object.values(this._hass.states).filter(e=>e.entity_id.startsWith('media_player.'));
    this._players=entities;
    sel.innerHTML=entities.length?entities.map(e=>`<option value="${e.entity_id}">${this._esc(e.attributes.friendly_name||e.entity_id)}</option>`).join(''):'<option value="">No players found</option>';
    if(entities.length){this._selectedPlayer=entities[0].entity_id;sel.value=this._selectedPlayer;}
  }

  _nav(view,btn) {
    this._view=view;
    this.shadowRoot.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    this._$('searchInp').value=''; this._$('searchClear').classList.remove('visible');
    clearTimeout(this._searchTimer);
    if(this._imgObserver) this._imgObserver.disconnect();
    if(this._queueVisible) this._hideQueue();
    this._renderView(view);
  }
  _renderView(view) {
    switch(view){
      case 'home':return this._renderHome(); case 'radio':return this._renderRadio();
      case 'albums':return this._renderAlbums(); case 'artists':return this._renderArtists();
      case 'tracks':return this._renderTracks(); case 'playlists':return this._renderPlaylists();
    }
  }

  async _renderGlobalSearch(q) {
    this._loading();
    try {
      const res=await this._search(q);
      const albums=res.albums??[],artists=res.artists??[],tracks=res.tracks??[],radio=res.radio??[],playlists=res.playlists??[];
      let html=`<div class="section"><div class="sec-hdr"><span class="sec-title">Search: ${this._esc(q)}</span></div></div>`;
      if(albums.length)    html+=this._section('Albums',albums.map(a=>this._albumCardHtml(a)).join(''),'album-grid',albums.length,this._sectionActions(albums));
      if(artists.length)   html+=this._section('Artists',artists.map(a=>this._artistCardHtml(a)).join(''),'artist-grid');
      if(tracks.length)    html+=this._section('Tracks',tracks.map((t,i)=>this._trackRowHtml(t,i+1)).join(''),'track-list',tracks.length,this._sectionActions(tracks));
      if(playlists.length) html+=this._section('Playlists',playlists.map(a=>this._albumCardHtml(a,'playlist')).join(''),'album-grid',playlists.length,this._sectionActions(playlists));
      if(radio.length)     html+=this._section('Radio',radio.map(a=>this._radioCardHtml(a)).join(''),'radio-grid');
      if(!albums.length&&!artists.length&&!tracks.length&&!radio.length&&!playlists.length) html=`<div class="state-box">No results for "${this._esc(q)}"</div>`;
      this._scroll().innerHTML=html; this._hydrateImages(); this._attachClickHandler();
    } catch(e){this._err(e,()=>this._renderGlobalSearch(q));}
  }

  async _renderHome() {
    this._loading();
    try {
      const sec=this._config.home_sections||{};
      const results=await Promise.allSettled([
        (sec.favourite_playlists??0) ? this._getLibrary('playlist','sort_name',sec.favourite_playlists,true) : Promise.resolve([]),
        (sec.favourite_albums??0)    ? this._getLibrary('album','sort_name',sec.favourite_albums,true)       : Promise.resolve([]),
        (sec.favourite_artists??0)   ? this._getLibrary('artist','sort_name',sec.favourite_artists,true)     : Promise.resolve([]),
        (sec.favourite_tracks??0)    ? this._getLibrary('track','sort_name',sec.favourite_tracks,true)       : Promise.resolve([]),
        (sec.radio??50)              ? this._getLibrary('radio','sort_name',sec.radio??50,true)               : Promise.resolve([]),
        (sec.recently_played??20)    ? this._fetchRecentlyPlayed(sec.recently_played??20)                    : Promise.resolve([]),
        (sec.recently_added??20)     ? this._fetchRecentlyAdded(sec.recently_added??20)                     : Promise.resolve([]),
        (sec.discover??20)           ? this._fetchLibrary('album','random',sec.discover??20)                 : Promise.resolve([]),
      ]);
      const [favPlaylists,favAlbums,favArtists,favTracks,radio,recentlyPlayed,recentAlbums,random]=results.map(r=>r.value??[]);
      let html='';
      if(favPlaylists.length) html+=this._section('Favourite Playlists',favPlaylists.map(a=>this._albumCardHtml(a,'playlist')).join(''),'album-grid',favPlaylists.length,this._sectionActions(favPlaylists));
      if(favAlbums.length)    html+=this._section('Favourite Albums',favAlbums.map(a=>this._albumCardHtml(a)).join(''),'album-grid',favAlbums.length,this._sectionActions(favAlbums));
      if(favArtists.length)   html+=this._section('Favourite Artists',favArtists.map(a=>this._artistCardHtml(a)).join(''),'artist-grid',favArtists.length);
      if(favTracks.length)    html+=this._section('Favourite Tracks',favTracks.map((t,i)=>this._trackRowHtml(t,i+1)).join(''),'track-list',favTracks.length,this._sectionActions(favTracks));
      if(radio.length)          html+=this._section('Radio Stations',radio.map(a=>this._radioCardHtml(a)).join(''),'radio-grid');
      if(recentlyPlayed.length) html+=this._section('Recently Played',recentlyPlayed.map(a=>this._maItemCardHtml(a)).join(''),'album-grid');
      if(recentAlbums.length)   html+=this._section('Recently Added',recentAlbums.map(a=>this._maItemCardHtml(a)).join(''),'album-grid');
      if(random.length)         html+=this._section('Discover',random.map(a=>this._albumCardHtml(a)).join(''),'album-grid');
      this._scroll().innerHTML=html||'<div class="state-box">No content found</div>';
      this._hydrateImages(); this._attachClickHandler(); this._highlightNowPlaying();
    } catch(e){this._err(e,()=>this._renderHome());}
  }

  async _renderAlbums() {
    const key='album:sort_name:500:false'; const cached=this._libCache[key];
    if(cached){this._scroll().innerHTML=this._section('All Albums',cached.items.map(a=>this._albumCardHtml(a)).join(''),'album-grid',cached.items.length);this._hydrateImages();this._attachClickHandler();this._highlightNowPlaying();return;}
    this._loading();
    try{const items=await this._getLibrary('album','sort_name',500);this._scroll().innerHTML=this._section('All Albums',items.map(a=>this._albumCardHtml(a)).join(''),'album-grid',items.length);this._hydrateImages();this._attachClickHandler();this._highlightNowPlaying();}
    catch(e){this._err(e,()=>this._renderAlbums());}
  }
  async _renderArtists() {
    const key='artist:sort_name:500:false'; const cached=this._libCache[key];
    if(cached){this._scroll().innerHTML=this._section('All Artists',cached.items.map(a=>this._artistCardHtml(a)).join(''),'artist-grid',cached.items.length);this._hydrateImages();this._attachClickHandler();return;}
    this._loading();
    try{const items=await this._getLibrary('artist','sort_name',500);this._scroll().innerHTML=this._section('All Artists',items.map(a=>this._artistCardHtml(a)).join(''),'artist-grid',items.length);this._hydrateImages();this._attachClickHandler();}
    catch(e){this._err(e,()=>this._renderArtists());}
  }
  async _renderArtistDetail(artistName,artUrl) {
    this._loading();
    try {
      const res=await this._search(artistName);
      const albums=(res.albums??[]).filter(a=>this._artistName(a).toLowerCase().includes(artistName.toLowerCase()));
      const ph=this._placeholder('artist');
      const artAttrs=artUrl?`data-img="${this._esc(artUrl)}" data-placeholder-type="artist"`:'';
      this._scroll().innerHTML=`<div class="artist-hdr"><div class="artist-hero" ${artAttrs}>${ph}</div><div><div class="artist-detail-name">${this._esc(artistName)}</div><button class="artist-detail-back" data-action="back">&#x2190; Back</button></div></div>${albums.length?this._section('Albums',albums.map(a=>this._albumCardHtml(a)).join(''),'album-grid'):'<div class="state-box">No albums found</div>'}`;
      this._hydrateImages(); this._attachClickHandler();
    } catch(e){this._err(e,()=>this._renderArtistDetail(artistName,artUrl));}
  }
  // MA URIs look like {provider_instance_id_or_domain}://{media_type}/{item_id}
  // e.g. "library://album/50" or "spotify://playlist/1a2b3c".
  _parseUri(uri) {
    const m=/^([^:]+):\/\/[^/]+\/(.+)$/.exec(uri||'');
    return m?{provider:m[1],item_id:m[2]}:null;
  }
  // "Browse" click action: show an album's or playlist's tracks instead of
  // playing immediately. Requires ma_token (uses the direct MA WebSocket,
  // same as Recently Played/Added) — falls back to playing if unavailable.
  async _renderContentDetail(uri,type,name,artist,artUrl) {
    this._loading();
    try {
      const parsed=this._parseUri(uri);
      if(!parsed) throw new Error('Could not read that item\u2019s URI.');
      if(!await this._waitForWS()){
        console.warn('[MA Card] Browse needs ma_token configured \u2014 playing instead.');
        this._playMedia(uri,type,'play');
        return;
      }
      const command=type==='playlist'?'music/playlists/playlist_tracks':'music/albums/album_tracks';
      const result=await this._wsSend(command,{item_id:parsed.item_id,provider_instance_id_or_domain:parsed.provider});
      const tracks=Array.isArray(result)?result:(result?.items??[]);
      const ph=this._placeholder(type);
      const artAttrs=artUrl?`data-img="${this._esc(artUrl)}" data-placeholder-type="${type}"`:'';
      const inAlbum=type==='album';
      this._scroll().innerHTML=`<div class="artist-hdr">
          <div class="a-art-wrap" style="width:90px;height:90px;flex-shrink:0" ${artAttrs}>${ph}</div>
          <div>
            <div class="artist-detail-name">${this._esc(name)}</div>
            ${artist?`<div class="a-artist" style="margin-bottom:8px">${this._esc(artist)}</div>`:''}
            <button class="artist-detail-back" data-action="back">&#x2190; Back</button>
          </div>
        </div>
        ${tracks.length?this._section('Tracks',tracks.map((t,i)=>this._trackRowHtml(t,i+1,inAlbum)).join(''),'track-list',tracks.length,this._sectionActions(tracks)):'<div class="state-box">No tracks found</div>'}`;
      this._hydrateImages(); this._attachClickHandler();
    } catch(e){this._err(e,()=>this._renderContentDetail(uri,type,name,artist,artUrl));}
  }
  async _renderTracks() {
    this._loading();
    try{const items=await this._getLibrary('track','sort_name',500);this._scroll().innerHTML=this._section('All Tracks',items.map((t,i)=>this._trackRowHtml(t,i+1)).join(''),'track-list',items.length);this._hydrateImages();this._attachClickHandler();}
    catch(e){this._err(e,()=>this._renderTracks());}
  }
  async _renderPlaylists() {
    this._loading();
    try{const items=await this._getLibrary('playlist','sort_name',500);this._scroll().innerHTML=this._section('Playlists',items.map(a=>this._albumCardHtml(a,'playlist')).join(''),'album-grid',items.length);this._hydrateImages();this._attachClickHandler();}
    catch(e){this._err(e,()=>this._renderPlaylists());}
  }
  async _renderRadio() {
    const key='radio:sort_name:5000:true'; const cached=this._libCache[key];
    if(cached){this._scroll().innerHTML=this._section('Radio Stations',cached.items.map(a=>this._radioCardHtml(a)).join(''),'radio-grid',cached.items.length);this._hydrateImages();this._attachClickHandler();return;}
    this._loading();
    try{const items=await this._getLibrary('radio','sort_name',5000,true);this._scroll().innerHTML=this._section('Radio Stations',items.map(a=>this._radioCardHtml(a)).join(''),'radio-grid',items.length);this._hydrateImages();this._attachClickHandler();}
    catch(e){this._err(e,()=>this._renderRadio());}
  }

  async _playAll(items,shuffle) {
    if(!items.length||!this._selectedPlayer){if(!this._selectedPlayer)alert('Select a player first');return;}
    if(shuffle) await this._hass.callService('media_player','shuffle_set',{entity_id:this._selectedPlayer,shuffle:true});
    await this._hass.callService('music_assistant','play_media',{entity_id:this._selectedPlayer,media_id:items[0].uri,media_type:items[0].media_type||'album',enqueue:'play'});
    for(let i=1;i<items.length;i++) await this._hass.callService('music_assistant','play_media',{entity_id:this._selectedPlayer,media_id:items[i].uri,media_type:items[i].media_type||'album',enqueue:'add'});
    this._lastNpKey='';
  }
  _sectionActions(items) {
    if(!items.length) return '';
    const encoded=this._esc(JSON.stringify(items.map(i=>({uri:i.uri,media_type:i.media_type||'album'}))));
    return `<button class="sec-btn" data-action="play-all" data-items="${encoded}">&#x25B6;&#xFE0E; Play all</button><button class="sec-btn" data-action="shuffle-all" data-items="${encoded}">&#x21C4;&#xFE0E; Shuffle all</button>`;
  }
  _section(title,inner,wrapClass,count,actions) {
    const badge=count!==undefined?`<span class="sec-count">${count}</span>`:'';
    const actHtml=actions?`<div class="sec-actions">${actions}</div>`:'';
    return `<div class="section"><div class="sec-hdr"><span class="sec-title">${title}</span>${badge}${actHtml}</div><div class="${wrapClass}">${inner}</div></div>`;
  }

  // ── CARD HTML BUILDERS ────────────────────────────────────────
  _albumCardHtml(item, forceType) {
    const artUrl=this._artUrl(item);
    const mediaType=forceType||item.media_type||'album';
    const ph=this._placeholder(mediaType);
    const useMaLogo = !artUrl && mediaType !== 'track' && mediaType !== 'artist';
    const artAttrs=artUrl
      ? `data-img="${this._esc(artUrl)}" data-placeholder-type="${mediaType}"`
      : (useMaLogo ? `data-ma-logo="${mediaType}"` : '');
    const artist=this._artistName(item),uri=item.uri||'',name=item.name||'';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="${mediaType}" data-name="${this._esc(name)}" data-artist="${this._esc(artist)}" data-art="${this._esc(artUrl||'')}">
      <div class="a-art-wrap" ${artAttrs}>${ph}<div class="a-overlay"><div class="play-circle">&#x25B6;&#xFE0E;</div></div><div class="playing-badge">&#x25B6;&#xFE0E; playing</div></div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
      <div class="a-artist">${this._esc(artist)}</div>
      ${item.year?`<div class="a-year">${item.year}</div>`:''}
    </div>`;
  }

  _maItemArtUrl(item) {
    if(typeof item.image==='string'&&item.image) return item.image;
    if(item.image?.proxy_id) return `${this._maUrl}/imageproxy/${item.image.proxy_id}`;
    if(item.image?.path) return `${this._maUrl}/imageproxy?path=${encodeURIComponent(item.image.path)}&provider=${encodeURIComponent(item.image.provider||'')}&size=256&fmt=jpeg`;
    if(item.metadata?.images?.[0]?.proxy_id) return `${this._maUrl}/imageproxy/${item.metadata.images[0].proxy_id}`;
    if(item.metadata?.images?.[0]?.path){const img=item.metadata.images[0];return `${this._maUrl}/imageproxy?path=${encodeURIComponent(img.path)}&provider=${encodeURIComponent(img.provider||'')}&size=256&fmt=jpeg`;}
    return null;
  }
  _maItemCardHtml(item) {
    const mediaType=item.media_type||'album';
    const artUrl=this._maItemArtUrl(item);
    if(mediaType==='artist'){
      // Render like the Artists tab, but with the same uri/type dataset album
      // cards use, so it goes through the unified click/context-menu logic.
      const name=item.name||'',uri=item.uri||'';
      const ph=this._placeholder('artist');
      const artAttrs=artUrl?`data-img="${this._esc(artUrl)}" data-placeholder-type="artist"`:'';
      return `<div class="artist-card" data-uri="${this._esc(uri)}" data-type="artist" data-name="${this._esc(name)}" data-art="${this._esc(artUrl||'')}"><div class="ar-img" ${artAttrs}>${ph}</div><div class="ar-name">${this._esc(name)}</div></div>`;
    }
    const ph=this._placeholder(mediaType);
    const useMaLogo = !artUrl && mediaType !== 'track';
    const artAttrs=artUrl
      ? `data-img="${this._esc(artUrl)}" data-placeholder-type="${mediaType}"`
      : (useMaLogo ? `data-ma-logo="${mediaType}"` : '');
    const uri=item.uri||'',name=item.name||'';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="${mediaType}" data-name="${this._esc(name)}" data-artist="" data-art="${this._esc(artUrl||'')}">
      <div class="a-art-wrap" ${artAttrs}>${ph}<div class="a-overlay"><div class="play-circle">&#x25B6;&#xFE0E;</div></div></div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
    </div>`;
  }

  _artistCardHtml(item) {
    const artUrl=this._artUrl(item),name=item.name||'',uri=item.uri||'';
    const ph=this._placeholder('artist');
    const artAttrs=artUrl?`data-img="${this._esc(artUrl)}" data-placeholder-type="artist"`:'';
    return `<div class="artist-card" data-uri="${this._esc(uri)}" data-type="artist" data-name="${this._esc(name)}" data-art="${this._esc(artUrl||'')}"><div class="ar-img" ${artAttrs}>${ph}</div><div class="ar-name">${this._esc(name)}</div></div>`;
  }

  _trackRowHtml(item,num,inAlbum) {
    const artUrl=this._artUrl(item);
    const ph=this._placeholder('track');
    const artAttrs=artUrl?`data-img="${this._esc(artUrl)}" data-placeholder-type="track"`:'';
    const artist=this._artistName(item),meta=inAlbum?artist:[artist,item.album?.name].filter(Boolean).join(' &middot; ');
    const uri=item.uri||'',name=item.name||'';
    return `<div class="track-row" data-uri="${this._esc(uri)}" data-type="track" data-name="${this._esc(name)}">
      <div class="tr-num">${num}</div><div class="tr-art" ${artAttrs}>${ph}</div>
      <div class="tr-info"><div class="tr-name">${this._esc(name)}</div>${meta?`<div class="tr-meta">${this._esc(meta)}</div>`:''}</div>
      <div class="tr-dur">${this._fmtDur(item.duration)}</div>
    </div>`;
  }

  _radioCardHtml(item) {
    const artUrl=this._artUrl(item);
    const ph=this._placeholder('radio');
    const artAttrs=artUrl
      ? `data-img="${this._esc(artUrl)}" data-placeholder-type="radio"`
      : `data-ma-logo="radio"`;
    const uri=item.uri||'',name=item.name||'',desc=item.metadata?.description||'';
    return `<div class="album-card" data-uri="${this._esc(uri)}" data-type="radio" data-name="${this._esc(name)}" data-artist="" data-art="${this._esc(artUrl||'')}">
      <div class="a-art-wrap" ${artAttrs}>${ph}<div class="a-overlay"><div class="play-circle">&#x25B6;&#xFE0E;</div></div></div>
      <div class="a-name" title="${this._esc(name)}">${this._esc(name)}</div>
      ${desc?`<div class="a-artist">${this._esc(desc)}</div>`:''}
    </div>`;
  }

  _attachClickHandler() {
    const scroll=this._scroll();
    scroll.removeEventListener('click',this._boundClick);
    scroll.removeEventListener('contextmenu',this._boundCtx);
    scroll.removeEventListener('touchstart',this._boundTouchStart);
    scroll.removeEventListener('touchend',this._boundTouchEnd);
    scroll.removeEventListener('touchmove',this._boundTouchMove);

    this._boundClick = e => this._handleClick(e);
    this._boundCtx   = e => this._handleCtx(e);

    // Long-press for touch devices — fires context menu after 500ms hold
    let _lpTimer = null;
    let _lpMoved = false;
    this._boundTouchStart = e => {
      _lpMoved = false;
      const touch = e.touches[0];
      const target = e.target.closest('.album-card') || e.target.closest('.artist-card') || e.target.closest('.track-row');
      if (!target || !target.dataset.uri) return;
      _lpTimer = setTimeout(() => {
        if (!_lpMoved) {
          this._showCtxMenu(touch.clientX, touch.clientY, target.dataset.uri, target.dataset.type || 'album', target.dataset.name || '', target.dataset.artist || '', target.dataset.art || '');
        }
      }, 500);
    };
    this._boundTouchMove = () => { _lpMoved = true; clearTimeout(_lpTimer); };
    this._boundTouchEnd  = () => { clearTimeout(_lpTimer); };

    scroll.addEventListener('click', this._boundClick);
    scroll.addEventListener('contextmenu', this._boundCtx);
    scroll.addEventListener('touchstart',  this._boundTouchStart, { passive: false });
    scroll.addEventListener('touchmove',   this._boundTouchMove,  { passive: true });
    scroll.addEventListener('touchend',    this._boundTouchEnd,   { passive: true });
  }
  _handleClick(e) {
    this._dismissCtx();
    const cardEl=e.target.closest('.album-card')||e.target.closest('.artist-card');
    if(cardEl&&cardEl.dataset.uri){
      const action=this._config.click_action||'play';
      const type=cardEl.dataset.type;
      if(action==='browse'){
        if(type==='album'||type==='playlist'){
          this._renderContentDetail(cardEl.dataset.uri,type,cardEl.dataset.name,cardEl.dataset.artist,cardEl.dataset.art);
          return;
        }
        if(type==='artist'){
          this._renderArtistDetail(cardEl.dataset.name,cardEl.dataset.art);
          return;
        }
      }
      this._playMedia(cardEl.dataset.uri,type,action==='enqueue'?'add':'play');
      return;
    }
    const trackEl=e.target.closest('.track-row'); if(trackEl&&trackEl.dataset.uri){this._playMedia(trackEl.dataset.uri,'track');return;}
    const secBtn=e.target.closest('.sec-btn'); if(secBtn){this._playAll(JSON.parse(secBtn.dataset.items||'[]'),secBtn.dataset.action==='shuffle-all');return;}
    const backEl=e.target.closest('[data-action="back"]'); if(backEl){this._renderView(this._view);return;}
  }
  _handleCtx(e) {
    const el=e.target.closest('.album-card')||e.target.closest('.artist-card')||e.target.closest('.track-row');
    if(!el||!el.dataset.uri) return; e.preventDefault();
    this._showCtxMenu(e.clientX,e.clientY,el.dataset.uri,el.dataset.type||'album',el.dataset.name||'',el.dataset.artist||'',el.dataset.art||'');
  }
  _showCtxMenu(x,y,uri,type,name,artist,artUrl) {
    this._dismissCtx();
    const menu=document.createElement('div'); menu.className='ctx-menu';
    const browseLabel=type==='artist'?'Browse albums':'Browse tracks';
    const browseItem=(type==='album'||type==='playlist'||type==='artist')
      ?`<div class="ctx-item" data-browse="1"><span class="ctx-ico">&#x2630;&#xFE0E;</span>${browseLabel}</div>`
      :'';
    menu.innerHTML=`${browseItem}<div class="ctx-item" data-enqueue="play"><span class="ctx-ico">&#x25B6;&#xFE0E;</span>Play now</div>
      <div class="ctx-item" data-enqueue="shuffle"><span class="ctx-ico">&#x21C4;&#xFE0E;</span>Shuffle now</div>
      <div class="ctx-item" data-enqueue="next"><span class="ctx-ico">&#x23ED;&#xFE0E;</span>Play next</div>
      <div class="ctx-item" data-enqueue="add"><span class="ctx-ico">+</span>Add to queue</div>
      <div class="ctx-item" data-enqueue="shuffle_add"><span class="ctx-ico">&#x21C4;&#xFE0E;</span>Shuffle add to queue</div>`;
    menu.querySelectorAll('.ctx-item').forEach(item=>item.addEventListener('click',e=>{
      e.stopPropagation();
      if(item.dataset.browse){
        if(type==='artist') this._renderArtistDetail(name,artUrl);
        else this._renderContentDetail(uri,type,name,artist,artUrl);
      }
      else this._playMedia(uri,type,item.dataset.enqueue);
      this._dismissCtx();
    }));
    const card=this.shadowRoot.querySelector('.card'); card.appendChild(menu); this._ctxMenu=menu;
    const cardRect=card.getBoundingClientRect(); let mx=x-cardRect.left,my=y-cardRect.top;
    menu.style.cssText=`position:absolute;left:${mx}px;top:${my}px;`;
    requestAnimationFrame(()=>{const mr=menu.getBoundingClientRect(),cr=cardRect;if(mr.right>cr.right)menu.style.left=(mx-mr.width)+'px';if(mr.bottom>cr.bottom)menu.style.top=(my-mr.height)+'px';});
  }
  _dismissCtx(){if(this._ctxMenu){this._ctxMenu.remove();this._ctxMenu=null;}}
  _highlightNowPlaying() {
    if(!this._nowPlayingUri) return;
    this._scroll().querySelectorAll('.album-card').forEach(card=>card.classList.toggle('now-playing',card.dataset.uri===this._nowPlayingUri));
  }
  _toggleQueue(){this._queueVisible?this._hideQueue():this._showQueue();}
  async _showQueue() {
    if(!this._selectedPlayer) return; this._queueVisible=true;
    const card=this.shadowRoot.querySelector('.card'); const panel=document.createElement('div');
    panel.className='queue-panel'; panel.id='queuePanel';
    const state=this._hass.states[this._selectedPlayer];
    const artPath=state?.attributes.entity_picture_local||state?.attributes.entity_picture||null;
    const title=state?.attributes.media_title||'Queue',artist=state?.attributes.media_artist||'';
    const queueArtStyle = artPath ? `background-image:url("${artPath}");background-size:cover;background-position:center;` : '';
    const queueArtContent = artPath ? '' : '&#9834;&#xFE0E;';
    panel.innerHTML=`<div class="queue-header"><div class="queue-art" style="${queueArtStyle}">${queueArtContent}</div><div class="queue-title-wrap"><div class="queue-title" id="qTitle">${this._esc(title)}</div><div class="queue-subtitle" id="qSub">${this._esc(artist)}</div></div><button class="queue-close" id="qClose">&#x2715;&#xFE0E;</button></div><div class="queue-scroll" id="qScroll"><div class="state-box"><div class="spinner"></div></div></div>`;
    card.appendChild(panel); panel.querySelector('#qClose').addEventListener('click',()=>this._hideQueue());
    try {
      if(!await this._waitForWS()) throw new Error('Queue view needs the MA access token (ma_token) configured, and your browser must be able to reach the MA server directly.');
      const queueId=this._hass.states[this._selectedPlayer]?.attributes?.active_queue;
      if(!queueId) throw new Error('No active queue found');
      const queueState=await this._wsSend('player_queues/get',{queue_id:queueId});
      const currentIndex=queueState?.current_index??0,totalItems=queueState?.items??0;
      const historyStart=Math.max(0,currentIndex-3);
      const queueItems=await this._wsSend('player_queues/items',{queue_id:queueId,limit:Math.min(200,totalItems-historyStart),offset:historyStart});
      const subEl=panel.querySelector('#qSub'); if(subEl)subEl.textContent=`${artist?artist+' \u00b7 ':''}${totalItems} tracks`;
      const qScroll=panel.querySelector('#qScroll');
      if(!queueItems?.length){qScroll.innerHTML='<div class="state-box">Queue is empty</div>';return;}
      qScroll.innerHTML=queueItems.map((item,i)=>{
        const img=item.image;
        const artUrl=img?(img.proxy_id?`${this._maUrl}/imageproxy/${img.proxy_id}`:`${this._maUrl}/imageproxy?path=${encodeURIComponent(img.path)}&provider=${encodeURIComponent(img.provider)}&size=80&fmt=jpeg`):null;
        const artAttrs=artUrl?`data-img="${this._esc(artUrl)}" data-placeholder-type="track"`:'';
        const trackPh=this._placeholder('track');
        const isActive=item.sort_index===currentIndex,isPast=item.sort_index<currentIndex;
        return `<div class="queue-item${isActive?' active':''}${isPast?' past':''}"><div class="qi-num">${isActive?'&#x25B6;&#xFE0E;':item.sort_index||i+1}</div><div class="qi-art" ${artAttrs}>${trackPh}</div><div class="qi-info"><div class="qi-name">${this._esc(item.media_item?.name||item.name||'')}</div>${item.media_item?.artists?.[0]?.name?`<div class="qi-artist">${this._esc(item.media_item.artists[0].name)}</div>`:''}</div><div class="qi-dur">${this._fmtDur(item.duration)}</div></div>`;
      }).join('');
      qScroll.querySelectorAll('[data-img]').forEach(el=>{
        const url=el.dataset.img,type=el.dataset.placeholderType,ph=type?this._placeholder(type):this._placeholder('track');
        delete el.dataset.img;delete el.dataset.placeholderType;
        this._loadImgInto(url,el,ph);
      });
      setTimeout(()=>{const active=qScroll.querySelector('.queue-item.active');if(active)active.scrollIntoView({block:'center',behavior:'smooth'});},100);
    } catch(e){const qs=panel.querySelector('#qScroll');if(qs)qs.innerHTML=`<div class="state-box"><div class="err-txt">${e.message}</div></div>`;}
  }
  _hideQueue(){this._queueVisible=false;const p=this.shadowRoot.getElementById('queuePanel');if(p)p.remove();}
  async _clearQueue() {
    if(!this._selectedPlayer) return;
    try { await this._hass.callService('media_player','clear_playlist',{entity_id:this._selectedPlayer}); }
    catch(e) { console.warn('[MA Card] clear queue failed:', e); }
  }
  _togglePlay(){if(!this._selectedPlayer)return;const s=this._hass.states[this._selectedPlayer]?.state;this._hass.callService('media_player',s==='playing'?'media_pause':'media_play',{entity_id:this._selectedPlayer});}
  _playerCmd(cmd){if(!this._selectedPlayer)return;this._hass.callService('media_player',cmd==='previous'?'media_previous_track':'media_next_track',{entity_id:this._selectedPlayer});}
  _toggleShuffle(){if(!this._selectedPlayer)return;const cur=this._hass.states[this._selectedPlayer]?.attributes.shuffle;this._hass.callService('media_player','shuffle_set',{entity_id:this._selectedPlayer,shuffle:!cur});}
  _toggleRepeat(){if(!this._selectedPlayer)return;const modes=['off','one','all'],cur=this._hass.states[this._selectedPlayer]?.attributes.repeat||'off';this._hass.callService('media_player','repeat_set',{entity_id:this._selectedPlayer,repeat:modes[(modes.indexOf(cur)+1)%modes.length]});}
  _setVolume(level){if(!this._selectedPlayer)return;this._hass.callService('media_player','volume_set',{entity_id:this._selectedPlayer,volume_level:Math.round(level*100)/100});}
  _toggleMute(){if(!this._selectedPlayer)return;const muted=this._hass.states[this._selectedPlayer]?.attributes.is_volume_muted;this._hass.callService('media_player','volume_mute',{entity_id:this._selectedPlayer,is_volume_muted:!muted});}
  _volColor(pct) {
    if(pct<=50) return '#22cc00';
    if(pct<=75){const t=(pct-50)/25;return `rgb(${Math.round(34+(255-34)*t)},${Math.round(204-(204-100)*t)},0)`;}
    return `rgb(220,${Math.round(100-100*(pct-75)/25)},0)`;
  }
  _startPoll() {
    this._updateNowPlaying();
    this._pollTimer=setInterval(()=>this._updateNowPlaying(),2000);
    this._progressTimer=setInterval(()=>this._tickProgress(),500);
  }
  _tickProgress() {
    if(!this._maQueueState) return;
    const{elapsed_time,elapsed_time_last_updated,state,current_item}=this._maQueueState;
    if(state!=='playing') return; const dur=current_item?.duration||0; if(!dur) return;
    const pos=elapsed_time+(Date.now()/1000-elapsed_time_last_updated);
    const fill=this._$('progressFill'); if(fill)fill.style.width=Math.min(100,(pos/dur)*100)+'%';
  }
  _updateNowPlaying() {
    if(!this._selectedPlayer||!this._hass) return;
    const state=this._hass.states[this._selectedPlayer]; if(!state) return;
    const npKey=`${state.state}:${state.attributes.media_title}:${Math.floor((state.attributes.media_position||0)/5)}:${state.attributes.volume_level}:${state.attributes.shuffle}:${state.attributes.repeat}`;
    if(npKey===this._lastNpKey) return; this._lastNpKey=npKey;
    const isPlaying=state.state==='playing';
    this._$('btnPlay').innerHTML=isPlaying?'&#x23F8;&#xFE0E;':'&#x25B6;&#xFE0E;';
    const shuffleBtn=this._$('btnShuffle'),repeatBtn=this._$('btnRepeat');
    shuffleBtn.classList.toggle('active',!!state.attributes.shuffle);
    const repeat=state.attributes.repeat||'off';
    repeatBtn.classList.toggle('active',repeat!=='off');
    repeatBtn.innerHTML=repeat==='one'?'&#x21BA;&#xFE0E;&sup1;':'&#x21BA;&#xFE0E;';
    repeatBtn.title=`Repeat: ${repeat}`;
    this._$('npTitle').textContent=state.attributes.media_title||'Nothing playing';
    this._$('npArtist').textContent=state.attributes.media_artist||'\u2014';
    const artPath=state.attributes.entity_picture_local||state.attributes.entity_picture||null;
    const artEl=this._$('npArt');
    if(artPath){
      if(artEl.dataset.src!==artPath){
        artEl.dataset.src=artPath;
        artEl.innerHTML='';
        artEl.style.backgroundImage=`url("${artPath}")`;
        artEl.style.backgroundSize='cover';
        artEl.style.backgroundPosition='center';
      }
    } else {
      artEl.dataset.src='';
      artEl.style.backgroundImage='';
      artEl.innerHTML='&#9834;&#xFE0E;';
    }
    const queueId=state.attributes.active_queue;
    if(queueId&&this._wsReady)this._wsSend('player_queues/get',{queue_id:queueId}).then(q=>{this._maQueueState=q;}).catch(()=>{});
    else{const dur=state.attributes.media_duration||0,pos=state.attributes.media_position||0;if(dur)this._$('progressFill').style.width=Math.min(100,(pos/dur)*100)+'%';}
    const vol=state.attributes.volume_level,muted=state.attributes.is_volume_muted;
    if(vol!==undefined){const pct=Math.round(vol*100),slider=this._$('volSlider');slider.value=pct;slider.style.setProperty('--vol-pct',pct+'%');slider.style.setProperty('--vol-color',this._volColor(pct));this._$('volIcon').innerHTML=muted?'&#128263;&#xFE0E;':vol<0.3?'&#128264;&#xFE0E;':vol<0.7?'&#128265;&#xFE0E;':'&#128266;&#xFE0E;';}
    const contentId=state.attributes.media_content_id||'';
    if(contentId!==this._nowPlayingUri){this._nowPlayingUri=contentId;this._highlightNowPlaying();}
  }
  disconnectedCallback() {
    clearInterval(this._pollTimer);clearInterval(this._progressTimer);clearTimeout(this._searchTimer);
    if(this._imgObserver){this._imgObserver.disconnect();this._imgObserver=null;}
    if(this._ws){this._ws.onclose=null;this._ws.close();this._ws=null;}
    this._imgCache={};this._libCache={};
    document.removeEventListener('click',this._boundDismissCtx);
  }
  getCardSize(){return 6;}
  static getConfigElement(){return document.createElement('ma-browser-card-editor');}
  static getStubConfig(){return{config_entry_id:'YOUR_MA_CONFIG_ENTRY_ID',ma_url:'http://YOUR_MA_IP:8095'};}
}

customElements.define('ma-browser-card', MABrowserCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type:'ma-browser-card', name:'MA Browser Card',
  description:'A full-featured Music Assistant browser card.',
  preview:true, documentationURL:'https://github.com/PMizz13/ma-browser-card',
  getEntitySuggestion:(hass,entityId)=>{
    if(entityId.split('.')[0]!=='media_player') return null;
    const state=hass.states[entityId];
    const isMassPlayer=state?.attributes.app_id==='music_assistant'||state?.attributes.mass_player_type||state?.attributes.active_queue;
    if(!isMassPlayer) return null;
    return{label:'MA Browser Card',config:{type:'custom:ma-browser-card',config_entry_id:'YOUR_MA_CONFIG_ENTRY_ID',ma_url:'http://YOUR_MA_IP:8095'}};
  },
});

// ── UI EDITOR ─────────────────────────────────────────────────────────

const EDITOR_CSS = `
  :host{display:block;font-family:var(--paper-font-body1_-_font-family,sans-serif);}
  .editor{padding:4px 0 16px;}
  .section-title{font-size:11px;font-weight:600;color:var(--secondary-text-color);margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--divider-color);text-transform:uppercase;letter-spacing:.08em;}
  .field-row{margin-bottom:12px;}
  .field-row label{display:block;font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;}
  .field-row input[type=text],.field-row input[type=password],.field-row select{width:100%;padding:8px 10px;font-size:13px;background:var(--card-background-color,#fff);color:var(--primary-text-color,#000);border:1px solid var(--divider-color,#ccc);border-radius:4px;box-sizing:border-box;font-family:inherit;}
  .field-row input:focus,.field-row select:focus{outline:none;border-color:var(--primary-color,#03a9f4);}
  .field-row .hint{font-size:11px;color:var(--disabled-text-color);margin-top:3px;line-height:1.4;}
  .toggle-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding:4px 0;}
  .toggle-label{font-size:13px;color:var(--primary-text-color);}
  .toggle-hint{font-size:11px;color:var(--disabled-text-color);margin-top:1px;}
  .toggle-switch{position:relative;width:36px;height:20px;flex-shrink:0;}
  .toggle-switch input{opacity:0;width:0;height:0;}
  .toggle-track{position:absolute;inset:0;background:var(--divider-color,#ccc);border-radius:10px;cursor:pointer;transition:background .2s;}
  .toggle-track::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.3);}
  .toggle-switch input:checked+.toggle-track{background:var(--primary-color,#03a9f4);}
  .toggle-switch input:checked+.toggle-track::after{transform:translateX(16px);}
  .slider-row{margin-bottom:14px;}
  .slider-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
  .slider-label{font-size:13px;color:var(--primary-text-color);flex:1;}
  .slider-unit{font-size:12px;color:var(--secondary-text-color);}
  .slider-number{width:52px;padding:3px 6px;font-size:12px;text-align:center;background:var(--card-background-color,#fff);color:var(--primary-text-color,#000);border:1px solid var(--divider-color,#ccc);border-radius:4px;font-family:inherit;-moz-appearance:textfield;}
  .slider-number::-webkit-inner-spin-button,.slider-number::-webkit-outer-spin-button{-webkit-appearance:none;}
  .slider-number:focus{outline:none;border-color:var(--primary-color,#03a9f4);}
  .slider-hint{font-size:11px;color:var(--disabled-text-color);margin-top:3px;}
  .zero-hint{font-size:11px;color:var(--warning-color,#f4b942);margin-top:3px;}
  .range-wrap{padding:10px 0;touch-action:none;}
  input[type=range]{display:block;width:100%;margin:0;-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;background:var(--divider-color,#ddd);user-select:none;-webkit-user-select:none;}
  input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:2px;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;margin-top:-8px;border-radius:50%;background:var(--primary-color,#03a9f4);cursor:pointer;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);}
  input[type=range]::-moz-range-track{height:4px;border-radius:2px;background:var(--divider-color,#ddd);}
  input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--primary-color,#03a9f4);cursor:pointer;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);}
`;

class MABrowserCardEditor extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this._config={};this._pendingTimer=null;}
  set hass(hass){this._hass=hass;}
  setConfig(config){this._config={...config};this._render();}
  _fire(config){clearTimeout(this._pendingTimer);this._pendingTimer=setTimeout(()=>{this.dispatchEvent(new CustomEvent('config-changed',{detail:{config},bubbles:true,composed:true}));},800);}
  _fireNow(config){clearTimeout(this._pendingTimer);this.dispatchEvent(new CustomEvent('config-changed',{detail:{config},bubbles:true,composed:true}));}
  _set(key,value,immediate=true){const c={...this._config};if(value===''||value===undefined||value===null)delete c[key];else c[key]=value;this._config=c;immediate?this._fireNow(c):this._fire(c);}
  _setSection(key,value,immediate=false){const c={...this._config},sec={...(c.home_sections||{})};if(value===null)delete sec[key];else sec[key]=value;if(!Object.keys(sec).length)delete c.home_sections;else c.home_sections=sec;this._config=c;immediate?this._fireNow(c):this._fire(c);}
  _v(key,def){return this._config[key]!==undefined?this._config[key]:def;}
  _esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  _render() {
    const c=this._config,sec=c.home_sections||{};
    const sp=this._v('sidebar_position','left'),pp=this._v('player_position','bottom');
    const th=this._v('theme','auto'),ca=this._v('click_action','play'),st=this._v('show_title',true);
    this.shadowRoot.innerHTML='<style>'+EDITOR_CSS+'</style><div class="editor">'
      +'<div class="section-title">Required</div>'
      +this._textField('config_entry_id','Config Entry ID *',c.config_entry_id||'','01JXXX...','Settings \u2192 Devices &amp; Services \u2192 Music Assistant \u2192 Configure \u2014 copy the ID from the URL')
      +this._textField('ma_url','MA Server URL *',c.ma_url||'','http://192.168.1.x:8095','Your Music Assistant server address including port')
      +'<div class="section-title">Recommended</div>'
      +this._pwField('ma_token','MA Access Token',c.ma_token||'','eyJ...','MA \u2192 Profile \u2192 Access Tokens \u2014 enables Recently Played &amp; Recently Added')
      +'<div class="section-title">Layout</div>'
      +'<div class="field-row"><label>Sidebar position</label><select id="sidebar_position"><option value="left"'+(sp==='left'?' selected':'')+'>Left (default)</option><option value="top"'+(sp==='top'?' selected':'')+'>Top (horizontal nav bar)</option></select></div>'
      +'<div class="field-row"><label>Player position</label><select id="player_position"><option value="bottom"'+(pp==='bottom'?' selected':'')+'>Bottom (default)</option><option value="top"'+(pp==='top'?' selected':'')+'>Top</option></select><div class="hint">In top sidebar mode: bottom pins player to card bottom</div></div>'
      +this._sliderField('height','Card height',this._v('height',580),300,900,10,'px','')
      +this._sliderField('sidebar_width','Sidebar width',this._v('sidebar_width',195),100,320,5,'px','Left sidebar only')
      +this._sliderField('tile_size','Artwork size',this._v('tile_size',105),70,220,5,'px','Scales album, artist and track artwork together')
      +'<div class="toggle-row"><div><div class="toggle-label">Show title bar</div><div class="toggle-hint">Hide to save vertical space</div></div><label class="toggle-switch"><input type="checkbox" id="show_title"'+(st?' checked':'')+' /><span class="toggle-track"></span></label></div>'
      +'<div class="section-title">Appearance</div>'
      +'<div class="field-row"><label>Theme</label><select id="theme"><option value="auto"'+(th==='auto'?' selected':'')+'>Auto (follows HA theme)</option><option value="dark"'+(th==='dark'?' selected':'')+'>Dark</option><option value="light"'+(th==='light'?' selected':'')+'>Light</option><option value="retro"'+(th==='retro'?' selected':'')+'>Retro</option></select></div>'
      +this._textField('title','Title text',c.title||'','Music','')
      +this._textField('subtitle','Subtitle text',c.subtitle||'','Music Assistant','')
      +this._textField('icon','Icon',c.icon||'','mdi:music','Any MDI icon e.g. mdi:speaker, mdi:headphones, mdi:radio')
      +'<div class="section-title">Behaviour</div>'
      +'<div class="field-row"><label>Single click action</label><select id="click_action"><option value="play"'+(ca==='play'?' selected':'')+'>Play immediately (default)</option><option value="enqueue"'+(ca==='enqueue'?' selected':'')+'>Add to queue</option><option value="browse"'+(ca==='browse'?' selected':'')+'>Browse (show tracks)</option></select><div class="hint">Browse opens an album or playlist\u2019s track list instead of playing it (artists already open their albums this way). Requires an MA access token. Also available any time via right-click / long-press \u2192 "Browse tracks", regardless of this setting</div></div>'
      +'<div class="section-title">Home Screen Sections</div>'
      +'<div class="hint" style="margin-bottom:14px;font-size:12px">Set a section to 0 to hide it entirely</div>'
      +this._sliderField('sec_favourite_playlists','Favourite playlists',sec.favourite_playlists??0,0,50,1,'','favourited playlists in MA')
      +this._sliderField('sec_favourite_albums','Favourite albums',sec.favourite_albums??0,0,50,1,'','favourited albums in MA')
      +this._sliderField('sec_favourite_artists','Favourite artists',sec.favourite_artists??0,0,50,1,'','favourited artists in MA')
      +this._sliderField('sec_favourite_tracks','Favourite tracks',sec.favourite_tracks??0,0,50,1,'','favourited tracks in MA')
      +this._sliderField('sec_radio','Radio stations',sec.radio??50,0,50,1,'','favourited stations in MA')
      +this._sliderField('sec_recently_played','Recently played',sec.recently_played??20,0,50,1,'','requires ma_token')
      +this._sliderField('sec_recently_added','Recently added',sec.recently_added??20,0,50,1,'','requires ma_token')
      +this._sliderField('sec_discover','Discover (random)',sec.discover??20,0,50,1,'','')
      +'<div class="section-title">Players</div>'
      +this._textField('players','Player entity IDs',(c.players||[]).join(', '),'Leave blank to auto-detect all MA players','Comma-separated e.g. media_player.kitchen, media_player.lounge')
      +'</div>';
    this._attachListeners();
  }

  _textField(id,label,value,placeholder,hint){return '<div class="field-row"><label>'+label+'</label><input type="text" id="'+id+'" value="'+this._esc(value)+'" placeholder="'+this._esc(placeholder)+'" />'+(hint?'<div class="hint">'+hint+'</div>':'')+'</div>';}
  _pwField(id,label,value,placeholder,hint){return '<div class="field-row"><label>'+label+'</label><input type="password" id="'+id+'" value="'+this._esc(value)+'" placeholder="'+this._esc(placeholder)+'" />'+(hint?'<div class="hint">'+hint+'</div>':'')+'</div>';}
  _sliderField(id,label,value,min,max,step,unit,hint){
    const isZero=(value===0&&min===0&&id.indexOf('sec_')===0);
    return '<div class="slider-row"><div class="slider-header"><span class="slider-label">'+label+'</span><input type="number" class="slider-number" id="'+id+'_num" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'" />'+(unit?'<span class="slider-unit">'+unit+'</span>':'')+'</div><div class="range-wrap"><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'" /></div>'+(hint?'<div class="slider-hint">'+hint+'</div>':'')+(isZero?'<div class="zero-hint">&#x26A0; This section is hidden</div>':'')+'</div>';
  }

  _attachListeners() {
    const sr=this.shadowRoot,self=this;
    sr.addEventListener('pointerdown',e=>e.stopPropagation());
    sr.addEventListener('mousedown',e=>e.stopPropagation());
    sr.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
    ['config_entry_id','ma_url','title','subtitle','icon'].forEach(id=>{const el=sr.getElementById(id);if(el)el.addEventListener('change',()=>self._set(id,el.value.trim()||undefined));});
    const tokenEl=sr.getElementById('ma_token');if(tokenEl)tokenEl.addEventListener('change',()=>self._set('ma_token',tokenEl.value.trim()||undefined));
    const playersEl=sr.getElementById('players');if(playersEl)playersEl.addEventListener('change',()=>{const val=playersEl.value.trim();self._set('players',val?val.split(',').map(s=>s.trim()).filter(Boolean):undefined);});
    ['sidebar_position','player_position','theme','click_action'].forEach(id=>{const el=sr.getElementById(id);if(el)el.addEventListener('change',()=>self._set(id,el.value));});
    const showTitle=sr.getElementById('show_title');if(showTitle)showTitle.addEventListener('change',()=>self._set('show_title',showTitle.checked));
    ['height','sidebar_width','tile_size'].forEach(id=>{
      const slider=sr.getElementById(id),numBox=sr.getElementById(id+'_num');if(!slider||!numBox)return;
      slider.addEventListener('input',()=>{numBox.value=slider.value;self._set(id,+slider.value,false);});
      numBox.addEventListener('change',()=>{const v=Math.min(+slider.max,Math.max(+slider.min,+numBox.value));slider.value=v;numBox.value=v;self._set(id,v,true);});
    });
    const secMap={'sec_favourite_playlists':'favourite_playlists','sec_favourite_albums':'favourite_albums','sec_favourite_artists':'favourite_artists','sec_favourite_tracks':'favourite_tracks','sec_radio':'radio','sec_recently_played':'recently_played','sec_recently_added':'recently_added','sec_discover':'discover'};
    Object.keys(secMap).forEach(elId=>{
      const key=secMap[elId],slider=sr.getElementById(elId),numBox=sr.getElementById(elId+'_num');if(!slider||!numBox)return;
      slider.addEventListener('input',()=>{numBox.value=slider.value;const zh=slider.closest('.slider-row').querySelector('.zero-hint');if(zh)zh.style.display=(+slider.value===0)?'':'none';self._setSection(key,+slider.value,false);});
      numBox.addEventListener('change',()=>{const v=Math.min(+slider.max,Math.max(+slider.min,+numBox.value));slider.value=v;numBox.value=v;const zh=slider.closest('.slider-row').querySelector('.zero-hint');if(zh)zh.style.display=(v===0)?'':'none';self._setSection(key,v,true);});
    });
  }
}

customElements.define('ma-browser-card-editor', MABrowserCardEditor);
