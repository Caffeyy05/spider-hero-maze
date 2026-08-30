SPIDER HERO: PUZZLE QUEST — COMPLETE UPDATED BUILD

UPLOAD TO GITHUB ROOT:
index.html
style.css
script.js
README.txt
MUSIC-LICENSES.txt
assets/

LATEST FEATURES:
- Fixed no-scroll web/mobile frame
- Maze + Web Puzzle
- Multi-path maze with loops
- Full mission move calculation
- Occasional Precision Maze rounds
- Boss every 10 levels
- 10-second locked puzzle memorization
- NO permanent puzzle numbers
- Dot sequence pulses during memorize/reveal
- Tap OR finger-drag puzzle controls on phone
- Dynamic dot count by level/difficulty
- Wrong puzzle dot = half-heart penalty
- Full failure = one full heart
- 5 shared hearts, one full heart regenerates every 10 minutes
- Restart and Home confirmation popups
- Third Gear button in both game modes
- Quick in-game settings
- Separate music/SFX volume
- Calm normal music; intense boss music
- Shop categories: Skins / Backgrounds / Music
- Skin rarities: Basic / Rare / Epic / Legendary / Premium
- Premium items show COMING SOON
- Free milestone skins at levels 10/20/30/50 for both modes
- Background themes can be unlocked and equipped
- Music tracks can be unlocked and equipped
- Coins, stars, achievements, save progress


V2 GAMEPLAY FIXES
- Main/menu background changes automatically when entering Maze or Web Puzzle.
- Maze has its own exploration background.
- Web Puzzle has its own memory/puzzle background.
- Traps are NEVER placed on the validated full mission safe route.
- Player is never forced to hit a trap to get a key, orb, switch, or exit.
- Hitting a Maze wall now costs HALF a heart.
- Hitting a Maze trap now costs HALF a heart.
- Wrong Puzzle dots and hidden Puzzle traps also cost HALF a heart.
- Wall/trap mistakes trigger stronger vibration, warning sound, and an 'Ouch!' voice cue when supported by the browser.
- Reaching zero hearts from a half-heart collision does not subtract another full heart.


V3 KEY MISSION FIX
- Level 6-7 now require BOTH the key and the orbs before the exit opens.
- Level 8-9 now require BOTH the key and the switch mission before the exit opens.
- The full-mission route calculator includes the key, so move limits account for collecting it.
- Progress text now shows Key + Orbs / Switches together.


V4 KEY GUARANTEE
- Any mission that requires a key now guarantees a key object is generated.
- If key placement ever fails, the maze regenerates instead of starting without a key.
- Key + Orb and Key + Switch missions are validated before play begins.
- The key remains rendered until the player actually collects it.


V5 SAFE-TRAP ROUTING FIX
- Traps no longer protect only one exact calculated route.
- The game now protects several natural corridors between Start, all mission objectives, and Exit.
- Choke-point / articulation cells are protected from traps.
- A safety zone around Start, keys, orbs, switches, and Exit is also protected.
- This greatly reduces cases where both visible choices are trapped or a hazard is effectively unavoidable.
- Traps are now focused on optional / risky side routes instead of mandatory mission corridors.


V6 BOSS TRAP BALANCE
- Trap placement is now stricter and cleaner.
- Boss rounds use fewer traps overall.
- Traps prefer optional side routes and dead-end / low-degree cells.
- Traps are avoided near Start, Exit, keys, orbs, and switches.
- Traps are spread apart so the board does not look crowded.
- Protected mission corridors are still trap-free.


V7 LIFE REGEN SYSTEM
- First 3 regenerated full hearts in each 24-hour window recover in 3 minutes each.
- After those 3 fast recoveries are used, each next full heart takes 10 minutes.
- The 3-fast-heart allowance resets after 24 hours.
- The timer continues while the game/browser is closed.
- Half-heart damage remains supported, but regeneration restores one full heart at a time.


V8 LUXURY MENU + SKIN THEME SYSTEM
- Uses the generated sunrise spider-city artwork as the main menu background.
- New glossy premium-style main menu UI with centered PLAY button.
- Shop / Skins / Settings / Achievements arranged around PLAY.
- Skin palette now affects both Maze and Web Puzzle.
- Maze and Puzzle use different layouts but the same equipped skin palette.
- Spider sprite tint/glow changes with the equipped skin.
- Added Background Mode:
  AUTO = game backgrounds follow the equipped skin palette.
  MANUAL = use the player's selected background from the shop.
- Main menu retains the cinematic generated background.


V9 MAZE ART + TILE SHOP
- Maze interior is no longer plain white.
- Added subtle artistic web-pattern floor inside the Maze while keeping walls and objectives readable.
- Every Web Puzzle tile visibly carries a web design.
- Added SHOP > TILES category.
- Tile skins have rarities and coin prices.
- Tile skins apply to active puzzle tiles and influence the Maze floor art palette.
- Current tile skins: Classic Web, Neon Web, Ice Web, Fire Web, Galaxy Web.
- Premium tile skin is Coming Soon.
- Equipped tile skin is shared between both game modes.
- Added tile selection to Quick Gear Settings.


V10 CITIES + CLEAN UI
- Added real SHOP > CITIES category with rarity tabs.
- Added 10 user-provided city images as actual game assets.
- Five starter city themes are free.
- City milestones unlock at Levels 10, 20, 30, 40 and 50.
- Newly unlocked milestone city auto-equips.
- Equipped city is shared by Maze and Web Puzzle.
- Equipped spider skin adds a color overlay to the active city background.
- Added original UI icons for Shop, Skins, Settings, Achievements, Levels, Help, Cities, Music and Tiles.
- Replaced coin shortage browser alerts with in-game toast notifications.
- Added UI toasts for unlock/equip/coming-soon events.
- Zero lives now triggers a clear OUT OF LIVES lock notice.
- Main/menu stays responsive and fixed; in-game city background uses cover sizing for phone and desktop.

NOTE:
User-provided city images are bundled as supplied. Before commercial release, keep records of the license/source for each image.


V11 MAIN MENU LAYOUT
- Confirmed center vertical actions: PLAY, LEVELS, HOW TO PLAY.
- Right-side smaller icon-only shortcuts: SHOP, SKINS, SETTINGS, ACHIEVEMENTS.
- Uses the approved portrait spider-city artwork.
- Responsive phone and desktop positioning.
- Keeps the spider visible while placing controls around it.


V12 MENU POLISH
- Removed visible borders from main HUD/menu buttons.
- Centered PLAY / LEVELS / HOW TO PLAY as a true vertical stack.
- Moved Shop / Skins / Settings / Achievements icons higher on the right side.
- Added desktop hover lift/glow effects and touch press feedback.
- Main menu palette now follows the supplied swatches:
  red #E31C2F
  dark red #B51215
  indigo #2D3484
  blue #467BC1
  white #FFFFFF


V13 FIXED
- Right-side quick icons moved higher into the open area.
- PLAY / LEVELS / HOW TO PLAY remain truly centered.
- Background music starts very softly and fades in smoothly.
- Fresh installs start with lower music volume.
- Normal music stays quieter than boss music.


V14 NO-GUIDE PUZZLE FIX
- After memorization ends, ALL target-dot markers are fully hidden.
- Previously completed target dots no longer remain green during hidden play.
- Hidden target cells look like ordinary web tiles.
- Reveal still temporarily shows the target sequence.
- Progress counter remains, but the board itself no longer gives a visual route guide.


V15 OPTIONAL BONUS HEARTS
- Maze and Web Puzzle can randomly spawn one bonus heart.
- Bonus hearts are NEVER required to complete a mission.
- They spawn only when the player is below full lives.
- Spawn chance becomes higher when the player is low on lives.
- Picking one up restores exactly +1 full heart, capped at 5.
- Maze bonus hearts are placed on validated safe mission-route cells, never traps.
- Puzzle bonus hearts appear beside the real route and add a small optional move allowance.
- A maximum of one bonus heart can be collected per round.


V16 ROUND CONTINUATION + PENALTIES
- Maze dead ends / wrong routes do NOT restart the level.
- Maze players can always backtrack and keep solving the same generated level.
- Puzzle wrong target dots now allow the player to stand there, move back, and retry.
- A wrong Puzzle dot still applies the normal half-heart penalty.
- Restarting an unfinished Maze or Puzzle round costs 1 full heart.
- Going Home from an unfinished Maze or Puzzle round costs 1 full heart.
- Confirmation dialogs clearly warn about the 1-heart cost.
- Refreshing/closing the page during an unfinished active round costs 1 full heart on the next load.
- Normal level completion/failure clears the active-round marker so there is no extra refresh penalty afterward.


V17 PUZZLE SAFE BACKTRACKING
- Players may move backward only onto tiles they already successfully passed.
- Revisiting a passed tile is safe: no heart penalty and no illegal-move penalty.
- Sequence progress remains saved while backtracking.
- Hidden red danger tiles still cost half a heart.
- A new unvisited wrong tile still costs the normal wrong-choice penalty.
- After a mistake, the player can recover by moving back through previously passed safe tiles.


V18 MOBILE ICON FIX
- Main-menu SVG icons are duplicated into the root /assets folder to avoid nested-folder deployment problems.
- Main-menu HTML now references /assets/menu-*.svg.
- PLAY no longer uses the Unicode ▶ character, which some iOS/in-app browsers render as an emoji button.
- PLAY now uses a CSS-drawn white triangle.
- Removed icon filters that could make broken/missing images look like white blocks.


V19 MAZE MOVE-BUDGET FIX
- Maze move limits are now calculated from the complete required mission route:
  Start -> every required objective -> Exit.
- Normal maze levels receive a much larger exploration/backtracking allowance.
- The allowance scales with maze size, objective count, traps, and difficulty.
- Level 7-style orb missions now have enough room to collect all orbs and still escape even after reasonable wrong turns.
- Precision levels remain tighter, but only from later levels and still receive a correction allowance.


V20 TRUE MEMORY PUZZLE
- All puzzle levels, including Level 1, now use memory mode.
- Target dots are hidden by default during the 10-second study period.
- Only one target dot appears at a time as it pulses in sequence.
- All target dots hide again before movement unlocks.
- Reveal no longer exposes the whole solution; it only replays the pulse sequence briefly.
- Previously completed safe/path tiles can still remain visible for legal backtracking.


V21 PUZZLE BONUS HEART UPDATE
- Puzzle bonus hearts now spawn directly ON a real sequence dot.
- They never spawn on empty tiles, traps, Start, or Goal.
- The bonus heart remains optional reward behavior and does not add a detour.
- When the player reaches that correct dot, it restores exactly +1 full heart, capped at 5.
- The underlying target dot can stay hidden for the memory challenge while the heart icon itself is visible.


V22 PUZZLE COUNTDOWN UI
- Puzzle memorization shortened from 10 seconds to 6 seconds.
- Countdown number is much larger and placed in a high-contrast red box.
- MEMORIZE — NO MOVING instruction is larger and easier to notice.
- Guidance text below the board is also larger and clearer.


V23 REVEAL BUTTON UI
- Reveal button is larger and more obvious as a real button.
- Added raised button depth, pulse glow, touch press feedback, and desktop hover.
- Remaining reveal count is shown in a high-contrast white badge.
- While Reveal is playing, the button changes to red and the message says REVEAL ACTIVE.
- Disabled Reveal state is visibly faded.


V24 SAME-ROUND TRY AGAIN
- If the player fails and taps TRY AGAIN, the exact same round is restored.
- Maze walls, traps, key, orbs, switches, exit, bonus heart, and move limit keep the same positions.
- Puzzle sequence dots, danger tiles, goal, bonus heart, and move limit keep the same positions.
- The player restarts from the beginning of that same round instead of receiving a newly generated layout.
- This lets the player learn from the failed attempt and figure out how to solve the exact challenge.
- Normal NEXT LEVEL still generates a new round for the next level.


V25 WEB FLYER
- Added a third game: WEB FLYER.
- Original tap-to-glide arcade mode inspired by the general Flappy-style mechanic.
- Tap/click, Space, or Arrow Up to glide upward.
- Gravity pulls the spider downward.
- Avoid web/city barriers and pass through open gates.
- Each passed gate adds 1 score.
- Every 10 gates awards +10 coins.
- Crash costs 1 full heart.
- Restart and Home keep the shared 1-heart penalty.
- Works on mobile and desktop.


V26 WEB FLYER — 30 SECOND MODE
- Web Flyer rounds last 30 seconds.
- Visible countdown from 30 to 0.
- Surviving to 0 completes the round.
- Crash still ends the round early and costs 1 heart.
- Final score is the number of gates passed during the 30 seconds.


V28
GLOBAL LIVES:
- Every missing full heart now regenerates in 30 seconds.
- Removed the old 3-minute / 10-minute life regeneration tiers.

WEB FLYER:
- No lives/hearts are used in Web Flyer.
- Crashing, Restart, Home, and refresh do not remove hearts.
- HUD shows SCORE, TIME, and BEST instead of lives.
- Best score is saved.
- NEW BEST SCORE appears when the record is beaten.
- Added dedicated flap, gate-score, crash, and 30-second-complete sound effects.
- Web Flyer remains a 30-second round.


V29 WEB FLYER — ENDLESS HIGH SCORE MODE
- Removed the 30-second time limit from Web Flyer.
- Web Flyer now continues until the player crashes.
- HUD shows LEVEL / SCORE / BEST.
- BEST score updates immediately whenever the current score passes the saved record.
- Beating the high score does NOT stop or cut the game.
- The player keeps flying and can continue increasing the high score.
- Best score stays saved after crash, restart, home, and reload.
- Web Flyer still uses no lives/hearts.
- Existing flap, gate-score, crash sound effects remain active.


V30 PUZZLE UI FIX
- Removed the duplicated MEMORIZE — NO MOVING text.
- The memorize bar now shows one clean centered instruction only.
- Countdown is larger and isolated on the right.
- Desktop spacing around the puzzle board, Reveal button, instruction text, and bottom controls has been improved.
- Mobile layout remains compact and readable.


V31 MEMORIZE DUPLICATE FIX
- Removed the old HTML MEMORIZE — NO MOVING text entirely.
- Only the styled single memorize label remains.
- Added a CSS safety rule that hides any legacy study-bar span.
- Countdown default updated to 6.
