# Music Assistant Browser Card

A Music Assistant browser card for Home Assistant. Browse your music library - albums, artists, tracks, playlists and radio stations - with full artwork, search, queue view and playback controls, all within a single Lovelace card. This has been tested when your own media such as a Plex server is linked. I haven't tested it with all providers.
  
![MA Browser Card screenshot](screenshot.png)

<a href='https://ko-fi.com/X2H427L1M4' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

# Disclaimer
 **Use at your own risk.** This is a personal project shared freely with the community. It is not affiliated with, endorsed by, or supported by Music Assistant or Nabu Casa. I make no guarantees about stability, accuracy or fitness for any particular purpose, and take no responsibility for anything that may go wrong as a result of using it. Always back up your Home Assistant configuration before installing custom components.

## Features

- Browse up to 500 albums, artists, tracks, playlists and radio stations
- Global search across your entire library from any view
- Favourited radio stations from Music Assistant
- Recently played, recently added and discover sections on the home screen (MA token required)
- Click any album or track to play immediately
- Right-click for Play now / Shuffle play / Play next / Add to queue
- Full queue view with artwork - click the now-playing artwork to open (MA token required)
- Shuffle and repeat controls
- Volume slider
- Album art with loaded as needed - no performance impact on large libraries
- Library caching for instant navigation after first load
- Adjustable sidebar size and layout
- Fits to your theme
- Party mode for queueing up tracks
- Have your favourite playlists, albums, tracks and/or artists on the home screen
- New queue management options (Clear the queue, add to the queue or replace it)
- Fully customizable colour scheme
- Customise dashboard order and search orders seperately
- Audiobooks and podcasts are now in beta (If you experience any issues please report it via github)

## Requirements

- [Home Assistant](https://www.home-assistant.io/) with [HACS](https://hacs.xyz/)
- [Music Assistant](https://music-assistant.io/) server (v2.8+)
- Music Assistant Home Assistant integration installed

## Installation via HACS - Reccomended

Search for MA Browser Card in the HACS store. Or click the button below.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=PMizz13&repository=ma-browser-card&category=plugin)

## Manual Installation

1. Download `ma-browser-card.js` from the [latest release](https://github.com/PMizz13/ma-browser-card/releases/latest)
2. Copy it to `/config/www/ma-browser-card.js` on your HA instance
3. In HA go to **Settings → Dashboards → ⋮ → Resources → Add Resource**
   - URL: `/local/ma-browser-card.js`
   - Type: **JavaScript Module**
4. Reload the browser

## Configuration

The card can be fully configured using the Home Assistant UI from version 3.3.0

### Finding your `config_entry_id`

Go to **Settings → Devices & Services → Music Assistant**. Click on the three dots next to the main Music Assistant instance and click "Copy Entry ID". This will copy your ID to the clipboard so you can just paste it into the config UI or yaml.

### Setting Your Width
Create a grid card with 1 column (or multiple if desired) and place this card inside it. This is the easiest way to control how wide you want the card to be.

### Getting an MA access token (optional)

The `ma_token` is only needed for the **Recently Played** section on the home screen. Without it everything else works fine.

1. Open the Music Assistant UI
2. Click the profile icon (top right)
3. Go to **Access Tokens**
4. Create a new token and copy it

### Minimal config

```yaml
type: custom:ma-browser-card
config_entry_id: 01JNBHFPQSJY03ANJ6XXF053W2
ma_url: http://192.168.1.x:8095
```

### Full config

type: custom:ma-browser-card
config_entry_id: 01JNBHFPQSJY03ANJ6XXF053W2
ma_url: http://192.168.1.x:8095
ma_token: eyJ...               # Optional — enables Recently Played, Recently Added,
                                # Browse, Queue view, and Up Next/Continue Listening sections
height: 580                    # Card height in pixels (default: 580)
players:                       # Optional — limit to specific MA players
  - media_player.kitchen_speaker    # If omitted, auto-detects all MA players
  - media_player.living_room
theme: auto                     # auto (default, copies dashboard theme), dark, light, retro
sidebar_position: left          # left (default) or top (horizontal nav bar)
sidebar_width: 195              # Sidebar width in px, left sidebar only (default: 195)
player_position: bottom         # bottom (default) or top
show_title: true                # Show/hide the logo title bar (default: true)
title: Music                    # Logo title text (default: Music)
subtitle: Music Assistant       # Logo subtitle text (default: Music Assistant)
icon: mdi:music                 # Any MDI icon for the logo (default: mdi:music)

custom_colors:                  # Optional — overrides the theme's palette (all optional)
  accent: "#e5a00d"              # Highlights, play button, active nav, progress bar
  background: "#111113"          # Outer card background
  surface: "#222228"             # Sidebar, artwork placeholders, search bar, controls
  elevated: "#2e2e38"            # Track art tiles, hover/active backgrounds
  text: "#f0f0f5"                # Primary text
  text_nav: "#9898aa"            # nav button colours
  other_text: "#55555f"          # other/tertiary text
  border: "#ffffff12"            # borders and dividers


click_action: play               # play (default), enqueue, or browse
                                  # browse: albums/playlists open their track list instead
                                  # of playing immediately (artists already do this).
                                  # Right-click/long-press always shows the full menu too,
                                  # including "Browse tracks", regardless of this setting

show_podcasts: false             # Optional — adds a Podcasts section to the sidebar and search
show_audiobooks: false           # Optional — adds an Audiobooks section to the sidebar and search

home_sections:                  # Set the number of items to display in each section
  radio: 3                      # Set to 0 to hide section
  recently_played: 2
  recently_added: 3
  discover: 4
  favourite_playlists: 0        # Favourited playlists (default: 0 = off).
  favourite_albums: 0           # Favourited albums (default: 0 = off)
  favourite_artists: 0          # Favourited artists (default: 0 = off)
  favourite_tracks: 0           # Favourited tracks (default: 0 = off)
  continue_podcasts: 10         # Requires show_podcasts + ma_token — checks this many
                                 # favourited podcasts for their next unfinished episode
  continue_audiobooks: 10       # Requires show_audiobooks + ma_token

home_order:                     # Optional — order sections appear in on the home screen,
                                 # top to bottom. Omit to use the default order shown here.
  - continue_podcasts
  - continue_audiobooks
  - favourite_playlists
  - favourite_albums
  - favourite_artists
  - favourite_tracks
  - radio
  - recently_played
  - recently_added
  - discover

search_order:                   # Optional — order sections appear in on the search
                                 # results screen. Omit to use the default order shown here.
  - albums
  - artists
  - tracks
  - playlists
  - podcasts
  - audiobooks
  - radio

custom_colors:     #Optional - override the theme colours
  accent: '#e5a00d'
  background: '#111113'
  surface: '#222228'
  elevated: '#2e2e38'
  text: '#f0f0f5'
  text_nav: '#9898aa'
  other_text: '#55555f'
  border: '#ffffff12'


### Config options

| Option               | Required | Default | Description                                                      |
| -------------------- | -------- | ------- | ---------------------------------------------------------------- |
|**Functionality**     |          |         |                                                                  |
| `config_entry_id`    | Yes      | -       | Your MA integration config entry ID                              |
| `ma_url`             | Yes      | -       | URL of your MA server, e.g. `http://192.168.1.x:8095`            |
| `ma_token`           | No       | -       | MA access token — enables Recently Played, Recently Added, Browse, Queue view, and Up Next/Continue Listening sections |
| `players`            | No       | all     | List of `media_player` entity IDs to show in the player selector |
| `click_action`       | No       | play    | What to do when media is clicked (play, enqueue, browse)         |
| `show_podcasts`      | No       | false   | Adds a Podcasts section to the sidebar and search                |
| `show_audiobooks`    | No       | false   | Adds an Audiobooks section to the sidebar and search              |
|**Layout**            |          |         |                                                                  |
| `height`             | No       | `580`   | Card height in pixels                                            |
| `sidebar_position`   | No       | left    | Set position of sidebar (left, top)                              |
| `sidebar_width`      | No       | 195     | Set the sidebar width when positioned to the left in pixels      |
| `player_position`    | No       | bottom  | Position the player to the bottom or top                         |
| `tile_size`          | No       | 105     | Adjusts the size of the displayed artwork tiles                  |
| `home_order`         | No       | see below | List of `home_sections` keys setting the order sections appear on the home screen |
| `search_order`       | No       | see below | List of section keys (`albums`, `artists`, `tracks`, `playlists`, `podcasts`, `audiobooks`, `radio`) setting the order sections appear in on search results |
| `home_sections`      | No       |         |                                                                  |
| `radio`              | No       | 50      | Set number of saved radio stations to display                    |
| `recently_played`    | No       | 20      | Set number of recently played albums to display                  |
| `recently_added`     | No       | 20      | Set number of recently added music to display                    |
| `discover`           | No       | 20      | Set number of discovery queue to display                         |
| `favourite_playlists`| No       | 0       | Set number of favourite playlists to display                     |
| `favourite_albums`   | No       | 0       | Set number of favourite albums to display                        |
| `favourite_artists`  | No       | 0       | Set number of favourite artists to display                       |
| `favourite_tracks`   | No       | 0       | Set number of favourite tracks to display                        |
| `continue_podcasts`  | No       | 10      | Requires `show_podcasts` + `ma_token`. Checks this many favourited podcasts for their next unfinished episode |
| `continue_audiobooks`| No       | 10      | Requires `show_audiobooks` + `ma_token`. Number of in-progress audiobooks to show |
| **Appearance**       |          |         |                                                                  |
| `title`              | No       | Music   | Text for title card                                              |
| `subtitle`           | No       | Music Assistant | Subtitle for card                                        |
| `icon`               | No       | mdi:music | Icon for card (any mdi)                                        |
| `theme`              | No       | auto    | Theme for card, (dark, light, retro, auto (use Home Assistant theme))   |
| `custom_colors`      | No       | -       | Overrides the theme's palette (see below). Has little effect on the retro theme, which uses fixed colours |
| `custom_colors.accent`| No      | `#e5a00d` | Highlights, play button, active nav, progress bar              |
| `custom_colors.background`| No  | `#111113` | Outer card background                                           |
| `custom_colors.surface`| No     | `#222228` | Sidebar, artwork placeholders, search bar, controls             |
| `custom_colors.elevated`| No    | `#2e2e38` | Track art tiles, hover/active backgrounds                       |
| `custom_colors.text` | No       | `#f0f0f5` | Primary text                                                     |
| `custom_colors.text_nav`| No | `#9898aa` | Nav button text                 |
| `custom_colors.other_text`| No | `#55555f` | Secondary/meta text (artist names, etc.)                    |
| `custom_colors.border`| No | `#ffffff12` | Box and card borders                |

## Usage

### Browsing
Use the sidebar to navigate between Home, Saved Radio, Albums, Artists, Tracks and Playlists.

### Playing
- **Click** any album, radio station or track to play it on the selected player (or enqueue if set)
- **Right-click** (or long-press on mobile) for more options: Play now, Shuffle play, Play next, Add to queue

### Search
Type in the search bar at the top to search across Albums, Artists, Tracks, Radio and Playlists simultaneously. Use the Play all and Shuffle all buttons that appear in each search result section in addition to the standard controls.

### Queue
Click the now-playing artwork or track title in the sidebar to open the full queue view. It shows the last 3 played tracks and all upcoming tracks with artwork.

### Player selector
Use the dropdown in the sidebar to switch between MA players. The volume slider and playback controls all apply to the selected player.

## Notes

- The `ma_token` is stored in plaintext in your Lovelace config. Treat it like a password — don't share your dashboard YAML publicly if it contains your token.
- Library browsing loads up to 500 items per section for performance. Search covers your full library regardless of this limit.
- The card uses a WebSocket connection directly to your MA server for Recently Played, Recently added and the queue view. This requires `ma_url` and `ma_token` to be set.
- The retro theme does not have a "light" variant

## Troubleshooting

**No players showing in the dropdown**
Add a `players:` list to your config with the exact entity IDs from Developer Tools → States.

**No artwork showing**
Check that your MA server is reachable at the `ma_url` you configured. Artwork is fetched directly from MA.

**Recently Played section missing or not updating**
Add `ma_token` to your config. Without it the section is skipped silently.
If this is in the card yaml then reset the cache.
There is a known bug in Music Assistant where certain players do not track played tracks. You will need to wait on a fix from Music Assistant.

**Card not loading**
Check the browser console (F12) for errors. Make sure the resource is registered as a JavaScript Module (not a regular JS file).

## Credits

Built using the [Music Assistant](https://music-assistant.io/) WebSocket and HA service APIs.
